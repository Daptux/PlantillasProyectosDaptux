import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { patientsApi } from "@/services/adminService";
import { getApiError } from "@/lib/apiError";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (extra: Record<string, string | number>, file: File | null) => Promise<unknown>;
}

/** Modal para que laboratorio/medico/admin carguen un resultado. */
export default function ResultUploadModal({ open, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pacienteId, setPacienteId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: pacientes = [] } = useQuery({
    queryKey: ["patients", {}],
    queryFn: () => patientsApi.list(),
    enabled: open,
  });

  useEffect(() => {
    if (open) { setPacienteId(""); setTitulo(""); setDescripcion(""); setFecha(""); setError(""); if (fileRef.current) fileRef.current.value = ""; }
  }, [open]);

  const submit = async () => {
    if (!pacienteId) { setError("Selecciona un paciente"); return; }
    if (titulo.trim().length < 2) { setError("El titulo es requerido"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(
        {
          paciente_id: Number(pacienteId),
          titulo,
          ...(descripcion ? { descripcion } : {}),
          ...(fecha ? { fecha_resultado: fecha } : {}),
        },
        fileRef.current?.files?.[0] ?? null
      );
      onClose();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cargar resultado">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Paciente</Label>
          <Select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
            <option value="">Selecciona un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>{p.apellidos} {p.nombres} — {p.numero_documento}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Titulo</Label>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Hemograma completo" />
        </div>

        <div className="space-y-1.5">
          <Label>Descripcion</Label>
          <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Fecha del resultado</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Archivo (opcional, PDF/JPG/PNG/WEBP)</Label>
          <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" />
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Cargar"}</Button>
        </div>
      </div>
    </Modal>
  );
}
