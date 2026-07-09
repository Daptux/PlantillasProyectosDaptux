import { ROLES, type RolClave } from "@/lib/constants";

/**
 * Mapa de permisos por rol. El superadmin tiene "*" (todo).
 * Estos permisos se validan tanto en el frontend (ocultar UI) como en los
 * Route Handlers (bloquear acciones).
 */
export const PERMISOS_POR_ROL: Record<RolClave, string[]> = {
  [ROLES.SUPERADMIN]: ["*"],
  [ROLES.ADMIN]: [
    "dashboard.ver",
    "reservas.ver", "reservas.crear", "reservas.editar", "reservas.eliminar",
    "agenda.ver",
    "clientes.ver", "clientes.gestionar",
    "servicios.gestionar", "barberos.gestionar",
    "finanzas.ver", "finanzas.gestionar", "caja.gestionar",
    "inventario.gestionar", "ventas.gestionar",
    "promociones.gestionar", "galeria.gestionar", "testimonios.gestionar",
    "reportes.ver",
    // config critica y usuarios: restringidos al superadmin
  ],
  [ROLES.RECEPCIONISTA]: [
    "dashboard.ver",
    "reservas.ver", "reservas.crear", "reservas.editar",
    "agenda.ver",
    "clientes.ver", "clientes.gestionar",
    "caja.gestionar", "ventas.gestionar",
  ],
  [ROLES.BARBERO]: [
    "dashboard.ver",
    "reservas.ver",
    "agenda.ver",
  ],
  [ROLES.CLIENTE]: [],
};

/** Verifica si un rol tiene un permiso concreto. */
export function tienePermiso(rol: RolClave | string | null | undefined, permiso: string): boolean {
  if (!rol) return false;
  const permisos = PERMISOS_POR_ROL[rol as RolClave];
  if (!permisos) return false;
  return permisos.includes("*") || permisos.includes(permiso);
}

/** Verifica si un rol tiene alguno de los permisos. */
export function tieneAlgunPermiso(rol: RolClave | string | null | undefined, permisos: string[]): boolean {
  return permisos.some((p) => tienePermiso(rol, p));
}

/** Filtra los items de navegacion segun el rol. */
export function navPermitida<T extends { permiso: string }>(rol: RolClave | string | null | undefined, items: readonly T[]): T[] {
  return items.filter((item) => tienePermiso(rol, item.permiso));
}

/** Roles que pueden acceder al panel admin. */
export const ROLES_ADMIN: string[] = [
  ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO,
];
