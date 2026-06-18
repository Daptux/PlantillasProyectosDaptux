import { useState } from "react";
import { Plus, Pencil, Trash2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable, { type Column } from "@/components/tables/DataTable";
import DoctorModal from "@/components/modals/DoctorModal";
import ScheduleModal from "@/components/modals/ScheduleModal";
import { useCrud } from "@/hooks/useCrud";
import { doctorsApi, specialtiesApi, servicesApi, sedesApi } from "@/services/adminService";
import type { Medico, Especialidad, Servicio, Sede } from "@/types";

export default function DoctorsPage() {
  const { list, create, update, remove } = useCrud<Medico>("doctors", doctorsApi);
  const { list: especialidades } = useCrud<Especialidad>("specialties", specialtiesApi);
  const { list: servicios } = useCrud<Servicio>("services", servicesApi);
  const { list: sedes } = useCrud<Sede>("sedes", sedesApi);

  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editing, setEditing] = useState<Medico | null>(null);
  const [scheduling, setScheduling] = useState<Medico | null>(null);

  const espNombre = (id: number) => especialidades.data?.find((e) => e.id === id)?.nombre ?? `#${id}`;

  const onSave = (payload: Record<string, unknown>, id?: number) =>
    id ? update.mutateAsync({ id, payload }) : create.mutateAsync(payload);

  const onDelete = (m: Medico) => {
    if (window.confirm(`Desactivar al medico ${m.nombres} ${m.apellidos}?`)) remove.mutate(m.id);
  };

  const columns: Column<Medico>[] = [
    { header: "Medico", cell: (m) => <span className="font-medium">{m.nombres} {m.apellidos}</span> },
    { header: "Documento", cell: (m) => m.numero_documento },
    { header: "Reg. medico", cell: (m) => m.registro_medico ?? "—" },
    {
      header: "Especialidades",
      cell: (m) => (
        <div className="flex flex-wrap gap-1">
          {m.especialidad_ids.length === 0 ? "—" : m.especialidad_ids.map((id) => (
            <Badge key={id} variant="secondary">{espNombre(id)}</Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Estado",
      cell: (m) => (m.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>),
    },
    {
      header: "",
      className: "text-right w-32",
      cell: (m) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setScheduling(m); setScheduleOpen(true); }} aria-label="Agenda">
            <CalendarClock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setEditing(m); setModalOpen(true); }} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(m)} aria-label="Eliminar">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Medicos</h1>
          <p className="text-muted-foreground">Perfiles profesionales, especialidades y agenda.</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> Nuevo medico</Button>
      </div>

      <DataTable columns={columns} rows={list.data ?? []} getKey={(m) => m.id} loading={list.isLoading} emptyText="No hay medicos" />

      <DoctorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        especialidades={especialidades.data ?? []}
        servicios={servicios.data ?? []}
        onSave={onSave}
      />
      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        medico={scheduling}
        sedes={sedes.data ?? []}
      />
    </div>
  );
}
