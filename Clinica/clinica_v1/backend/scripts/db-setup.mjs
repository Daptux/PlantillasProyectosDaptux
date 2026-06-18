/**
 * Utilidad opcional para crear la base de datos e importar schema.sql + seed.sql
 * sin necesidad del cliente mysql ni phpMyAdmin.
 *
 * Uso:  node scripts/db-setup.mjs
 * Lee la conexion desde backend/.env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, "../../database");

const cfg = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "clinica_app",
  multipleStatements: true,
};

function readSql(file) {
  return fs.readFileSync(path.join(DB_DIR, file), "utf8");
}

async function main() {
  // 1) Conexion SIN base para poder crearla.
  const root = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    multipleStatements: true,
  });

  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  console.log(`✅ Base de datos "${cfg.database}" lista.`);
  await root.end();

  // 2) Conexion a la base ya creada e importar schema + seed.
  const conn = await mysql.createConnection(cfg);
  console.log("⏳ Importando schema.sql ...");
  await conn.query(readSql("schema.sql"));
  console.log("✅ schema.sql importado.");

  console.log("⏳ Importando seed.sql ...");
  await conn.query(readSql("seed.sql"));
  console.log("✅ seed.sql importado.");

  const [rows] = await conn.query("SELECT email FROM usuarios ORDER BY id");
  console.log("👤 Usuarios demo:", rows.map((r) => r.email).join(", "));

  await conn.end();
  console.log("🎉 Base de datos inicializada correctamente.");
}

main().catch((e) => {
  console.error("❌ Error en db-setup:", e.message);
  process.exit(1);
});
