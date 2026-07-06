import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { accountingFirms } from "@/database/schema";
import {
  listDocumentTypes,
  listObligations,
  listTemplates,
} from "@/server/services/catalogos.service";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const session = await getSession();
  if (!can(session, "settings:read") && session?.role !== "contador") {
    // solo contador/superadmin
  }
  if (session?.role !== "contador" && session?.role !== "superadmin") redirect("/dashboard");

  const firmId = session!.firmId!;
  const [firm] = await db.select().from(accountingFirms).where(eq(accountingFirms.id, firmId)).limit(1);
  const [documentTypes, obligations, templates] = await Promise.all([
    listDocumentTypes(firmId),
    listObligations(firmId),
    listTemplates(firmId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracion"
        description="Datos de la firma, tipos de documento, obligaciones y plantillas de mensajes."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Firma contable</CardTitle>
          <CardDescription>Informacion de tu firma. Multiempresa desde el inicio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
          <Info label="Nombre" value={firm?.name} />
          <Info label="NIT" value={firm?.nit ?? "-"} />
          <Info label="Correo" value={firm?.email ?? "-"} />
          <Info label="Telefono" value={firm?.phone ?? "-"} />
          <Info label="Plan" value={firm?.plan ?? "free"} />
          <Info label="Estado" value={firm?.status ?? "-"} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipos de documento ({documentTypes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {documentTypes.map((t) => (
                <Badge key={t.id} variant={t.requiredByDefault ? "secondary" : "muted"}>{t.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Obligaciones ({obligations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {obligations.map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <span>{o.name}</span>
                  <Badge variant="muted">{o.defaultPeriodicity}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plantillas de mensajes ({templates.length})</CardTitle>
          <CardDescription>
            Usa variables dinamicas: {"{{cliente}}"} {"{{mes}}"} {"{{ano}}"} {"{{fecha_limite}}"} {"{{link}}"} {"{{contador}}"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
