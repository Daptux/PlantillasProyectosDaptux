// scripts/migrate.js
// Aplica el esquema y (opcionalmente) el seed a la base de datos PostgreSQL
// indicada por DATABASE_URL / POSTGRES_URL.
//
// Uso:
//   DATABASE_URL=postgres://...  node scripts/migrate.js          (schema + seed)
//   DATABASE_URL=postgres://...  node scripts/migrate.js --schema (solo schema)
//   DATABASE_URL=postgres://...  node scripts/migrate.js --seed   (solo seed)

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  '';

if (!connectionString) {
  console.error('❌ Falta DATABASE_URL / POSTGRES_URL en el entorno.');
  process.exit(1);
}

const args = process.argv.slice(2);
const soloSchema = args.includes('--schema');
const soloSeed = args.includes('--seed');
const hacerSchema = !soloSeed;
const hacerSeed = !soloSchema;

const requiereSsl = /sslmode=require|neon\.tech|vercel|supabase|render\.com|amazonaws|pooler/i.test(connectionString);

async function ejecutarArchivo(client, archivo) {
  const ruta = path.join(__dirname, '..', 'database', archivo);
  const sql = fs.readFileSync(ruta, 'utf8');
  console.log(`▶ Ejecutando ${archivo} ...`);
  await client.query(sql);
  console.log(`✅ ${archivo} aplicado.`);
}

(async () => {
  const client = new Client({
    connectionString,
    ssl: requiereSsl ? { rejectUnauthorized: false } : false,
  });
  await client.connect();
  try {
    if (hacerSchema) await ejecutarArchivo(client, 'schema.pg.sql');
    if (hacerSeed) await ejecutarArchivo(client, 'seed.pg.sql');
    console.log('🎉 Migración completada.');
  } catch (err) {
    console.error('❌ Error en la migración:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
