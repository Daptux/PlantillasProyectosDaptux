import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus } from "lucide-react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { doctorScheduleApi } from "@/services/adminService";
import { getApiError } from "@/lib/apiError";
import type { Medico, Sede } from "@/types";

const DIAS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

interface Props {
  open: boolean;
  onClose: () => void;
  medico: Medico | null;
  sedes: Sede[];
}

/** Gestiona horarios recurrentes y bloqueos puntuales de un medico. */
export default function ScheduleModal({ open, onClose, medico, sedes }: Props) {
  const qc = useQueryClient();
  const medicoId = medico?.id ?? 0;
  const [error, setError] = useState("");

  // Form de nuevo horario.
  const [dia, setDia] = useState("1");
  const [ini, setIni] = useState("08:00");
  const [fin, setFin] = useState("12:00");
  const [sedeId, setSedeId] = useState("");
  // Form de nuevo bloqueo.
  const [bIni, setBIni] = useState("");
  const [bFin, setBFin] = useState("");
  const [motivo, setMotivo] = useState("");

  const horarios = useQuery({
    queryKey: ["horarios", medicoId],
    queryFn: () => doctorScheduleApi.listHorarios(medicoId),
    enabled: open && medicoId > 0,
  });
  const bloqueos = useQuery({
    queryKey: ["bloqueos", medicoId],
    queryFn: () => doctorScheduleApi.listBloqueos(medicoId),
    enabled: open && medicoId > 0,
  });

  const inval = (k: string) => qc.invalidateQueries({ queryKey: [k, medicoId] });

  const addHorario = useMutation({
    mutationFn: () =>
      doctorScheduleApi.createHorario(medicoId, {
        dia_semana: Number(dia),
        hora_inicio: ini,
        hora_fin: fin,
        sede_id: sedeId ? Number(sedeId) : null,
      }),
    onSuccess: () => inval("horarios"),
    onError: (e) => setError(getApiError(e)),
  });
  const delHorario = useMutation({
    mutationFn: (id: number) => doctorScheduleApi.deleteHorario(medicoId, id),
    onSuccess: () => inval("horarios"),
  });
  const addBloqueo = useMutation({
    mutationFn: () =>
      doctorScheduleApi.createBloqueo(medicoId, {
        fecha_inicio: bIni.replace("T", " "),
        fecha_fin: bFin.replace("T", " "),
        motivo: motivo || undefined,
      }),
    onSuccess: () => { inval("bloqueos"); setBIni(""); setBFin(""); setMotivo(""); },
    onError: (e) => setError(getApiError(e)),
  });
  const delBloqueo = useMutation({
    mutationFn: (id: number) => doctorScheduleApi.deleteBloqueo(medicoId, id),
    onSuccess: () => inval("bloqueos"),
  });

  if (!medico) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Agenda de Dr(a). ${medico.nombres} ${medico.apellidos}`}
      description="Horarios de atencion y bloqueos."
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* HORARIOS */}
        <section className="space-y-3">
          <h3 className="font-semibold">Horarios de atencion</h3>
          <div className="space-y-1">
            {horarios.data?.length === 0 && <p className="text-sm text-muted-foreground">Sin horarios.</p>}
            {horarios.data?.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span>
                  <span className="font-medium">{DIAS[h.dia_semana]}</span> · {h.hora_inicio.slice(0, 5)}–{h.hora_fin.slice(0, 5)}
                  {h.sede_id ? ` · ${sedes.find((s) => s.id === h.sede_id)?.nombre ?? ""}` : ""}
                </span>
                <Button variant="ghost" size="icon" onClick={() => delHorario.mutate(h.id)} aria-label="Eliminar">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Dia</Label>
              <Select value={dia} onChange={(e) => setDia(e.target.value)}>
                {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Inicio</Label>
              <Input type="time" value={ini} onChange={(e) => setIni(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fin</Label>
              <Input type="time" value={fin} onChange={(e) => setFin(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sede</Label>
              <Select value={sedeId} onChange={(e) => setSedeId(e.target.value)}>
                <option value="">—</option>
                {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </Select>
            </div>
          </div>
          <Button size="sm" onClick={() => { setError(""); addHorario.mutate(); }} disabled={addHorario.isPending}>
            <Plus className="h-4 w-4" /> Agregar horario
          </Button>
        </section>

        {/* BLOQUEOS */}
        <section className="space-y-3 border-t pt-4">
          <h3 className="font-semibold">Bloqueos de agenda</h3>
          <div className="space-y-1">
            {bloqueos.data?.length === 0 && <p className="text-sm text-muted-foreground">Sin bloqueos.</p>}
            {bloqueos.data?.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span>
                  {b.fecha_inicio.slice(0, 16)} → {b.fecha_fin.slice(0, 16)}
                  {b.motivo ? ` · ${b.motivo}` : ""}
                </span>
                <Button variant="ghost" size="icon" onClick={() => delBloqueo.mutate(b.id)} aria-label="Eliminar">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input type="datetime-local" value={bIni} onChange={(e) => setBIni(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input type="datetime-local" value={bFin} onChange={(e) => setBFin(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Motivo</Label>
              <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => { setError(""); addBloqueo.mutate(); }}
            disabled={addBloqueo.isPending || !bIni || !bFin}
          >
            <Plus className="h-4 w-4" /> Agregar bloqueo
          </Button>
        </section>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
}
