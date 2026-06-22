import mysql from 'mysql2/promise';
import { env } from './env.js';

// Pool de conexiones MySQL (mysql2/promise) - sin ORM
export const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  port: env.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  decimalNumbers: true, // DECIMAL como número en JS
});

// Verifica la conexión al arrancar
export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log(`✅ MySQL conectado -> ${env.db.database}@${env.db.host}:${env.db.port}`);
  } finally {
    conn.release();
  }
}
