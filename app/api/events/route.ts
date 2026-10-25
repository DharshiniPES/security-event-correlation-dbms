import { NextResponse } from 'next/server';
import { queryPostgres, getMongoDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const hostId = searchParams.get('host_id');

    let query = `
      SELECT 
        se.event_id,
        se.event_type,
        se.severity,
        se.event_status,
        se.source_ip::TEXT AS source_ip,
        se.dest_ip::TEXT AS dest_ip,
        se.raw_log_id,
        se.event_timestamp,
        h.host_id,
        h.hostname,
        h.environment,
        h.risk_score AS host_risk_score,
        h.is_isolated AS host_is_isolated,
        u.user_id,
        u.username,
        u.full_name AS user_full_name,
        t.tactic_id,
        t.mitre_id,
        t.name AS tactic_name
      FROM security_events se
      JOIN hosts h ON se.host_id = h.host_id
      LEFT JOIN users u ON se.user_id = u.user_id
      LEFT JOIN attack_tactics t ON se.tactic_id = t.tactic_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (severity && severity !== 'ALL') {
      params.push(severity);
      query += ` AND se.severity = $${params.length}`;
    }
    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND se.event_status = $${params.length}`;
    }
    if (hostId) {
      params.push(parseInt(hostId, 10));
      query += ` AND se.host_id = $${params.length}`;
    }

    query += ` ORDER BY se.event_timestamp DESC LIMIT 100`;

    const res = await queryPostgres(query, params);
    return NextResponse.json({
      events: res.rows,
      count: res.rowCount,
      durationMs: res.durationMs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      host_id,
      user_id,
      tactic_id,
      event_type,
      source_ip,
      dest_ip,
      severity,
      raw_payload,
      protocol = 'HTTPS',
    } = body;

    if (!host_id || !event_type || !source_ip || !dest_ip || !severity) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: host_id, event_type, source_ip, dest_ip, severity' },
        { status: 400 }
      );
    }

    const rawLogId = `RAW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Dual-Store Write: Store Raw Unstructured Payload in MongoDB (NoSQL)
    const mongoDb = await getMongoDb();
    await mongoDb.collection('raw_security_telemetry').insertOne({
      raw_log_id: rawLogId,
      sensor_id: 'live-web-ingest-sensor',
      protocol,
      payload_raw: raw_payload || `Live Event Ingestion: ${event_type}`,
      headers: {
        'source-agent': 'CyberPulse NextJS Ingest API',
        'content-type': 'application/json',
      },
      system_call_trace: [
        { syscall: 'recvfrom', target: dest_ip, timestamp: new Date().toISOString() },
      ],
      unstructured_tags: ['live_ingest', severity.toLowerCase(), 'auto_correlated'],
      ingested_at: new Date(),
    });

    // 2. Insert Structured Event into PostgreSQL (Triggers fn_calculate_host_risk automatically!)
    const insertSql = `
      INSERT INTO security_events (
        host_id, user_id, tactic_id, event_type, source_ip, dest_ip, severity, event_status, raw_log_id, event_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'UNRESOLVED', $8, CURRENT_TIMESTAMP)
      RETURNING event_id, event_type, severity, host_id, raw_log_id, event_timestamp;
    `;
    const res = await queryPostgres(insertSql, [
      host_id,
      user_id || null,
      tactic_id || null,
      event_type,
      source_ip,
      dest_ip,
      severity,
      rawLogId,
    ]);

    // 3. Retrieve updated host risk status from PostgreSQL (demonstrates trigger execution)
    const hostCheck = await queryPostgres(
      `SELECT host_id, hostname, risk_score, is_isolated FROM hosts WHERE host_id = $1`,
      [host_id]
    );

    return NextResponse.json({
      success: true,
      event: res.rows[0],
      triggerEffect: {
        message: 'PostgreSQL Trigger trg_security_event_risk executed autonomously.',
        updatedHost: hostCheck.rows[0],
      },
      rawLogId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
