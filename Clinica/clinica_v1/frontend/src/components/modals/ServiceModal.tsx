import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiError } from "@/lib/apiError";
import type { Servicio, Especialidad, Sede } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Servicio | null;
  especialidades: Especialidad[];
  sedes: Sede[];
  onSave: (payload: Record<string, unknown>, id?: number) => Promise<unknown>;
}

export default function ServiceModal({ open, onClose, editing, especialidades, sedes, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [especialidadId, setEspecialidadId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState("30");
  const [precio, setPrecio] = useState("0");
  const [requiereOrden, setRequiereOrden] = useState(false);
  const [sedeIds, setSedeIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setNombre(editing?.nombre ?? "");
    setEspecialidadId(editing?.especialidad_id ? String(editing.especialidad_id) : "");
    setDescripcion(editing?.descripcion ?? "");
    setDuracion(String(editing?.duracion_minutos ?? 30));
    setPrecio(editing ? String(Number(editing.precio)) : "0");
    setRequiereOrden(!!editing?.requiere_orden);
    setSedeIds(editing?.sede_ids ?? []);
  }, [open, editing]);

  const toggleSede = (id: number) =>
    setSedeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async () => {
    if (nombre.trim().length < 2) { setError("El nombre es requerido"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(
        {
          nombre,
          especialidad_id: especialidadId ? Number(especialidadId) : null,
          descripcion: descripcion || undefined,
          duracion_minutos: Number(duracion),
          precio: Number(precio),
          requiere_orden: requiereOrden,
          sede_ids: sedeIds,
        },
        editing?.id
      );
      onClose();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar servicio" : "Nuevo servicio"}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nombre</Label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Especialidad</Label>
          <Select value={especialidadId} onChange={(e) => setEspecialidadId(e.target.value)}>
            <option value="">Sin especialidad</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Duracion (min)</Label>
            <Input type="number" min={5} step={5} value={duracion} onChange={(e) => setDuracion(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Precio</Label>
            <Input type="number" min={0} step={1000} value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Descripcion</Label>
          <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={requiereOrden} onChange={(e) => setRequiereOrden(e.target.checked)} />
          Requiere orden medica
        </label>

        <div className="space-y-1.5">
          <Label>Sedes donde se presta</Label>
          <div className="flex flex-wrap gap-2">
            {sedes.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input type="checkbox" checked={sedeIds.includes(s.id)} onChange={() => toggleSede(s.id)} />
                {s.nombre}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </div>
      </div>
    </Modal>
  );
}
