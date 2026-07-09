"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ResourceManager, type Field, type Column } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Servicio } from "@/types/database";

const fields: Field[] = [
  { name: "nombre", label: "Nombre", required: true, colSpan: 2 },
  { name: "descripcion", label: "Descripción", type: "textarea", colSpan: 2 },
  { name: "precio", label: "Precio", type: "number", colSpan: 1, required: true },
  { name: "duracion_min", label: "Duración (min)", type: "number", colSpan: 1, required: true },
  { name: "comision_sugerida", label: "Comisión %", type: "number", colSpan: 1 },
  { name: "orden", label: "Orden", type: "number", colSpan: 1 },
  { name: "imagen_url", label: "Imagen (URL)", colSpan: 2, placeholder: "https://..." },
  { name: "destacado", label: "Destacado", type: "switch", colSpan: 1 },
  { name: "estado", label: "Estado", type: "select", colSpan: 1, options: [
    { value: "activo", label: "Activo" }, { value: "inactivo", label: "Inactivo" },
  ] },
];

const columns: Column<Servicio>[] = [
  { key: "nombre", label: "Servicio" },
  { key: "precio", label: "Precio", render: (r) => formatCurrency(r.precio) },
  { key: "duracion_min", label: "Duración", render: (r) => `${r.duracion_min} min` },
  { key: "destacado", label: "Destacado", render: (r) => r.destacado ? <Badge variant="brand">Sí</Badge> : "—" },
  { key: "estado", label: "Estado", render: (r) => (
    <Badge variant={r.estado === "activo" ? "brand" : "secondary"}>{r.estado}</Badge>
  ) },
];

export default function ServiciosAdminPage() {
  return (
    <div>
      <PageHeader title="Servicios" description="Gestiona tu carta de servicios y precios." />
      <ResourceManager<Servicio> endpoint="/api/servicios" singular="servicio" columns={columns} fields={fields} />
    </div>
  );
}
