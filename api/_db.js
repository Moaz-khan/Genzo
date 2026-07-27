// api/_db.js
// Shared database connection — reused by all API functions
import mysql from 'mysql2/promise';

// Validate required environment variables at module load time
const REQUIRED_ENV_VARS = ['TIDB_HOST', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE'];
for (const name of REQUIRED_ENV_VARS) {
  if (!process.env[name]) {
    console.error(`[db] Missing required environment variable: ${name}`);
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[db] Missing required environment variable: JWT_SECRET — authentication endpoints will fail');
}

// TiDB Cloud Serverless CA certificate (TLS across all tiers via publicly-trusted CA).
// Using rejectUnauthorized: true with the system CA bundle should work for most deployments.
// If you encounter SSL handshake failures, set TIDB_CA_CERT to the PEM contents,
// or set TIDB_SKIP_VERIFY=true to disable certificate verification (less secure).
function getSslConfig() {
  if (process.env.TIDB_SKIP_VERIFY === 'true') {
    return { rejectUnauthorized: false };
  }
  if (process.env.TIDB_CA_CERT) {
    return {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
      ca: process.env.TIDB_CA_CERT,
    };
  }
  // Default: trust system CA bundle (works for TiDB Cloud Serverless)
  return {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  };
}

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000'),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: getSslConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

// Helper: run a query and return rows
export async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}
