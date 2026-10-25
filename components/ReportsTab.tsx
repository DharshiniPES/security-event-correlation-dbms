'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  ShieldAlert, 
  HardDrive, 
  Users, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';

interface ReportsTabProps {
  reports: any;
  loading: boolean;
  onRefresh: () => void;
}

export default function ReportsTab({
  reports,
  loading,
  onRefresh,
}: ReportsTabProps) {
  const [activeReportSubTab, setActiveReportSubTab] = useState<'dept' | 'mitre' | 'subquery' | 'analyst' | 'nosql'>('dept');

  const deptData = reports?.departmentPosture?.data || [];
  const mitreData = reports?.mitreAttackSurface?.data || [];
  const subqueryData = reports?.highRiskAnomalyReport?.data || [];
  const analystData = reports?.analystPerformance?.data || [];
  const nosqlData = reports?.noSqlTelemetryMetrics?.data || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner: Reports Requirement Alignment */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Departmental Aggregations & Metrics
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                Complex SQL Aggregations & Views
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Analytical Reports & Aggregation Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Demonstrates complex SQL DML operations including <code className="text-cyan-400">JOIN</code>, <code className="text-cyan-400">GROUP BY</code>, 
              <code className="text-cyan-400">HAVING</code>, aggregate functions (<code className="text-cyan-400">AVG</code>, <code className="text-cyan-400">MAX</code>, <code className="text-cyan-400">COUNT</code>), 
              correlated subqueries, and MongoDB pipeline aggregations.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 font-mono">Parallel Example:</span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono font-bold">
              Avg Risk / Department
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveReportSubTab('dept')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'dept'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Department Posture & Budget Allocation</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('mitre')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'mitre'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>MITRE Attack Surface</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('subquery')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'subquery'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Correlated Subquery & HAVING</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('analyst')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'analyst'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>SOC Analyst SLA Performance</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('nosql')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'nosql'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>MongoDB NoSQL Pipeline</span>
        </button>
      </div>

      {/* Sub-tab 1: Department Security Posture (Primary Syllabus Checkpoint) */}
      {activeReportSubTab === 'dept' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                  <span>Report 1: Department Security Posture & Budget Allocation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Backed by PostgreSQL View <code className="text-cyan-400">vw_department_security_posture</code> with departmental risk aggregations.
                </p>
              </div>

              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
                SQL: <code className="text-amber-400">GROUP BY d.dept_id, d.dept_name, d.budget_allocated</code>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 font-semibold text-left">
                    <th className="py-3 px-3 font-sans">Department Name</th>
                    <th className="py-3 px-3">Budget Allocated</th>
                    <th className="py-3 px-3">Users</th>
                    <th className="py-3 px-3">Hosts</th>
                    <th className="py-3 px-3 text-cyan-400">Avg Host Risk (AVG)</th>
                    <th className="py-3 px-3 text-rose-400">Max Host Risk (MAX)</th>
                    <th className="py-3 px-3">Total Events</th>
                    <th className="py-3 px-3">Critical Events</th>
                    <th className="py-3 px-3">Active Incidents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deptData.map((row: any) => (
                    <tr key={row.dept_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-sans font-bold text-white">{row.dept_name}</td>
                      <td className="py-3 px-3 text-slate-300">
                        ${parseFloat(row.budget_allocated).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{row.total_users}</td>
                      <td className="py-3 px-3 text-slate-300">{row.total_hosts}</td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                          {row.avg_host_risk_score}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          {row.max_host_risk_score}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{row.total_security_events}</td>
                      <td className="py-3 px-3 text-amber-300 font-bold">{row.critical_high_events}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">
                          {row.active_incidents}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SQL Behind the View Card */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
              <span className="text-slate-400 font-semibold block mb-1">Underlying Relational Query Definition:</span>
              <pre className="text-cyan-300 font-mono text-[11px] overflow-x-auto whitespace-pre">
{`SELECT 
    d.dept_name,
    d.budget_allocated,
    COUNT(DISTINCT u.user_id) AS total_users,
    COUNT(DISTINCT h.host_id) AS total_hosts,
    ROUND(AVG(COALESCE(h.risk_score, 0)), 2) AS avg_host_risk_score,
    MAX(COALESCE(h.risk_score, 0)) AS max_host_risk_score,
    COUNT(se.event_id) AS total_security_events,
    COUNT(CASE WHEN se.severity IN ('HIGH', 'CRITICAL') THEN 1 END) AS critical_high_events,
    COUNT(DISTINCT inc.incident_id) AS active_incidents
FROM departments d
LEFT JOIN users u ON d.dept_id = u.dept_id
LEFT JOIN hosts h ON d.dept_id = h.dept_id
LEFT JOIN security_events se ON h.host_id = se.host_id
LEFT JOIN incident_event_mapping iem ON se.event_id = iem.event_id
LEFT JOIN incidents inc ON iem.incident_id = inc.incident_id AND inc.status NOT IN ('RESOLVED', 'CLOSED')
GROUP BY d.dept_id, d.dept_name, d.budget_allocated;`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: MITRE ATT&CK Surface */}
      {activeReportSubTab === 'mitre' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>Report 2: MITRE ATT&CK Surface Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregates detection frequencies and pending alerts grouped by attack tactics and kill chain phases.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              View: <code className="text-cyan-400">vw_mitre_attack_surface</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3">MITRE ID</th>
                  <th className="py-3 px-3 font-sans">Tactic Name</th>
                  <th className="py-3 px-3 font-sans">Kill Chain Phase</th>
                  <th className="py-3 px-3">Base Severity</th>
                  <th className="py-3 px-3">Total Detections</th>
                  <th className="py-3 px-3">Affected Hosts</th>
                  <th className="py-3 px-3">Pending Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mitreData.map((row: any) => (
                  <tr key={row.tactic_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-cyan-400 font-bold">{row.mitre_id}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-white">{row.tactic_name}</td>
                    <td className="py-3 px-3 font-sans text-slate-400">{row.kill_chain_phase}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        row.base_severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {row.base_severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{row.total_detections}</td>
                    <td className="py-3 px-3 text-slate-300">{row.affected_hosts_count}</td>
                    <td className="py-3 px-3 text-rose-400 font-bold">{row.pending_alerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Correlated Subquery & HAVING Clause */}
      {activeReportSubTab === 'subquery' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <span>Report 3: Correlated Subquery & HAVING Constraint</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Isolates anomalous hosts whose risk score is &gt;= the environment average and possess active unresolved critical events.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              Query: <code className="text-amber-400">HAVING COUNT(se.event_id) &gt;= 1</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3 font-sans">Hostname</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Environment</th>
                  <th className="py-3 px-3 text-amber-400">Host Risk</th>
                  <th className="py-3 px-3 text-slate-400">Environment Avg Risk</th>
                  <th className="py-3 px-3">Critical Events</th>
                  <th className="py-3 px-3">Network Isolation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subqueryData.map((row: any) => (
                  <tr key={row.host_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-sans font-bold text-white">{row.hostname}</td>
                    <td className="py-3 px-3 text-slate-300">{row.ip_address}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {row.environment}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-amber-400">{row.risk_score}</td>
                    <td className="py-3 px-3 text-slate-400">{row.env_avg_risk}</td>
                    <td className="py-3 px-3 font-bold text-rose-400">{row.critical_event_count}</td>
                    <td className="py-3 px-3">
                      {row.is_isolated ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                          QUARANTINED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-semibold block mb-1">Demonstrated SQL Construct (Correlated Subquery):</span>
            <pre className="text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre">
{`SELECT 
    h.hostname,
    h.ip_address,
    h.environment,
    h.risk_score,
    ROUND((SELECT AVG(h2.risk_score) FROM hosts h2 WHERE h2.environment = h.environment), 2) AS env_avg_risk,
    COUNT(se.event_id) AS critical_event_count
FROM hosts h
JOIN security_events se ON h.host_id = se.host_id
WHERE se.severity IN ('HIGH', 'CRITICAL') AND se.event_status != 'RESOLVED'
GROUP BY h.host_id, h.hostname, h.ip_address, h.environment, h.risk_score, h.is_isolated
HAVING COUNT(se.event_id) >= 1
ORDER BY h.risk_score DESC;`}
            </pre>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Analyst Workload & Resolution Metrics */}
      {activeReportSubTab === 'analyst' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span>Report 4: SOC Analyst Workload & Mean Resolution Time</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Measures incident triage capacity and calculates average resolution hours using PostgreSQL epoch intervals.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              View: <code className="text-cyan-400">vw_analyst_workload</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3 font-sans">Analyst Full Name</th>
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-3">Assigned Incidents</th>
                  <th className="py-3 px-3 text-amber-400">Active Cases</th>
                  <th className="py-3 px-3 text-emerald-400">Resolved Cases</th>
                  <th className="py-3 px-3 text-cyan-400">Avg Resolution Time (Hours)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analystData.map((row: any) => (
                  <tr key={row.user_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-sans font-bold text-white">{row.full_name}</td>
                    <td className="py-3 px-3 text-slate-400">{row.username}</td>
                    <td className="py-3 px-3 text-slate-200">{row.assigned_incidents}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{row.active_cases}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{row.resolved_cases}</td>
                    <td className="py-3 px-3 font-extrabold text-cyan-400">
                      {row.avg_resolution_hours ? `${row.avg_resolution_hours} hrs` : 'N/A (Active)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 5: MongoDB NoSQL Pipeline Aggregation */}
      {activeReportSubTab === 'nosql' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-emerald-400" />
                <span>Report 5: MongoDB NoSQL Aggregation Pipeline</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregates heterogeneous raw telemetry payloads by transport protocol, calculating average content lengths and sensor density.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              Pipeline: <code className="text-emerald-400">$group &rarr; $project &rarr; $sort</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3">Protocol Type</th>
                  <th className="py-3 px-3">Total Ingested Packets</th>
                  <th className="py-3 px-3 text-emerald-400">Avg Content-Length (Bytes)</th>
                  <th className="py-3 px-3">Unique Sensors Active</th>
                  <th className="py-3 px-3">Payload Sample Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {nosqlData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white">{row.protocol}</td>
                    <td className="py-3 px-3 text-slate-200">{row.totalEvents}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-400">{row.avgPayloadLength} bytes</td>
                    <td className="py-3 px-3 text-cyan-400 font-bold">{row.sensorCount} sensors</td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{row.samplePayloadSnippet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-semibold block mb-1">Demonstrated MongoDB Aggregation Pipeline:</span>
            <pre className="text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre">
{`db.raw_security_telemetry.aggregate([
  {
    $group: {
      _id: "$protocol",
      totalEvents: { $sum: 1 },
      avgPayloadLength: { $avg: "$headers.content-length" },
      uniqueSensors: { $addToSet: "$sensor_id" },
      samplePayloadSnippet: { $first: "$payload_hex" }
    }
  },
  {
    $project: {
      protocol: "$_id",
      totalEvents: 1,
      avgPayloadLength: { $round: ["$avgPayloadLength", 2] },
      sensorCount: { $size: "$uniqueSensors" },
      samplePayloadSnippet: 1
    }
  },
  { $sort: { totalEvents: -1 } }
]);`}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
