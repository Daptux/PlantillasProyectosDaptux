import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { UsuariosView } from "@/components/usuarios/usuarios-view";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await getSession();
  if (!can(session, "users:read")) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Crea auxiliares y revisores, asigna roles y controla el acceso."
      />
      <UsuariosView currentUserId={session!.userId} />
    </div>
  );
}
