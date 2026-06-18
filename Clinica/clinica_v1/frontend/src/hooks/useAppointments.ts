import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "@/services/appointmentsService";
import type {
  ListAppointmentsFilters,
  CreateAppointmentPayload,
  ReschedulePayload,
  EstadoCita,
} from "@/types";

const KEY = "appointments";

/** Lista de citas (filtrada por rol en el backend). */
export function useAppointments(filters: ListAppointmentsFilters = {}) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => appointmentsService.list(filters),
  });
}

/** Catalogos para el formulario (medicos/servicios/sedes/pacientes). */
export function useAppointmentOptions() {
  return useQuery({
    queryKey: [KEY, "options"],
    queryFn: () => appointmentsService.options(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Invalida todas las queries de citas tras una mutacion. */
function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateAppointment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentsService.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAppointmentStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoCita }) =>
      appointmentsService.updateStatus(id, estado),
    onSuccess: invalidate,
  });
}

export function useRescheduleAppointment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReschedulePayload }) =>
      appointmentsService.reschedule(id, payload),
    onSuccess: invalidate,
  });
}

export function useCancelAppointment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => appointmentsService.cancel(id),
    onSuccess: invalidate,
  });
}
