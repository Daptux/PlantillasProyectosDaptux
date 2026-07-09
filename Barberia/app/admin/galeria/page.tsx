"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ResourceManager, type Field, type Column } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import { CATEGORIAS_GALERIA } from "@/lib/constants";
import type { Galeria } from "@/types/database";

const fields: Field[] = [
  { name: "imagen_url", label: "Imagen (URL)", required: true, colSpan: 2, placeholder: "https://..." },
  { name: "titulo", label: "Título", colSpan: 1 },
  { name: "categoria", label: "Categoría", type: "select", colSpan: 1, options: CATEGORIAS_GALERIA },
  { name: "descripcion", label: "Descripción", type: "textarea", colSpan: 2 },
  { name: "orden", label: "Orden", type: "number", colSpan: 1 },
  { name: "destacada", label: "Destacada", type: "switch", colSpan: 1 },
  { name: "visible", label: "Visible", type: "switch", colSpan: 1 },
];

const columns: Column<Galeria>[] = [
  { key: "imagen", label: "Imagen", render: (r) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={r.imagen_url} alt={r.titulo ?? ""} className="h-12 w-16 rounded object-cover" />
  ) },
  { key: "titulo", label: "Título" },
  { key: "categoria", label: "Categoría" },
  { key: "visible", label: "Visible", render: (r) => r.visible ? <Badge variant="brand">Sí</Badge> : <Badge variant="secondary">No</Badge> },
];

export default function GaleriaPage() {
  return (
    <div>
      <PageHeader title="Galería" description="Imágenes de trabajos y estilo de tu barbería." />
      <ResourceManager<Galeria> endpoint="/api/galeria" singular="imagen" columns={columns} fields={fields} />
    </div>
  );
}
