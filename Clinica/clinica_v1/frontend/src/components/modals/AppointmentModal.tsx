import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppointmentOptions, useCreateAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/apiError";
import type { CreateAppointmentPayload } from "@/types";

const schema = z.object({
  paciente_id: z.string().optional(),
  medico_id: z.string().min(1, "Selecciona un medico"),
  servicio_id: z.string().optional(),
  sede_id: z.string().optional(),
  fecha: z.string().min(1, "Selecciona la fecha"),
  hora: z.string().min(1, "Selecciona la hora"),
  motivo: z.string().max(255).optional(),
  notas: z.string().max(2000).optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fecha (YYYY-MM-DD) preseleccionada al abrir desde el calendario. */
  defaultDate?: string;
}

/** Modal para agendar una nueva cita. */
export default function AppointmentModal({ open, onClose, defaultDate }: Props) {
  const { user } = useAuth();
  const esPaciente = user?.rol === "PACIENTE";
  const { data: options } = useAppointmentOptions();
  const createMut = useCreateAppointment();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: defaultDate ?? "", hora: "" },
  });

  const medicoId = watch("medico_id");
  const servicioId = watch("servicio_id");

  // Servicios disponibles para el medico seleccionado.
  const servicios = useMemo(() => {
    if (!options) return [];
    if (!medicoId) return options.servicios;
    const medico = options.medicos.find((m) => String(m.id) === medicoId);
    if (!medico || medico.servicio_ids.length === 0) return options.servicios;
    return options.servicios.filter((s) => medico.servicio_ids.includes(s.id));
  }, [options, medicoId]);

  // Sedes disponibles para el servicio seleccionado.
  const sedes = useMemo(() => {
    if (!options) return [];
    if (!servicioId) return options.sedes;
    const serv = options.servicios.find((s) => String(s.id) === servicioId);
    if (!serv || serv.sede_ids.length === 0) return options.sedes;
    return options.sedes.filter((se) => serv.sede_ids.includes(se.id));
  }, [options, servicioId]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateAppointmentPayload = {
      medico_id: Number(values.medico_id),
      fecha_inicio: `${values.fecha} ${values.hora}`,
      ...(values.servicio_id ? { servicio_id: Number(values.servicio_id) } : {}),
      ...(values.sede_id ? { sede_id: Number(values.sede_id) } : {}),
      ...(values.motivo ? { motivo: values.motivo } : {}),
      ...(values.notas ? { notas: values.notas } : {}),
      ...(!esPaciente && values.paciente_id ? { paciente_id: Number(values.paciente_id) } : {}),
    };
    await createMut.mutateAsync(payload);
    reset();
    onClose();
  });

  return (
    <Modal open={open} onClose={onClose} title="Agendar cita" description="Completa los datos de la cita.">
      <form onSubmit={onSubmit} className="space-y-4">
        {!esPaciente && (
          <div className="space-y-1.5">
            <Label htmlFor="paciente_id">Paciente</Label>
            <Select id="paciente_id" {...register("paciente_id")}>
              <option value="">Selecciona un paciente</option>
              {options?.pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellidos} {p.nombres} — {p.numero_documento}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="medico_id">Medico</Label>
          <Select id="medico_id" {...register("medico_id")}>
            <option value="">Selecciona un medico</option>
            {options?.medicos.map((m) => (
              <option key={m.id} value={m.id}>
                Dr(a). {m.nombres} {m.apellidos}
              </option>
            ))}
          </Select>
          {errors.medico_id && <p className="text-xs text-destructive">{errors.medico_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="servicio_id">Servicio</Label>
            <Select id="servicio_id" {...register("servicio_id")}>
              <option value="">Sin servicio (30 min)</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.duracion_minutos}m)
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sede_id">Sede</Label>
            <Select id="sede_id" {...register("sede_id")}>
              <option value="">Sin sede</option>
              {sedes.map((se) => (
                <option key={se.id} value={se.id}>
                  {se.nombre}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" {...register("fecha")} />
            {errors.fecha && <p className="text-xs text-destructive">{errors.fecha.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hora">Hora</Label>
            <Input id="hora" type="time" step={300} {...register("hora")} />
            {errors.hora && <p className="text-xs text-destructive">{errors.hora.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="motivo">Motivo</Label>
          <Input id="motivo" placeholder="Motivo de la consulta" {...register("motivo")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas</Label>
          <Textarea id="notas" placeholder="Notas adicionales (opcional)" {...register("notas")} />
        </div>

        {createMut.isError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {getApiError(createMut.error)}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || createMut.isPending}>
            {createMut.isPending ? "Guardando..." : "Agendar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
