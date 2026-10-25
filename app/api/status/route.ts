import { NextResponse } from 'next/server';
import { queryPostgres, getMongoDb } from '@/lib/db';

export async function GET() {
  try {
    const pgStart = Date.now();
    const pgRes = await queryPostgres(`
      SELECT 
        (SELECT COUNT(*) FROM departments) AS total_departments,
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM hosts) AS total_hosts,
        (SELECT COUNT(*) FROM attack_tactics) AS total_tactics,
        (SELECT COUNT(*) FROM security_events) AS total_events,
        (SELECT COUNT(*) FROM incidents) AS total_incidents,
        (SELECT COUNT(*) FROM remediation_audit) AS total_audits,
        (SELECT extname FROM pg_extension WHERE extname = 'vector') AS pgvector_status
    `);
    const pgDuration = Date.now() - pgStart;

    const mongoStart = Date.now();
    const mongoDb = await getMongoDb();
    const telemetryCount = await mongoDb.collection('raw_security_telemetry').countDocuments();
    const threatIntelCount = await mongoDb.collection('threat_intel_feed').countDocuments();
    const mongoDuration = Date.now() - mongoStart;

    return NextResponse.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      rdbms: {
        engine: 'PostgreSQL 17',
        connected: true,
        latencyMs: pgDuration,
        stats: pgRes.rows[0],
        vectorExtension: !!pgRes.rows[0]?.pgvector_status,
      },
      nosql: {
        engine: 'MongoDB 9.0',
        connected: true,
        latencyMs: mongoDuration,
        collections: {
          raw_security_telemetry: telemetryCount,
          threat_intel_feed: threatIntelCount,
        },
      },
      authors: [
        { name: 'Dharshini V', prn: 'PES1UG24AM428', role: 'Database Architecture & Security Constraints' },
        { name: 'Dhruv Rajagopalan', prn: 'PES1UG24AM086', role: 'Polyglot Integration & Vector Search' },
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'DEGRADED', error: error.message },
      { status: 500 }
    );
  }
}
