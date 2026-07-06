import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no definida");
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  console.log("Aplicando migraciones...");
  await migrate(db, { migrationsFolder: "./database/migrations" });
  console.log("Migraciones aplicadas.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
