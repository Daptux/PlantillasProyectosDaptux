import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/database/schema";

type Db = PostgresJsDatabase<typeof schema>;

const connectionString = process.env.DATABASE_URL;

// --- Modo DEMO (sin base de datos) ---------------------------------------
// Permite mostrar el panel completo sin una BD real: todas las consultas se
// resuelven a vacio ([]) en lugar de fallar. El codigo del panel accede de
// forma defensiva (`rows[0]?.x ?? 0`, `.map`, etc.), asi que renderiza con
// ceros/listas vacias sin romperse. Se activa con DEMO_MODE=1, o si no hay
// DATABASE_URL, o si apunta al placeholder de demo.
const DEMO_MODE =
  process.env.DEMO_MODE === "1" ||
  !connectionString ||
  connectionString.includes("demo:demo@localhost");

// Cadena de consulta "falsa": cualquier metodo (select, from, where, limit,
// groupBy, orderBy, insert, values, returning, ...) devuelve la misma cadena,
// y al hacerle await se resuelve a [].
function fakeChain(): any {
  return new Proxy(function () {}, {
    get(_t, prop) {
      if (prop === "then") return (resolve: (v: unknown[]) => void) => resolve([]);
      if (prop === "catch") return () => fakeChain();
      if (prop === "finally") return (cb?: () => void) => {
        if (typeof cb === "function") cb();
        return fakeChain();
      };
      if (typeof prop === "symbol") return undefined;
      return () => fakeChain();
    },
    apply() {
      return fakeChain();
    },
  });
}

function createFakeDb(): any {
  return new Proxy(function () {}, {
    get(_t, prop) {
      if (prop === "then") return undefined; // db no es "thenable"
      if (prop === "transaction") {
        return async (cb: (tx: unknown) => unknown) => cb(createFakeDb());
      }
      if (typeof prop === "symbol") return undefined;
      return () => fakeChain();
    },
  });
}

let db: Db;

if (DEMO_MODE) {
  // El proxy falso se comporta como el db real en las rutas de lectura del panel.
  db = createFakeDb() as unknown as Db;
} else {
  // Reutiliza el cliente en desarrollo para evitar agotar conexiones con el HMR.
  const globalForDb = globalThis as unknown as {
    client: ReturnType<typeof postgres> | undefined;
  };

  const client =
    globalForDb.client ??
    postgres(connectionString as string, {
      max: 10,
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.client = client;
  }

  db = drizzle(client, { schema });
}

export { db, schema };
