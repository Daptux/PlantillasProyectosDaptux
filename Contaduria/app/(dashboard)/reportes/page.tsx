import { getSession } from "@/lib/auth";
import { listClientOptions } from "@/server/services/clientes.service";
import { PageHeader } from "@/components/layout/page-header";
import { ReportesView } from "@/components/reportes/reportes-view";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const session = await getSession();
  if (!session) return null;
  const clients = await listClientOptions(session);

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Genera reportes mensuales profesionales en PDF, listos para compartir con tus clientes."
      />
      <ReportesView clients={clients} />
    </div>
  );
}
