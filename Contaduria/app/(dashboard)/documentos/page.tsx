import { getSession } from "@/lib/auth";
import { listClientOptions } from "@/server/services/clientes.service";
import { listDocumentTypes } from "@/server/services/catalogos.service";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { DocumentosView } from "@/components/documentos/documentos-view";

export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  const session = await getSession();
  if (!session) return null;
  const [clients, documentTypes] = await Promise.all([
    listClientOptions(session),
    listDocumentTypes(session.firmId!),
  ]);

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Todos los documentos de tus clientes, organizados y con estado de revision."
      />
      <DocumentosView
        clients={clients}
        documentTypes={documentTypes.map((t) => ({ id: t.id, name: t.name }))}
        canReview={can(session, "documents:approve")}
      />
    </div>
  );
}
