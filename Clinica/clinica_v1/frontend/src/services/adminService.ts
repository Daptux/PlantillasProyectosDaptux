import { api } from "./api";
import type { Paciente, Medico, Servicio, Especialidad, Sede, HorarioMedico, BloqueoAgenda } from "@/types";

/** CRUD generico sobre un recurso REST con respuesta { success, message, data }. */
export interface Crud<T> {
  list: (params?: Record<string, unknown>) => Promise<T[]>;
  get: (id: number) => Promise<T>;
  create: (payload: Record<string, unknown>) => Promise<T>;
  update: (id: number, payload: Record<string, unknown>) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

function makeCrud<T>(base: string): Crud<T> {
  return {
    list: async (params) => (await api.get(base, { params })).data.data,
    get: async (id) => (await api.get(`${base}/${id}`)).data.data,
    create: async (payload) => (await api.post(base, payload)).data.data,
    update: async (id, payload) => (await api.put(`${base}/${id}`, payload)).data.data,
    remove: async (id) => {
      await api.delete(`${base}/${id}`);
    },
  };
}

export const patientsApi = makeCrud<Paciente>("/patients");
export const doctorsApi = makeCrud<Medico>("/doctors");
export const servicesApi = makeCrud<Servicio>("/services");
export const specialtiesApi = makeCrud<Especialidad>("/specialties");
export const sedesApi = makeCrud<Sede>("/sedes");

/** Sub-recursos del medico (horarios y bloqueos de agenda). */
export const doctorScheduleApi = {
  listHorarios: async (medicoId: number): Promise<HorarioMedico[]> =>
    (await api.get(`/doctors/${medicoId}/horarios`)).data.data,
  createHorario: async (medicoId: number, payload: Record<string, unknown>): Promise<HorarioMedico> =>
    (await api.post(`/doctors/${medicoId}/horarios`, payload)).data.data,
  deleteHorario: async (medicoId: number, horarioId: number): Promise<void> => {
    await api.delete(`/doctors/${medicoId}/horarios/${horarioId}`);
  },
  listBloqueos: async (medicoId: number): Promise<BloqueoAgenda[]> =>
    (await api.get(`/doctors/${medicoId}/bloqueos`)).data.data,
  createBloqueo: async (medicoId: number, payload: Record<string, unknown>): Promise<BloqueoAgenda> =>
    (await api.post(`/doctors/${medicoId}/bloqueos`, payload)).data.data,
  deleteBloqueo: async (medicoId: number, bloqueoId: number): Promise<void> => {
    await api.delete(`/doctors/${medicoId}/bloqueos/${bloqueoId}`);
  },
};
