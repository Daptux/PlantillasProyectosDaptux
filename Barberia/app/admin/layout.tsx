import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import { getConfiguracion } from "@/lib/queries";
import { ROLES_ADMIN } from "@/lib/permissions";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await getSesion();

  if (!sesion) redirect("/login?redirect=/admin/dashboard");

  // El usuario debe tener un rol con acceso al panel
  if (!sesion.rol || !ROLES_ADMIN.includes(sesion.rol)) {
    redirect("/login?error=sin_acceso");
  }

  const config = await getConfiguracion().catch(() => null);

  return (
    <AdminShell
      nombreBarberia={config?.nombre_comercial ?? "BarberPro"}
      nombreUsuario={sesion.perfil?.nombre ?? sesion.correo ?? "Usuario"}
      rol={sesion.rol}
    >
      {children}
    </AdminShell>
  );
}
