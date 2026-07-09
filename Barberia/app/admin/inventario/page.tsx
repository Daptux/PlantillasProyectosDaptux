"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ResourceManager, type Field, type Column } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Producto } from "@/types/database";

const fields: Field[] = [
  { name: "nombre", label: "Nombre", required: true, colSpan: 2 },
  { name: "descripcion", label: "Descripción", type: "textarea", colSpan: 2 },
  { name: "unidad_medida", label: "Unidad", colSpan: 1, placeholder: "unidad" },
  { name: "stock_actual", label: "Stock actual", type: "number", colSpan: 1 },
  { name: "stock_minimo", label: "Stock mínimo", type: "number", colSpan: 1 },
  { name: "precio_compra", label: "Precio compra", type: "number", colSpan: 1, required: true },
  { name: "precio_venta", label: "Precio venta", type: "number", colSpan: 1 },
  { name: "es_vendible", label: "Se vende al público", type: "switch", colSpan: 1 },
  { name: "estado", label: "Estado", type: "select", colSpan: 1, options: [
    { value: "activo", label: "Activo" }, { value: "inactivo", label: "Inactivo" },
  ] },
];

const columns: Column<Producto>[] = [
  { key: "nombre", label: "Producto" },
  { key: "stock_actual", label: "Stock", render: (r) => {
    const bajo = Number(r.stock_actual) <= Number(r.stock_minimo);
    return <Badge variant={bajo ? "destructive" : "secondary"}>{r.stock_actual} {r.unidad_medida}</Badge>;
  } },
  { key: "stock_minimo", label: "Mínimo" },
  { key: "precio_compra", label: "Compra", render: (r) => formatCurrency(r.precio_compra) },
  { key: "precio_venta", label: "Venta", render: (r) => r.precio_venta ? formatCurrency(r.precio_venta) : "—" },
];

export default function InventarioPage() {
  return (
    <div>
      <PageHeader title="Inventario" description="Productos, insumos y niveles de stock." />
      <ResourceManager<Producto> endpoint="/api/inventario/productos" singular="producto" columns={columns} fields={fields} />
    </div>
  );
}
