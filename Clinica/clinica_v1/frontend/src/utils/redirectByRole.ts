import type { RoleCode } from "@/types";

/** Ruta de inicio del panel segun el rol del usuario. */
export function homeByRole(rol: RoleCode): string {
  switch (rol) {
    case "PACIENTE":
      return "/paciente";
    case "MEDICO":
      return "/medico";
    default:
      return "/admin";
  }
}
