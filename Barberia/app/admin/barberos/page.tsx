"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ResourceManager, type Field, type Column } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import type { Barbero } from "@/types/database";

const fields: Field[] = [
  { name: "nombre", label: "Nombre", required: true, colSpan: 2 },
  { name: "especialidad", label: "Especialidad", colSpan: 1 },
  { name: "celular", label: "Celular", colSpan: 1 },
  { name: "correo", label: "Correo", type: "email", colSpan: 1 },
  { name: "instagram", label: "Instagram", colSpan: 1 },
  { name: "porcentaje_comision", label: "Comisión %", type: "number", colSpan: 1 },
  { name: "salario_base", label: "Salario base", type: "number", colSpan: 1 },
  { name: "fecha_ingreso", label: "Fecha ingreso", type: "date", colSpan: 1 },
  { name: "foto_url", label: "Foto (URL)", colSpan: 2, placeholder: "https://..." },
  { name: "descripcion", label: "Descripción", type: "textarea", colSpan: 2 },
  { name: "destacado", label: "Destacado", type: "switch", colSpan: 1 },
  { name: "estado", label: "Estado", type: "select", colSpan: 1, options: [
    { value: "activo", label: "Activo" }, { value: "inactivo", label: "Inactivo" },
  ] },
];

const columns: Column<Barbero>[] = [
  { key: "nombre", label: "Barbero" },
  { key: "especialidad", label: "Especialidad" },
  { key: "celular", label: "Celular" },
  { key: "porcentaje_comision", label: "Comisión", render: (r) => `${r.porcentaje_comision}%` },
  { key: "estado", label: "Estado", render: (r) => (
    <Badge variant={r.estado === "activo" ? "brand" : "secondary"}>{r.estado}</Badge>
  ) },
];

export default function BarberosPage() {
  return (
    <div>
      <PageHeader title="Barberos" description="Equipo, comisiones y estado." />
      <ResourceManager<Barbero> endpoint="/api/barberos" singular="barbero" columns={columns} fields={fields} />
    </div>
  );
}
