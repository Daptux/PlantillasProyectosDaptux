import { api } from "./api";
import type {
  Cita,
  AppointmentOptions,
  ListAppointmentsFilters,
  CreateAppointmentPayload,
  ReschedulePayload,
  EstadoCita,
} from "@/types";

/**
 * Servicio del modulo de CITAS. Usa el cliente axios centralizado `api`
 * (inyecta el JWT). Todas las respuestas vienen como { success, message, data }.
 */
export const appointmentsService = {
  /** Lista citas (el backend filtra por rol). */
  async list(filters: ListAppointmentsFilters = {}): Promise<Cita[]> {
    const { data } = await api.get("/appointments", { params: filters });
    return data.data;
  },

  /** Catalogos para el formulario de cita. */
  async options(): Promise<AppointmentOptions> {
    const { data } = await api.get("/appointments/options");
    return data.data;
  },

  /** Detalle de una cita. */
  async get(id: number): Promise<Cita> {
    const { data } = await api.get(`/appointments/${id}`);
    return data.data;
  },

  /** Crea una cita. */
  async create(payload: CreateAppointmentPayload): Promise<Cita> {
    const { data } = await api.post("/appointments", payload);
    return data.data;
  },

  /** Cambia el estado de una cita. */
  async updateStatus(id: number, estado: EstadoCita): Promise<Cita> {
    const { data } = await api.put(`/appointments/${id}/status`, { estado });
    return data.data;
  },

  /** Reprograma una cita. */
  async reschedule(id: number, payload: ReschedulePayload): Promise<Cita> {
    const { data } = await api.put(`/appointments/${id}/reschedule`, payload);
    return data.data;
  },

  /** Cancela (logicamente) una cita. */
  async cancel(id: number): Promise<Cita> {
    const { data } = await api.delete(`/appointments/${id}`);
    return data.data;
  },
};

export { api };
