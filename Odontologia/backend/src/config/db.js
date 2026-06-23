// backend/src/config/db.js
// Pool de conexiones MySQL usando mysql2/promise (MySQL puro, sin ORM).

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'odontoadmin',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  dateStrings: true, // devuelve DATE/DATETIME como string, evita desfase de zona horaria
});

// Verifica la conexión al iniciar el servidor.
async function verificarConexion() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log('✅ Conexión a MySQL establecida correctamente.');
  } finally {
    conn.release();
  }
}

module.exports = { pool, verificarConexion };
