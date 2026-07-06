import { getSession } from "@/lib/auth";
import { listClientOptions } from "@/server/services/clientes.service";
import { PageHeader } from "@/components/layout/page-header";
import { VencimientosView } from "@/components/vencimientos/vencimientos-view";

export const dynamic = "force-dynamic";

export default async function VencimientosPage() {
  const session = await getSession();
  if (!session) return null;
  const clients = await listClientOptions(session);

  return (
    <div>
      <PageHeader
        title="Vencimientos"
        description="Calendario de obligaciones, cierres y entregas. Configurable, sin fechas fijas en el codigo."
      />
      <VencimientosView clients={clients} />
    </div>
  );
}
