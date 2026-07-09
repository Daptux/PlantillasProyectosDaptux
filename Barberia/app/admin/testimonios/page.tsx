"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ResourceManager, type Field, type Column } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Testimonio } from "@/types/database";

const fields: Field[] = [
  { name: "nombre_cliente", label: "Nombre del cliente", required: true, colSpan: 2 },
  { name: "comentario", label: "Comentario", type: "textarea", required: true, colSpan: 2 },
  { name: "calificacion", label: "Calificación (1-5)", type: "number", colSpan: 1 },
  { name: "foto_url", label: "Foto (URL)", colSpan: 1, placeholder: "https://..." },
  { name: "visible", label: "Visible", type: "switch", colSpan: 1 },
];

const columns: Column<Testimonio>[] = [
  { key: "nombre_cliente", label: "Cliente" },
  { key: "comentario", label: "Comentario", render: (r) => <span className="line-clamp-1 max-w-xs">{r.comentario}</span> },
  { key: "calificacion", label: "Calificación", render: (r) => (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < r.calificacion ? "fill-brand text-brand" : "text-muted-foreground/30"}`} />
      ))}
    </span>
  ) },
  { key: "visible", label: "Visible", render: (r) => r.visible ? <Badge variant="brand">Sí</Badge> : <Badge variant="secondary">No</Badge> },
];

export default function TestimoniosPage() {
  return (
    <div>
      <PageHeader title="Testimonios" description="Reseñas de clientes para tu landing." />
      <ResourceManager<Testimonio> endpoint="/api/testimonios" singular="testimonio" columns={columns} fields={fields} />
    </div>
  );
}
