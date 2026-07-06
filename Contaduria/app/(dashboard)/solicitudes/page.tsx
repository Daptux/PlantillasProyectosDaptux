import { getSession } from "@/lib/auth";
import { listClientOptions } from "@/server/services/clientes.service";
import { listDocumentTypes } from "@/server/services/catalogos.service";
import { PageHeader } from "@/components/layout/page-header";
import { SolicitudesView } from "@/components/solicitudes/solicitudes-view";

export const dynamic = "force-dynamic";

export default async function SolicitudesPage() {
  const session = await getSession();
  if (!session) return null;
  const [clients, documentTypes] = await Promise.all([
    listClientOptions(session),
    listDocumentTypes(session.firmId!),
  ]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        description="Pide documentos a tus clientes con un link seguro y controla su respuesta."
      />
      <SolicitudesView
        clients={clients}
        documentTypes={documentTypes.map((t) => ({ id: t.id, name: t.name }))}
        appUrl={appUrl}
      />
    </div>
  );
}
