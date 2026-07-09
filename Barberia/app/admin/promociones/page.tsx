"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ResourceManager, type Field, type Column } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Promocion } from "@/types/database";

const fields: Field[] = [
  { name: "nombre", label: "Nombre", required: true, colSpan: 2 },
  { name: "descripcion", label: "Descripción", type: "textarea", colSpan: 2 },
  { name: "precio_anterior", label: "Precio anterior", type: "number", colSpan: 1 },
  { name: "precio_promocional", label: "Precio promo", type: "number", colSpan: 1, required: true },
  { name: "fecha_inicio", label: "Inicio", type: "date", colSpan: 1 },
  { name: "fecha_fin", label: "Fin", type: "date", colSpan: 1 },
  { name: "imagen_url", label: "Imagen (URL)", colSpan: 2, placeholder: "https://..." },
  { name: "mostrar_landing", label: "Mostrar en landing", type: "switch", colSpan: 1 },
  { name: "estado", label: "Estado", type: "select", colSpan: 1, options: [
    { value: "activo", label: "Activo" }, { value: "inactivo", label: "Inactivo" },
  ] },
];

const columns: Column<Promocion>[] = [
  { key: "nombre", label: "Promoción" },
  { key: "precio_promocional", label: "Precio", render: (r) => formatCurrency(r.precio_promocional) },
  { key: "fecha_fin", label: "Vence", render: (r) => formatDate(r.fecha_fin) },
  { key: "mostrar_landing", label: "Landing", render: (r) => r.mostrar_landing ? <Badge variant="brand">Sí</Badge> : "—" },
  { key: "estado", label: "Estado", render: (r) => <Badge variant={r.estado === "activo" ? "brand" : "secondary"}>{r.estado}</Badge> },
];

export default function PromocionesPage() {
  return (
    <div>
      <PageHeader title="Promociones" description="Ofertas visibles en la web." />
      <ResourceManager<Promocion> endpoint="/api/promociones" singular="promoción" columns={columns} fields={fields} />
    </div>
  );
}
