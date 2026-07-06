import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getClientSummary, listFirmUsers } from "@/server/services/clientes.service";
import { listObligations } from "@/server/services/catalogos.service";
import { Badge } from "@/components/ui/badge";
import { CLIENT_STATUS, RISK_LEVEL, pick } from "@/lib/labels";
import { ClienteDetalle } from "@/components/clientes/cliente-detalle";

export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return null;

  const summary = await getClientSummary(session, params.id);
  if (!summary) notFound();

  const [users, obligationsCatalog] = await Promise.all([
    listFirmUsers(session.firmId!),
    listObligations(session.firmId!),
  ]);
  const { client, stats } = summary;

  return (
    <div className="space-y-4">
      <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${RISK_LEVEL[client.riskLevel]?.color}`} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-sm text-muted-foreground">
              {client.documentType} {client.documentNumber}
              {client.businessName && ` · ${client.businessName}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={RISK_LEVEL[client.riskLevel]?.variant}>{RISK_LEVEL[client.riskLevel]?.label}</Badge>
          <Badge variant={pick(CLIENT_STATUS, client.status).variant}>{pick(CLIENT_STATUS, client.status).label}</Badge>
        </div>
      </div>

      <ClienteDetalle
        client={client as never}
        stats={stats}
        users={users}
        obligationsCatalog={obligationsCatalog.map((o) => ({ id: o.id, name: o.name }))}
      />
    </div>
  );
}
