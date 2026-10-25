import { NextResponse } from 'next/server';
import { queryPostgres, pgPool } from '@/lib/db';
import { generateEmbedding, formatVectorForPg } from '@/lib/embedding';

export async function GET() {
  try {
    const sql = `
      SELECT 
        inc.incident_id,
        inc.incident_code,
        inc.title,
        inc.description,
        inc.priority,
        inc.status,
        inc.resolution_notes,
        inc.created_at,
        inc.resolved_at,
        u.user_id AS analyst_id,
        u.username AS analyst_username,
        u.full_name AS analyst_name,
        COUNT(iem.event_id) AS correlated_event_count,
        ARRAY_AGG(iem.event_id) FILTER (WHERE iem.event_id IS NOT NULL) AS correlated_event_ids
      FROM incidents inc
      LEFT JOIN users u ON inc.assigned_analyst_id = u.user_id
      LEFT JOIN incident_event_mapping iem ON inc.incident_id = iem.incident_id
      GROUP BY 
        inc.incident_id, inc.incident_code, inc.title, inc.description,
        inc.priority, inc.status, inc.resolution_notes, inc.created_at, inc.resolved_at,
        u.user_id, u.username, u.full_name
      ORDER BY 
        CASE inc.priority 
          WHEN 'P1-CRITICAL' THEN 1 
          WHEN 'P2-HIGH' THEN 2 
          WHEN 'P3-MEDIUM' THEN 3 
          ELSE 4 
        END,
        inc.created_at DESC;
    `;
    const res = await queryPostgres(sql);
    return NextResponse.json({ incidents: res.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const client = await pgPool.connect();
  try {
    const body = await request.json();
    const {
      title,
      description,
      priority,
      assigned_analyst_id,
      event_ids = [],
      host_id,
    } = body;

    if (!title || !description || !priority) {
      return NextResponse.json(
        { error: 'Title, description, and priority are required.' },
        { status: 400 }
      );
    }

    // ACID Multi-Table Transaction
    await client.query('BEGIN');

    const code = `INC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const embeddingVec = generateEmbedding(`${title} ${description}`);
    const embeddingPg = formatVectorForPg(embeddingVec);

    // 1. Insert Incident with pgvector Dense Embedding
    const insertIncSql = `
      INSERT INTO incidents (incident_code, title, description, priority, status, assigned_analyst_id, embedding)
      VALUES ($1, $2, $3, $4, 'OPEN', $5, $6::vector)
      RETURNING incident_id, incident_code, title, priority, status, created_at;
    `;
    const incRes = await client.query(insertIncSql, [
      code,
      title,
      description,
      priority,
      assigned_analyst_id || null,
      embeddingPg,
    ]);
    const createdIncident = incRes.rows[0];

    // 2. Map Correlated Events and Update Event Status
    for (const eid of event_ids) {
      await client.query(
        `INSERT INTO incident_event_mapping (incident_id, event_id, correlation_confidence)
         VALUES ($1, $2, 0.95) ON CONFLICT (incident_id, event_id) DO NOTHING`,
        [createdIncident.incident_id, eid]
      );
      await client.query(
        `UPDATE security_events SET event_status = 'CORRELATED' WHERE event_id = $1`,
        [eid]
      );
    }

    // 3. Automated Containment for Critical Incidents
    if (priority === 'P1-CRITICAL' && host_id) {
      await client.query(`UPDATE hosts SET is_isolated = TRUE WHERE host_id = $1`, [host_id]);
      await client.query(
        `INSERT INTO remediation_audit (incident_id, performed_by, action_type, execution_status, remarks)
         VALUES ($1, $2, 'CONTAINMENT_ISOLATION', 'SUCCESS', $3)`,
        [
          createdIncident.incident_id,
          assigned_analyst_id || null,
          `Host ${host_id} quarantined automatically under Critical Incident declaration.`,
        ]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Incident created atomically within ACID transaction.',
      incident: createdIncident,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { incident_id, status, resolution_notes } = body;

    if (!incident_id || !status) {
      return NextResponse.json(
        { error: 'incident_id and status are required' },
        { status: 400 }
      );
    }

    // Notice: The trigger trg_validate_incident_closure will fire here!
    // If status is 'RESOLVED' or 'CLOSED' and resolution_notes is too short,
    // the trigger throws an exception that will be caught and returned.
    const sql = `
      UPDATE incidents
      SET status = $1,
          resolution_notes = $2
      WHERE incident_id = $3
      RETURNING incident_id, incident_code, status, resolution_notes, resolved_at;
    `;
    const res = await queryPostgres(sql, [status, resolution_notes || null, incident_id]);

    return NextResponse.json({
      success: true,
      incident: res.rows[0],
    });
  } catch (error: any) {
    // Database trigger error is caught here
    return NextResponse.json(
      { error: error.message, isTriggerViolation: error.message.includes('Constraint Violation') },
      { status: 400 }
    );
  }
}
