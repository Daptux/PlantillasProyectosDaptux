import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TIPO_PQRSF_LABEL, ESTADO_PQRSF_LABEL } from "@/lib/pqrsf";
import { getApiError } from "@/lib/apiError";
import type { Pqrsf, EstadoPqrsf } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  pqrsf: Pqrsf | null;
  onSave: (id: number, respuesta: string, estado: EstadoPqrsf) => Promise<unknown>;
}

/** Modal para responder una PQRSF (admin/recepcion). */
export default function PqrsfRespondModal({ open, onClose, pqrsf, onSave }: Props) {
  const [respuesta, setRespuesta] = useState("");
  const [estado, setEstado] = useState<EstadoPqrsf>("RESPONDIDA");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && pqrsf) {
      setRespuesta(pqrsf.respuesta ?? "");
      setEstado(pqrsf.estado === "ABIERTA" ? "RESPONDIDA" : pqrsf.estado);
      setError("");
    }
  }, [open, pqrsf]);

  if (!pqrsf) return null;

  const submit = async () => {
    if (respuesta.trim().length < 2) { setError("Escribe una respuesta"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(pqrsf.id, respuesta, estado);
      onClose();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Responder PQRSF" className="max-w-2xl">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="outline">{TIPO_PQRSF_LABEL[pqrsf.tipo]}</Badge>
            <span className="font-semibold">{pqrsf.asunto}</span>
          </div>
          <p className="text-sm text-muted-foreground">{pqrsf.mensaje}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            De: {pqrsf.paciente_nombres ? `${pqrsf.paciente_nombres} ${pqrsf.paciente_apellidos}` : pqrsf.nombre_remitente ?? "Anonimo"}
            {pqrsf.email_remitente ? ` · ${pqrsf.email_remitente}` : ""}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Respuesta</Label>
          <Textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} className="min-h-[120px]" />
        </div>

        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select value={estado} onChange={(e) => setEstado(e.target.value as EstadoPqrsf)} className="w-48">
            {(["EN_PROCESO", "RESPONDIDA", "CERRADA"] as EstadoPqrsf[]).map((s) => (
              <option key={s} value={s}>{ESTADO_PQRSF_LABEL[s]}</option>
            ))}
          </Select>
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Enviar respuesta"}</Button>
        </div>
      </div>
    </Modal>
  );
}
