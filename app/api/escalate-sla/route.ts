import { NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slaHours = body.sla_hours || 1;

    // Stored Procedure Call in PostgreSQL
    const res = await queryPostgres(
      `CALL sp_auto_escalate_incidents($1, 0);`,
      [slaHours]
    );

    const escalatedCount = res.rows[0]?.p_escalated_count || 0;

    // Fetch the audit logs recorded by the stored procedure
    const auditRes = await queryPostgres(`
      SELECT audit_id, incident_id, action_type, execution_status, remarks, executed_at
      FROM remediation_audit
      WHERE action_type = 'AUTO_SLA_ESCALATION'
      ORDER BY executed_at DESC
      LIMIT 10;
    `);

    return NextResponse.json({
      success: true,
      message: `Executed Stored Procedure sp_auto_escalate_incidents with ${slaHours}h SLA threshold.`,
      escalatedCount,
      recentEscalations: auditRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
