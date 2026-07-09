import { createClient } from "@supabase/supabase-js";

/**
 * Cliente ADMIN de Supabase — usa la SERVICE ROLE KEY.
 *
 * ⚠️  SOLO debe usarse en el servidor (Route Handlers, Server Actions).
 *     NUNCA importar este archivo en componentes cliente.
 *     Bypassa Row Level Security: usar solo para operaciones privilegiadas
 *     (crear usuarios, operaciones administrativas cross-cutting, etc.).
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no esta configurada. El cliente admin no puede inicializarse."
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
