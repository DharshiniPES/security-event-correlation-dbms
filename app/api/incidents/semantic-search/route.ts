import { NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';
import { generateEmbedding, formatVectorForPg } from '@/lib/embedding';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, limit = 5 } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'A search query string is required.' },
        { status: 400 }
      );
    }

    const start = Date.now();
    // 1. Generate 384-dimensional dense vector embedding
    const queryVector = generateEmbedding(query);
    const queryVectorPg = formatVectorForPg(queryVector);

    // 2. Perform Cosine Similarity Search using pgvector's <=> distance operator
    // Formula: Cosine Similarity = 1 - Cosine Distance
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
        u.full_name AS analyst_name,
        ROUND((1 - (inc.embedding <=> $1::vector))::numeric, 4) AS similarity_score,
        ROUND((inc.embedding <=> $1::vector)::numeric, 4) AS cosine_distance
      FROM incidents inc
      LEFT JOIN users u ON inc.assigned_analyst_id = u.user_id
      ORDER BY inc.embedding <=> $1::vector ASC
      LIMIT $2;
    `;

    const res = await queryPostgres(sql, [queryVectorPg, limit]);
    const duration = Date.now() - start;

    return NextResponse.json({
      success: true,
      query,
      vectorDimensions: 384,
      searchLatencyMs: duration,
      resultsCount: res.rowCount,
      results: res.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
