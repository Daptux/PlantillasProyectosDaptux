import { getSession } from "@/lib/auth";
import { listFirmUsers } from "@/server/services/clientes.service";
import { PageHeader } from "@/components/layout/page-header";
import { ClientesView } from "@/components/clientes/clientes-view";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const session = await getSession();
  const users = session?.firmId ? await listFirmUsers(session.firmId) : [];

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Administra tus clientes contables, su estado y su responsable."
      />
      <ClientesView users={users} />
    </div>
  );
}
