import { NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, explain = false } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'SQL query string is required.' }, { status: 400 });
    }

    const trimmed = query.trim();
    // Safety check: Only allow SELECT, EXPLAIN, WITH queries in the interactive explorer
    if (!/^(SELECT|EXPLAIN|WITH)\b/i.test(trimmed)) {
      return NextResponse.json(
        { error: 'Interactive Query Explorer allows read-only analytical queries (SELECT, EXPLAIN, WITH).' },
        { status: 403 }
      );
    }

    let explainOutput: string[] | null = null;
    if (explain && !trimmed.toLowerCase().startsWith('explain')) {
      try {
        const explainRes = await queryPostgres(`EXPLAIN (ANALYZE, BUFFERS, TIMING) ${trimmed}`);
        explainOutput = explainRes.rows.map(r => r['QUERY PLAN']);
      } catch (err: any) {
        explainOutput = [`Explain failed: ${err.message}`];
      }
    }

    const res = await queryPostgres(trimmed);

    return NextResponse.json({
      success: true,
      query: trimmed,
      columns: res.fields,
      rows: res.rows,
      rowCount: res.rowCount,
      durationMs: res.durationMs,
      explainPlan: explainOutput,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, errorDetail: error.detail || error.hint },
      { status: 400 }
    );
  }
}
