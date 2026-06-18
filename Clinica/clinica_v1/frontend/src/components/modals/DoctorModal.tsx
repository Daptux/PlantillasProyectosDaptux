import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiError } from "@/lib/apiError";
import type { Medico, Especialidad, Servicio } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Medico | null;
  especialidades: Especialidad[];
  servicios: Servicio[];
  onSave: (payload: Record<string, unknown>, id?: number) => Promise<unknown>;
}

export default function DoctorModal({ open, onClose, editing, especialidades, servicios, onSave }: Props) {
  const [form, setForm] = useState({
    numero_documento: "",
    nombres: "",
    apellidos: "",
    registro_medico: "",
    telefono: "",
    email: "",
    biografia: "",
  });
  const [especialidadIds, setEspecialidadIds] = useState<number[]>([]);
  const [servicioIds, setServicioIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm({
      numero_documento: editing?.numero_documento ?? "",
      nombres: editing?.nombres ?? "",
      apellidos: editing?.apellidos ?? "",
      registro_medico: editing?.registro_medico ?? "",
      telefono: editing?.telefono ?? "",
      email: editing?.email ?? "",
      biografia: editing?.biografia ?? "",
    });
    setEspecialidadIds(editing?.especialidad_ids ?? []);
    setServicioIds(editing?.servicio_ids ?? []);
  }, [open, editing]);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const toggle = (arr: number[], setArr: (v: number[]) => void, id: number) =>
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const submit = async () => {
    if (form.numero_documento.length < 3 || form.nombres.length < 2 || form.apellidos.length < 2) {
      setError("Documento, nombres y apellidos son requeridos");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(
        {
          ...form,
          registro_medico: form.registro_medico || undefined,
          telefono: form.telefono || undefined,
          email: form.email || undefined,
          biografia: form.biografia || undefined,
          especialidad_ids: especialidadIds,
          servicio_ids: servicioIds,
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

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar medico" : "Nuevo medico"} className="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>N.º documento</Label>
            <Input value={form.numero_documento} onChange={(e) => set("numero_documento", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Registro medico</Label>
            <Input value={form.registro_medico} onChange={(e) => set("registro_medico", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nombres</Label>
            <Input value={form.nombres} onChange={(e) => set("nombres", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Apellidos</Label>
            <Input value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Telefono</Label>
            <Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Biografia</Label>
          <Textarea value={form.biografia} onChange={(e) => set("biografia", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Especialidades</Label>
          <div className="flex flex-wrap gap-2">
            {especialidades.map((e) => (
              <Chip key={e.id} active={especialidadIds.includes(e.id)} onClick={() => toggle(especialidadIds, setEspecialidadIds, e.id)}>
                {e.nombre}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Servicios que atiende</Label>
          <div className="flex flex-wrap gap-2">
            {servicios.map((s) => (
              <Chip key={s.id} active={servicioIds.includes(s.id)} onClick={() => toggle(servicioIds, setServicioIds, s.id)}>
                {s.nombre}
              </Chip>
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
