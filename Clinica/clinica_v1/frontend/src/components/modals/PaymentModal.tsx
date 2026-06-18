import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { patientsApi } from "@/services/adminService";
import { METODO_PAGO_LABEL, METODOS_PAGO } from "@/lib/payments";
import { getApiError } from "@/lib/apiError";
import type { CreatePaymentPayload, MetodoPago } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreatePaymentPayload) => Promise<unknown>;
}

/** Modal para registrar una nueva factura/pago. */
export default function PaymentModal({ open, onClose, onSave }: Props) {
  const [pacienteId, setPacienteId] = useState("");
  const [concepto, setConcepto] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("OTRO");
  const [pagado, setPagado] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: pacientes = [] } = useQuery({
    queryKey: ["patients", {}],
    queryFn: () => patientsApi.list(),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setPacienteId(""); setConcepto(""); setNumeroFactura(""); setMonto("");
      setMetodo("OTRO"); setPagado(false); setError("");
    }
  }, [open]);

  const submit = async () => {
    if (!pacienteId) { setError("Selecciona un paciente"); return; }
    if (!monto || Number(monto) < 0) { setError("Monto invalido"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({
        paciente_id: Number(pacienteId),
        monto: Number(monto),
        metodo,
        ...(concepto ? { concepto } : {}),
        ...(numeroFactura ? { numero_factura: numeroFactura } : {}),
        ...(pagado ? { estado: "PAGADO" } : {}),
      });
      onClose();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva factura / pago">
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
          <Label>Concepto</Label>
          <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej: Consulta medicina general" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>N.º factura</Label>
            <Input value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Monto (COP)</Label>
            <Input type="number" min={0} step={1000} value={monto} onChange={(e) => setMonto(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Metodo</Label>
          <Select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPago)}>
            {METODOS_PAGO.map((m) => <option key={m} value={m}>{METODO_PAGO_LABEL[m]}</option>)}
          </Select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pagado} onChange={(e) => setPagado(e.target.checked)} />
          Registrar como ya pagado
        </label>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Registrar"}</Button>
        </div>
      </div>
    </Modal>
  );
}
