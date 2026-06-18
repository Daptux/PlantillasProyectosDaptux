import mysql from "mysql2/promise";
import { env } from "./env";

/**
 * Pool de conexiones MySQL usando mysql2/promise.
 * Se usa SIEMPRE con consultas preparadas (pool.execute con `?`)
 * para evitar inyeccion SQL.
 */
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

/** Verifica la conexion al arrancar el servidor. */
export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    // eslint-disable-next-line no-console
    console.log(`✅ MySQL conectado: ${env.db.host}:${env.db.port}/${env.db.database}`);
  } finally {
    conn.release();
  }
}
