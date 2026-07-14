import { useState } from "react";
import { Plus, Pencil, Trash2, Stethoscope, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataTable, { type Column } from "@/components/tables/DataTable";
import PageHeader from "@/components/layout/PageHeader";
import SimpleFormModal, { type FieldDef } from "@/components/modals/SimpleFormModal";
import { useCrud } from "@/hooks/useCrud";
import { specialtiesApi, sedesApi } from "@/services/adminService";
import type { Especialidad, Sede } from "@/types";

const ESP_FIELDS: FieldDef[] = [
  { name: "nombre", label: "Nombre", required: true },
  { name: "descripcion", label: "Descripcion", type: "textarea" },
  { name: "icono", label: "Icono (lucide)" },
];
const SEDE_FIELDS: FieldDef[] = [
  { name: "nombre", label: "Nombre", required: true },
  { name: "direccion", label: "Direccion" },
  { name: "ciudad", label: "Ciudad" },
  { name: "telefono", label: "Telefono" },
  { name: "email", label: "Email", type: "email" },
];

export default function CatalogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Catalogos" subtitle="Especialidades y sedes de la clinica." />
      <SpecialtiesSection />
      <SedesSection />
    </div>
  );
}

/** Encabezado de tarjeta con icono, titulo y boton de "Nueva". */
function SectionHeader({
  icon: Icon,
  title,
  onNew,
}: {
  icon: React.ElementType;
  title: string;
  onNew: () => void;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b">
      <div className="flex items-center gap-2 font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </div>
      <Button size="sm" onClick={onNew}>
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nueva</span>
      </Button>
    </CardHeader>
  );
}

function SpecialtiesSection() {
  const { list, create, update, remove } = useCrud<Especialidad>("specialties", specialtiesApi);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Especialidad | null>(null);

  const onSave = (values: Record<string, string>) =>
    editing ? update.mutateAsync({ id: editing.id, payload: values }) : create.mutateAsync(values);

  const columns: Column<Especialidad>[] = [
    { header: "Nombre", cell: (e) => <span className="font-medium">{e.nombre}</span> },
    { header: "Descripcion", cell: (e) => e.descripcion ?? "—" },
    { header: "Estado", cell: (e) => (e.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>) },
    {
      header: "",
      className: "text-right w-24",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => window.confirm(`Desactivar "${e.nombre}"?`) && remove.mutate(e.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <SectionHeader icon={Stethoscope} title="Especialidades" onNew={() => { setEditing(null); setOpen(true); }} />
      <CardContent className="p-4">
        <DataTable columns={columns} rows={list.data ?? []} getKey={(e) => e.id} loading={list.isLoading} emptyText="Sin especialidades" />
      </CardContent>
      <SimpleFormModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar especialidad" : "Nueva especialidad"}
        fields={ESP_FIELDS}
        initial={{ nombre: editing?.nombre ?? "", descripcion: editing?.descripcion ?? "", icono: editing?.icono ?? "" }}
        onSave={onSave}
      />
    </Card>
  );
}

function SedesSection() {
  const { list, create, update, remove } = useCrud<Sede>("sedes", sedesApi);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sede | null>(null);

  const onSave = (values: Record<string, string>) =>
    editing ? update.mutateAsync({ id: editing.id, payload: values }) : create.mutateAsync(values);

  const columns: Column<Sede>[] = [
    { header: "Nombre", cell: (s) => <span className="font-medium">{s.nombre}</span> },
    { header: "Ciudad", cell: (s) => s.ciudad ?? "—" },
    { header: "Direccion", cell: (s) => s.direccion ?? "—" },
    { header: "Telefono", cell: (s) => s.telefono ?? "—" },
    { header: "Estado", cell: (s) => (s.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>) },
    {
      header: "",
      className: "text-right w-24",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => window.confirm(`Desactivar "${s.nombre}"?`) && remove.mutate(s.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <SectionHeader icon={Building2} title="Sedes" onNew={() => { setEditing(null); setOpen(true); }} />
      <CardContent className="p-4">
        <DataTable columns={columns} rows={list.data ?? []} getKey={(s) => s.id} loading={list.isLoading} emptyText="Sin sedes" />
      </CardContent>
      <SimpleFormModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar sede" : "Nueva sede"}
        fields={SEDE_FIELDS}
        initial={{
          nombre: editing?.nombre ?? "",
          direccion: editing?.direccion ?? "",
          ciudad: editing?.ciudad ?? "",
          telefono: editing?.telefono ?? "",
          email: editing?.email ?? "",
        }}
        onSave={onSave}
      />
    </Card>
  );
}
