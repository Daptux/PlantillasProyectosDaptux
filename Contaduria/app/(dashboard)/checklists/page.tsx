import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { ChecklistsView } from "@/components/checklists/checklists-view";

export const dynamic = "force-dynamic";

export default async function ChecklistsPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div>
      <PageHeader
        title="Checklists mensuales"
        description="Controla el avance mensual de cada cliente con semaforo automatico."
      />
      <ChecklistsView canClose={can(session, "checklists:close") || can(session, "checklists:update")} />
    </div>
  );
}
