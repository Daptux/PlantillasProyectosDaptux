"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ResourceManager, type Field, type Column } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { formatCurrency, formatDate, whatsappUrl } from "@/lib/utils";
import type { Cliente } from "@/types/database";

const fields: Field[] = [
  { name: "nombre", label: "Nombre", required: true, colSpan: 2 },
  { name: "celular", label: "Celular / WhatsApp", colSpan: 1 },
  { name: "correo", label: "Correo", type: "email", colSpan: 1 },
  { name: "fecha_nacimiento", label: "Cumpleaños", type: "date", colSpan: 1 },
  { name: "preferencias", label: "Preferencias", colSpan: 1 },
  { name: "observaciones", label: "Observaciones", type: "textarea", colSpan: 2 },
  { name: "notas_internas", label: "Notas internas", type: "textarea", colSpan: 2 },
];

const SEG: Record<string, "brand" | "secondary" | "destructive"> = {
  frecuente: "brand", activo: "secondary", inactivo: "destructive",
};

const columns: Column<Cliente>[] = [
  { key: "nombre", label: "Cliente" },
  { key: "celular", label: "Celular" },
  { key: "numero_visitas", label: "Visitas" },
  { key: "total_gastado", label: "Total gastado", render: (r) => formatCurrency(r.total_gastado) },
  { key: "ultima_visita", label: "Última visita", render: (r) => formatDate(r.ultima_visita) },
  { key: "segmento", label: "Segmento", render: (r) => <Badge variant={SEG[r.segmento] ?? "secondary"}>{r.segmento}</Badge> },
  { key: "wa", label: "", render: (r) => r.celular ? (
    <Button asChild variant="ghost" size="icon" className="text-emerald-600">
      <a href={whatsappUrl(r.celular)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /></a>
    </Button>
  ) : null },
];

export default function ClientesPage() {
  return (
    <div>
      <PageHeader title="Clientes" description="CRM: historial, segmentos y contacto rápido." />
      <ResourceManager<Cliente> endpoint="/api/clientes" singular="cliente" columns={columns} fields={fields} />
    </div>
  );
}
