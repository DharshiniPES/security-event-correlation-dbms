import { NextResponse } from 'next/server';
import { queryPostgres, getMongoDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Departmental Security Posture (Parallel to "Average salary of every department")
    const deptRes = await queryPostgres(`
      SELECT * FROM vw_department_security_posture ORDER BY budget_allocated DESC;
    `);

    // 2. MITRE ATT&CK Threat Detection Matrix
    const tacticRes = await queryPostgres(`
      SELECT * FROM vw_mitre_attack_surface ORDER BY total_detections DESC;
    `);

    // 3. Host Risk & Threat Exposure Analysis
    const hostRes = await queryPostgres(`
      SELECT * FROM vw_host_risk_analysis ORDER BY risk_score DESC;
    `);

    // 4. SOC Analyst SLA & Workload Performance
    const analystRes = await queryPostgres(`
      SELECT * FROM vw_analyst_workload ORDER BY active_cases DESC;
    `);

    // 5. Advanced Subquery Report (JOIN + GROUP BY + HAVING + Correlated Subquery)
    const subqueryRes = await queryPostgres(`
      SELECT 
        h.host_id,
        h.hostname,
        h.ip_address::TEXT AS ip_address,
        h.environment,
        h.risk_score,
        h.is_isolated,
        ROUND((SELECT AVG(h2.risk_score) FROM hosts h2 WHERE h2.environment = h.environment), 2) AS env_avg_risk,
        COUNT(se.event_id) AS critical_event_count
      FROM hosts h
      JOIN security_events se ON h.host_id = se.host_id
      WHERE se.severity IN ('HIGH', 'CRITICAL')
        AND se.event_status != 'RESOLVED'
      GROUP BY h.host_id, h.hostname, h.ip_address, h.environment, h.risk_score, h.is_isolated
      HAVING COUNT(se.event_id) >= 1
      ORDER BY h.risk_score DESC;
    `);

    // 6. Severity Distribution Graph Data (CRITICAL vs HIGH vs MEDIUM vs LOW)
    const severityRes = await queryPostgres(`
      SELECT 
        severity,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM security_events), 0), 1) AS percentage
      FROM security_events
      GROUP BY severity
      ORDER BY 
        CASE severity 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'HIGH' THEN 2 
          WHEN 'MEDIUM' THEN 3 
          ELSE 4 
        END;
    `);

    // 7. Active Trigger Cut-off & Severed Telemetry Notification Feed
    const cutoffRes = await queryPostgres(`
      SELECT 
        h.host_id,
        h.hostname,
        h.ip_address::TEXT AS ip_address,
        h.environment,
        h.risk_score,
        h.is_isolated,
        h.last_seen,
        d.dept_name,
        COUNT(se.event_id) AS total_events,
        COUNT(CASE WHEN se.severity = 'CRITICAL' THEN 1 END) AS critical_events,
        COUNT(CASE WHEN se.severity = 'HIGH' THEN 1 END) AS high_events,
        MAX(se.event_timestamp) AS last_threat_timestamp,
        CASE 
          WHEN h.is_isolated = TRUE THEN 'Host network traffic severed: Cumulative risk exceeded threshold (>= 75.00). Database trigger trg_security_event_risk executed quarantine.'
          ELSE 'Host monitored: Approaching elevated threat threshold.'
        END AS cutoff_reason
      FROM hosts h
      LEFT JOIN departments d ON h.dept_id = d.dept_id
      LEFT JOIN security_events se ON h.host_id = se.host_id
      WHERE h.is_isolated = TRUE OR h.risk_score >= 50.00
      GROUP BY h.host_id, h.hostname, h.ip_address, h.environment, h.risk_score, h.is_isolated, h.last_seen, d.dept_name
      ORDER BY h.is_isolated DESC, h.risk_score DESC;
    `);

    // 8. NoSQL Aggregation Pipeline (MongoDB)
    const mongoDb = await getMongoDb();
    const nosqlAgg = await mongoDb.collection('raw_security_telemetry').aggregate([
      {
        $group: {
          _id: '$protocol',
          totalEvents: { $sum: 1 },
          avgPayloadLength: { $avg: '$headers.content-length' },
          uniqueSensors: { $addToSet: '$sensor_id' },
          samplePayloadSnippet: { $first: '$payload_hex' },
        },
      },
      {
        $project: {
          protocol: '$_id',
          totalEvents: 1,
          avgPayloadLength: { $round: ['$avgPayloadLength', 2] },
          sensorCount: { $size: '$uniqueSensors' },
          samplePayloadSnippet: 1,
        },
      },
      { $sort: { totalEvents: -1 } },
    ]).toArray();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reports: {
        departmentPosture: {
          title: 'Department Security Posture & Budget Analysis',
          description: 'Departmental asset allocation, average and maximum host risk scores, and active incidents.',
          data: deptRes.rows,
        },
        mitreAttackSurface: {
          title: 'MITRE ATT&CK Surface Breakdown',
          description: 'Kill-chain detection frequency, affected hosts, and unresolved alert volume by attack tactic.',
          data: tacticRes.rows,
        },
        hostThreatAnalysis: {
          title: 'Monitored Host Threat Matrix',
          description: 'Host-level risk scores, network isolation status, and critical event distributions.',
          data: hostRes.rows,
        },
        analystPerformance: {
          title: 'SOC Analyst Incident Workload & Mean Resolution Time',
          description: 'Analyst caseload, resolved investigations, and average hours to resolution.',
          data: analystRes.rows,
        },
        highRiskAnomalyReport: {
          title: 'Correlated Subquery: Anomalous Hosts Exceeding Environment Risk',
          description: 'Complex SQL using correlated subqueries and HAVING filter to isolate abnormal host risk against departmental baselines.',
          data: subqueryRes.rows,
        },
        severityDistribution: {
          title: 'Risk Severity Distribution (High, Medium, Low & Critical)',
          description: 'Quantified distribution and percentage ratios across threat severity classifications.',
          data: severityRes.rows,
        },
        triggerCutoffTelemetry: {
          title: 'Autonomous Trigger Cut-Off & Severed Telemetry Notification Feed',
          description: 'Real-time telemetry feeds that have been quarantined or cut off by the database trigger engine.',
          data: cutoffRes.rows,
        },
        noSqlTelemetryMetrics: {
          title: 'MongoDB NoSQL Pipeline Aggregation',
          description: 'Aggregates heterogeneous telemetry packet sizes, protocol distribution, and active sensor nodes.',
          data: nosqlAgg,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
