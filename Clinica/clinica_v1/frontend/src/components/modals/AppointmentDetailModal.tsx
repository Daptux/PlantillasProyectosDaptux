import { useState } from "react";
import { CalendarClock, User, Stethoscope, MapPin, FileText } from "lucide-react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  useUpdateAppointmentStatus,
  useRescheduleAppointment,
  useCancelAppointment,
} from "@/hooks/useAppointments";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/apiError";
import {
  ESTADO_LABEL,
  ESTADO_VARIANT,
  ESTADOS_CITA,
  formatFechaHora,
  formatHora,
  parseApiDate,
  toDateInput,
  toTimeInput,
} from "@/lib/appointments";
import type { Cita, EstadoCita } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  cita: Cita | null;
}

const ROLES_ESTADO = ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION", "MEDICO"];
const ROLES_REPROGRAMA = ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION", "PACIENTE"];

/** Modal de detalle de una cita con acciones segun rol. */
export default function AppointmentDetailModal({ open, onClose, cita }: Props) {
  const { user } = useAuth();
  const statusMut = useUpdateAppointmentStatus();
  const rescheduleMut = useRescheduleAppointment();
  const cancelMut = useCancelAppointment();

  const [reprogramando, setReprogramando] = useState(false);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  if (!cita) return null;

  const rol = user?.rol ?? "";
  const puedeEstado = ROLES_ESTADO.includes(rol);
  const puedeReprogramar = ROLES_REPROGRAMA.includes(rol);
  const finalizada = cita.estado === "CANCELADA" || cita.estado === "ATENDIDA";
  const error = statusMut.error ?? rescheduleMut.error ?? cancelMut.error;

  const abrirReprogramar = () => {
    const d = parseApiDate(cita.fecha_inicio);
    setFecha(toDateInput(d));
    setHora(toTimeInput(d));
    setReprogramando(true);
  };

  const confirmarReprogramar = async () => {
    await rescheduleMut.mutateAsync({ id: cita.id, payload: { fecha_inicio: `${fecha} ${hora}` } });
    setReprogramando(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Detalle de la cita">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={ESTADO_VARIANT[cita.estado]}>{ESTADO_LABEL[cita.estado]}</Badge>
          <span className="text-sm text-muted-foreground">#{cita.id}</span>
        </div>

        <dl className="space-y-3 text-sm">
          <Row icon={CalendarClock} label="Fecha y hora">
            {formatFechaHora(cita.fecha_inicio)} – {formatHora(cita.fecha_fin)}
          </Row>
          <Row icon={User} label="Paciente">
            {cita.paciente_nombres} {cita.paciente_apellidos} ({cita.paciente_documento})
          </Row>
          <Row icon={Stethoscope} label="Medico">
            Dr(a). {cita.medico_nombres} {cita.medico_apellidos}
          </Row>
          {cita.servicio_nombre && (
            <Row icon={FileText} label="Servicio">
              {cita.servicio_nombre}
            </Row>
          )}
          {cita.sede_nombre && (
            <Row icon={MapPin} label="Sede">
              {cita.sede_nombre}
            </Row>
          )}
          {cita.motivo && (
            <Row icon={FileText} label="Motivo">
              {cita.motivo}
            </Row>
          )}
        </dl>

        {/* Cambio de estado (staff/medico) */}
        {puedeEstado && !finalizada && (
          <div className="space-y-1.5 border-t pt-4">
            <Label htmlFor="estado">Cambiar estado</Label>
            <Select
              id="estado"
              value={cita.estado}
              disabled={statusMut.isPending}
              onChange={(e) =>
                statusMut.mutate({ id: cita.id, estado: e.target.value as EstadoCita })
              }
            >
              {ESTADOS_CITA.map((s) => (
                <option key={s} value={s}>
                  {ESTADO_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Reprogramar */}
        {puedeReprogramar && !finalizada && reprogramando && (
          <div className="space-y-3 border-t pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="r-fecha">Nueva fecha</Label>
                <Input id="r-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-hora">Nueva hora</Label>
                <Input id="r-hora" type="time" step={300} value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setReprogramando(false)}>
                Volver
              </Button>
              <Button size="sm" onClick={confirmarReprogramar} disabled={rescheduleMut.isPending}>
                {rescheduleMut.isPending ? "Guardando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {getApiError(error)}
          </p>
        )}

        {/* Acciones */}
        {!finalizada && !reprogramando && (
          <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
            {puedeReprogramar && (
              <Button variant="outline" onClick={abrirReprogramar}>
                Reprogramar
              </Button>
            )}
            {puedeReprogramar && (
              <Button
                variant="destructive"
                onClick={async () => {
                  await cancelMut.mutateAsync(cita.id);
                  onClose();
                }}
                disabled={cancelMut.isPending}
              >
                {cancelMut.isPending ? "Cancelando..." : "Cancelar cita"}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}
