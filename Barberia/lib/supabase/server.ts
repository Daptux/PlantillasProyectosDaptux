import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components y Route Handlers.
 * Lee/escribe la sesion desde las cookies de la request.
 * Usa la clave anonima + la sesion del usuario autenticado (respeta RLS).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // El metodo setAll fue llamado desde un Server Component.
            // Se puede ignorar si hay middleware refrescando la sesion.
          }
        },
      },
    }
  );
}
