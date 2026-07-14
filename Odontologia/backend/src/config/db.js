// backend/src/config/db.js
// Capa de acceso a PostgreSQL con una API compatible con mysql2/promise.
//
// El resto del código (controladores) fue escrito para mysql2 usando:
//   const [rows]   = await pool.query('SELECT ... WHERE x = ?', [x]);   // -> rows
//   const [result] = await pool.query('INSERT ...', [...]);             // -> result.insertId / result.affectedRows
//   const conn = await pool.getConnection(); conn.beginTransaction()... // transacciones
//
// Este módulo traduce esas llamadas a Postgres (node-pg) sin tener que
// reescribir las ~100 consultas: convierte los placeholders `?` -> `$n`,
// emula `insertId`/`affectedRows` y expone `getConnection()` para transacciones.

const { Pool, types } = require('pg');
require('dotenv').config();

// --- Parseo de tipos para imitar el comportamiento de mysql2 ---
// DATE/TIME/TIMESTAMP como string (equivalente a dateStrings: true).
types.setTypeParser(1082, (v) => v); // date         -> 'YYYY-MM-DD'
types.setTypeParser(1083, (v) => v); // time         -> 'HH:MM:SS'
types.setTypeParser(1114, (v) => v); // timestamp    -> 'YYYY-MM-DD HH:MM:SS'
types.setTypeParser(1184, (v) => v); // timestamptz
// COUNT() y BIGINT como número (mysql2 devuelve números, no strings).
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // int8/bigint

// --- Configuración de conexión ---
// En Vercel Postgres/Neon suele venir como POSTGRES_URL; en local, DATABASE_URL
// o variables discretas.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

function construirConfig() {
  const base = {
    max: Number(process.env.DB_CONNECTION_LIMIT) || 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  };
  if (connectionString) {
    const requiereSsl =
      /sslmode=require|neon\.tech|vercel|supabase|render\.com|amazonaws|pooler/i.test(connectionString) ||
      process.env.PGSSL === 'true';
    return {
      ...base,
      connectionString,
      ssl: requiereSsl ? { rejectUnauthorized: false } : false,
    };
  }
  // Desarrollo local con Postgres discreto.
  return {
    ...base,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'odontoadmin',
  };
}

// Pool reutilizado entre invocaciones serverless (evita agotar conexiones).
const pgPool = global.__odontoPgPool || new Pool(construirConfig());
if (!global.__odontoPgPool) {
  global.__odontoPgPool = pgPool;
  pgPool.on('error', (err) => console.error('Error inesperado en el pool de PostgreSQL:', err.message));
}

// --- Traducción de SQL estilo MySQL -> Postgres ---
function traducirSql(sql) {
  let indice = 0;
  // 1) '?' -> '$1', '$2', ...  (en estas consultas '?' solo aparece como placeholder)
  let out = sql.replace(/\?/g, () => `$${++indice}`);
  // 2) LIKE -> ILIKE  (MySQL es case-insensitive por defecto; se mantiene la búsqueda)
  out = out.replace(/\bLIKE\b/gi, 'ILIKE');
  return out;
}

const esInsert = (sql) => /^\s*INSERT\s/i.test(sql);
const tieneReturning = (sql) => /\bRETURNING\b/i.test(sql);

// Da al resultado de node-pg la forma que espera el código escrito para mysql2.
function moldearResultado(result) {
  const cmd = result.command; // SELECT | INSERT | UPDATE | DELETE | ...
  if (cmd === 'INSERT' || cmd === 'UPDATE' || cmd === 'DELETE') {
    const header = {
      affectedRows: result.rowCount || 0,
      rowCount: result.rowCount || 0,
      insertId: (result.rows && result.rows[0] && result.rows[0].id) || 0,
      rows: result.rows || [],
    };
    return [header, result.fields];
  }
  return [result.rows, result.fields];
}

async function ejecutar(cliente, sql, params = []) {
  let texto = traducirSql(sql);
  // Recupera insertId al estilo MySQL añadiendo RETURNING id a los INSERT
  // (todas las tablas destino tienen columna `id`).
  if (esInsert(sql) && !tieneReturning(sql)) {
    texto = texto.replace(/;\s*$/, '') + ' RETURNING id';
  }
  const result = await cliente.query(texto, params);
  return moldearResultado(result);
}

// --- API pública compatible con mysql2/promise ---
const pool = {
  query: (sql, params) => ejecutar(pgPool, sql, params),

  // Conexión dedicada para transacciones.
  getConnection: async () => {
    const client = await pgPool.connect();
    let liberado = false;
    return {
      query: (sql, params) => ejecutar(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => {
        if (!liberado) {
          liberado = true;
          client.release();
        }
      },
    };
  },
};

async function verificarConexion() {
  await pgPool.query('SELECT 1');
  console.log('✅ Conexión a PostgreSQL establecida correctamente.');
}

module.exports = { pool, verificarConexion, pgPool };
