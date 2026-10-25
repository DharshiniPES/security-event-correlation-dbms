import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { rawId: string } }
) {
  try {
    const rawId = params.rawId;
    if (!rawId) {
      return NextResponse.json({ error: 'Missing raw_log_id parameter' }, { status: 400 });
    }

    const start = Date.now();
    const mongoDb = await getMongoDb();
    const doc = await mongoDb.collection('raw_security_telemetry').findOne({ raw_log_id: rawId });
    const duration = Date.now() - start;

    if (!doc) {
      return NextResponse.json(
        { error: `No unstructured telemetry document found in MongoDB for ID: ${rawId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      storageEngine: 'MongoDB 9.0 (NoSQL Document Store)',
      collection: 'raw_security_telemetry',
      lookupKey: rawId,
      retrievalLatencyMs: duration,
      payload: doc,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
