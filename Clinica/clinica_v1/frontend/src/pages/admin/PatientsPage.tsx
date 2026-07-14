import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable, { type Column } from "@/components/tables/DataTable";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/ui/search-input";
import PatientModal from "@/components/modals/PatientModal";
import { useCrud } from "@/hooks/useCrud";
import { patientsApi } from "@/services/adminService";
import type { Paciente } from "@/types";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const { list, create, update, remove } = useCrud<Paciente>("patients", patientsApi, { search });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);

  const abrirNuevo = () => { setEditing(null); setModalOpen(true); };
  const abrirEditar = (p: Paciente) => { setEditing(p); setModalOpen(true); };

  const onSave = (payload: Record<string, unknown>, id?: number) =>
    id ? update.mutateAsync({ id, payload }) : create.mutateAsync(payload);

  const onDelete = (p: Paciente) => {
    if (window.confirm(`Desactivar al paciente ${p.nombres} ${p.apellidos}?`)) remove.mutate(p.id);
  };

  const columns: Column<Paciente>[] = [
    { header: "Documento", cell: (p) => `${p.tipo_documento} ${p.numero_documento}` },
    { header: "Nombre", cell: (p) => `${p.nombres} ${p.apellidos}` },
    { header: "Telefono", cell: (p) => p.telefono ?? "—" },
    { header: "EPS", cell: (p) => p.eps ?? "—" },
    {
      header: "Estado",
      cell: (p) =>
        p.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>,
    },
    {
      header: "",
      className: "text-right w-24",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => abrirEditar(p)} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(p)} aria-label="Eliminar">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        subtitle="Gestiona las fichas de pacientes de la clinica."
        action={<Button onClick={abrirNuevo}><Plus className="h-4 w-4" /> Nuevo paciente</Button>}
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o documento..." />

      <DataTable
        columns={columns}
        rows={list.data ?? []}
        getKey={(p) => p.id}
        loading={list.isLoading}
        emptyText="No hay pacientes"
      />

      <PatientModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSave={onSave} />
    </div>
  );
}
