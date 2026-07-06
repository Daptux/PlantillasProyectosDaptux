import { getSession } from "@/lib/auth";
import { listClientOptions, listFirmUsers } from "@/server/services/clientes.service";
import { PageHeader } from "@/components/layout/page-header";
import { TareasView } from "@/components/tareas/tareas-view";

export const dynamic = "force-dynamic";

export default async function TareasPage() {
  const session = await getSession();
  if (!session) return null;
  const [clients, users] = await Promise.all([
    listClientOptions(session),
    listFirmUsers(session.firmId!),
  ]);

  return (
    <div>
      <PageHeader
        title="Tareas"
        description="Gestiona las tareas internas de tu equipo con un tablero Kanban."
      />
      <TareasView clients={clients} users={users.map((u) => ({ id: u.id, name: u.name }))} />
    </div>
  );
}
