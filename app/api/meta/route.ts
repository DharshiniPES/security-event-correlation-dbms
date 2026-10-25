import { NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';

export async function GET() {
  try {
    const [hostsRes, usersRes, tacticsRes, deptsRes] = await Promise.all([
      queryPostgres(`SELECT host_id, hostname, ip_address::TEXT, environment, risk_score, is_isolated FROM hosts ORDER BY hostname ASC`),
      queryPostgres(`SELECT user_id, username, full_name, role FROM users WHERE is_active = TRUE ORDER BY full_name ASC`),
      queryPostgres(`SELECT tactic_id, mitre_id, name, base_severity FROM attack_tactics ORDER BY mitre_id ASC`),
      queryPostgres(`SELECT dept_id, dept_name, budget_allocated FROM departments ORDER BY dept_name ASC`),
    ]);

    return NextResponse.json({
      hosts: hostsRes.rows,
      users: usersRes.rows,
      tactics: tacticsRes.rows,
      departments: deptsRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
