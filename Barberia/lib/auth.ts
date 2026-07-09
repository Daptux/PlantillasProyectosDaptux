import { createClient } from "@/lib/supabase/server";
import { tienePermiso } from "@/lib/permissions";
import type { PerfilUsuario, Rol } from "@/types/database";

export interface SesionUsuario {
  authUserId: string;
  correo: string | null;
  perfil: (PerfilUsuario & { rol?: Rol | null }) | null;
  rol: string | null;
  barberiaId: string | null;
}

/**
 * Obtiene la sesion + perfil + rol del usuario autenticado (server-side).
 * Devuelve null si no hay sesion.
 */
export async function getSesion(): Promise<SesionUsuario | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfiles_usuario")
    .select("*, rol:roles(*)")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  const rolClave = (perfil as { rol?: { clave?: string } } | null)?.rol?.clave ?? null;

  return {
    authUserId: user.id,
    correo: user.email ?? null,
    perfil: (perfil as SesionUsuario["perfil"]) ?? null,
    rol: rolClave,
    barberiaId: perfil?.barberia_id ?? null,
  };
}

/** Lanza si no hay sesion; util en Route Handlers. */
export async function requireSesion(): Promise<SesionUsuario> {
  const sesion = await getSesion();
  if (!sesion) throw new Error("No autenticado");
  return sesion;
}

/** Lanza si el usuario no tiene el permiso indicado. */
export async function requirePermiso(permiso: string): Promise<SesionUsuario> {
  const sesion = await requireSesion();
  if (!tienePermiso(sesion.rol, permiso)) {
    throw new Error("No tienes permiso para esta accion");
  }
  return sesion;
}
