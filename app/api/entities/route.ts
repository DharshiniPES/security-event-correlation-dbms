import { NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedTable = searchParams.get('table');

    const queries: Record<string, string> = {
      departments: `
        SELECT dept_id, dept_name, budget_allocated, contact_email, created_at 
        FROM departments 
        ORDER BY dept_id ASC
      `,
      users: `
        SELECT u.user_id, u.username, u.full_name, u.email, u.role, d.dept_name, u.failed_logins, u.is_active, u.created_at 
        FROM users u 
        LEFT JOIN departments d ON u.dept_id = d.dept_id 
        ORDER BY u.user_id ASC
      `,
      hosts: `
        SELECT h.host_id, h.hostname, h.ip_address::TEXT AS ip_address, h.os_type, h.environment, h.risk_score, h.is_isolated, d.dept_name, h.last_seen 
        FROM hosts h 
        LEFT JOIN departments d ON h.dept_id = d.dept_id 
        ORDER BY h.host_id ASC
      `,
      attack_tactics: `
        SELECT tactic_id, mitre_id, name, kill_chain_phase, base_severity, description 
        FROM attack_tactics 
        ORDER BY tactic_id ASC
      `,
      security_events: `
        SELECT se.event_id, h.hostname, u.username, at.mitre_id, se.event_type, se.source_ip::TEXT AS source_ip, se.dest_ip::TEXT AS dest_ip, se.severity, se.event_status, se.raw_log_id, se.event_timestamp 
        FROM security_events se 
        LEFT JOIN hosts h ON se.host_id = h.host_id 
        LEFT JOIN users u ON se.user_id = u.user_id 
        LEFT JOIN attack_tactics at ON se.tactic_id = at.tactic_id 
        ORDER BY se.event_id ASC 
        LIMIT 100
      `,
      incidents: `
        SELECT i.incident_id, i.incident_code, i.title, i.priority, i.status, u.full_name AS assigned_analyst, i.resolution_notes, i.created_at, i.resolved_at 
        FROM incidents i 
        LEFT JOIN users u ON i.assigned_analyst_id = u.user_id 
        ORDER BY i.incident_id ASC
      `,
      incident_event_mapping: `
        SELECT iem.mapping_id, inc.incident_code, iem.event_id, se.event_type, iem.correlation_confidence, iem.mapped_at 
        FROM incident_event_mapping iem 
        JOIN incidents inc ON iem.incident_id = inc.incident_id 
        JOIN security_events se ON iem.event_id = se.event_id 
        ORDER BY iem.mapping_id ASC
      `,
      remediation_audit: `
        SELECT ra.audit_id, inc.incident_code, u.username AS performed_by, ra.action_type, ra.execution_status, ra.remarks, ra.executed_at 
        FROM remediation_audit ra 
        LEFT JOIN incidents inc ON ra.incident_id = inc.incident_id 
        LEFT JOIN users u ON ra.performed_by = u.user_id 
        ORDER BY ra.audit_id ASC
      `,
    };

    if (requestedTable && queries[requestedTable]) {
      const res = await queryPostgres(queries[requestedTable]);
      return NextResponse.json({
        table: requestedTable,
        count: res.rowCount,
        data: res.rows,
      });
    }

    // Otherwise return all 8 tables
    const results: Record<string, { count: number; data: any[] }> = {};
    for (const [table, sql] of Object.entries(queries)) {
      const res = await queryPostgres(sql);
      results[table] = {
        count: res.rowCount,
        data: res.rows,
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      entities: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
