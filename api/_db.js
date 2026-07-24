// api/_db.js
// Shared database connection — reused by all API functions
import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000'),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        // TiDB Cloud requires SSL
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

// Helper: run a query and return rows
export async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}
