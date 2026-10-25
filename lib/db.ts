import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';

// PostgreSQL Connection Pool Configuration
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'security_event_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function queryPostgres(text: string, params?: any[]) {
  const start = Date.now();
  const client = await pgPool.connect();
  try {
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    return {
      rows: res.rows,
      rowCount: res.rowCount,
      durationMs: duration,
      fields: res.fields?.map(f => f.name) || [],
    };
  } finally {
    client.release();
  }
}

// MongoDB Client Singleton Management
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/security_event_nosql';
const mongoDbName = process.env.MONGODB_DB || 'security_event_nosql';

let cachedMongoClient: MongoClient | null = null;
let cachedMongoDb: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (cachedMongoDb) {
    return cachedMongoDb;
  }
  if (!cachedMongoClient) {
    cachedMongoClient = new MongoClient(mongoUri);
    await cachedMongoClient.connect();
  }
  cachedMongoDb = cachedMongoClient.db(mongoDbName);
  return cachedMongoDb;
}

export { pgPool };
