import type { SessionPayload } from "./auth";

export type Role = "superadmin" | "contador" | "auxiliar" | "revisor";

/**
 * Matriz de permisos por rol. Cada permiso es una accion sobre un modulo.
 * El cliente externo NO tiene sesion: accede solo por links publicos con token.
 */
export const PERMISSIONS: Record<Role, string[]> = {
  superadmin: ["*"],
  contador: [
    "clients:*",
    "users:*",
    "documents:*",
    "requests:*",
    "tasks:*",
    "checklists:*",
    "deadlines:*",
    "reports:*",
    "obligations:*",
    "templates:*",
    "settings:*",
    "audit:read",
    "dashboard:read",
    "notifications:read",
  ],
  auxiliar: [
    "clients:read",
    "documents:read",
    "documents:create",
    "documents:comment",
    "requests:read",
    "requests:create",
    "tasks:read",
    "tasks:update",
    "checklists:read",
    "checklists:update",
    "deadlines:read",
    "dashboard:read",
    "notifications:read",
  ],
  revisor: [
    "clients:read",
    "documents:read",
    "documents:approve",
    "documents:reject",
    "documents:comment",
    "checklists:read",
    "checklists:close",
    "audit:read",
    "reports:read",
    "dashboard:read",
    "notifications:read",
  ],
};

export function can(
  session: Pick<SessionPayload, "role"> | null | undefined,
  permission: string
): boolean {
  if (!session) return false;
  const perms = PERMISSIONS[session.role] ?? [];
  if (perms.includes("*")) return true;
  const [module] = permission.split(":");
  if (perms.includes(`${module}:*`)) return true;
  return perms.includes(permission);
}

export function assertCan(
  session: Pick<SessionPayload, "role"> | null | undefined,
  permission: string
): void {
  if (!can(session, permission)) {
    throw new Error("FORBIDDEN");
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Superadmin",
  contador: "Contador principal",
  auxiliar: "Auxiliar contable",
  revisor: "Revisor / Auditor",
};
