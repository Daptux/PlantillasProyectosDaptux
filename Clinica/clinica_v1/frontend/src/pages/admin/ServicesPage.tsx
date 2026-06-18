import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable, { type Column } from "@/components/tables/DataTable";
import ServiceModal from "@/components/modals/ServiceModal";
import { useCrud } from "@/hooks/useCrud";
import { servicesApi, specialtiesApi, sedesApi } from "@/services/adminService";
import type { Servicio, Especialidad, Sede } from "@/types";

const fmtPrecio = (v: string) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));

export default function ServicesPage() {
  const { list, create, update, remove } = useCrud<Servicio>("services", servicesApi);
  const { list: especialidades } = useCrud<Especialidad>("specialties", specialtiesApi);
  const { list: sedes } = useCrud<Sede>("sedes", sedesApi);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);

  const sedeNombre = (id: number) => sedes.data?.find((s) => s.id === id)?.nombre ?? `#${id}`;

  const onSave = (payload: Record<string, unknown>, id?: number) =>
    id ? update.mutateAsync({ id, payload }) : create.mutateAsync(payload);

  const onDelete = (s: Servicio) => {
    if (window.confirm(`Desactivar el servicio "${s.nombre}"?`)) remove.mutate(s.id);
  };

  const columns: Column<Servicio>[] = [
    { header: "Servicio", cell: (s) => <span className="font-medium">{s.nombre}</span> },
    { header: "Especialidad", cell: (s) => s.especialidad_nombre ?? "—" },
    { header: "Duracion", cell: (s) => `${s.duracion_minutos} min` },
    { header: "Precio", cell: (s) => fmtPrecio(s.precio) },
    {
      header: "Sedes",
      cell: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.sede_ids.length === 0 ? "—" : s.sede_ids.map((id) => (
            <Badge key={id} variant="outline">{sedeNombre(id)}</Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Estado",
      cell: (s) => (s.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>),
    },
    {
      header: "",
      className: "text-right w-24",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setModalOpen(true); }} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(s)} aria-label="Eliminar">
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
          <h1 className="text-2xl font-bold">Servicios</h1>
          <p className="text-muted-foreground">Catalogo de servicios y su disponibilidad por sede.</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> Nuevo servicio</Button>
      </div>

      <DataTable columns={columns} rows={list.data ?? []} getKey={(s) => s.id} loading={list.isLoading} emptyText="No hay servicios" />

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        especialidades={especialidades.data ?? []}
        sedes={sedes.data ?? []}
        onSave={onSave}
      />
    </div>
  );
}
