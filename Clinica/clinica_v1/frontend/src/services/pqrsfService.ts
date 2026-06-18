import { api } from "./api";
import type { Pqrsf, CreatePqrsfPayload, EstadoPqrsf, TipoPqrsf } from "@/types";

export const pqrsfService = {
  /** Crea una PQRSF (publico desde landing o paciente logueado). */
  async create(payload: CreatePqrsfPayload): Promise<Pqrsf> {
    const { data } = await api.post("/pqrsf", payload);
    return data.data;
  },

  /** PQRSF del paciente autenticado. */
  async mine(): Promise<Pqrsf[]> {
    const { data } = await api.get("/pqrsf/mine");
    return data.data;
  },

  /** Listado para gestion (admin/recepcion). */
  async list(filters: { estado?: EstadoPqrsf; tipo?: TipoPqrsf } = {}): Promise<Pqrsf[]> {
    const { data } = await api.get("/pqrsf", { params: filters });
    return data.data;
  },

  /** Responde una PQRSF. */
  async respond(id: number, respuesta: string, estado: EstadoPqrsf = "RESPONDIDA"): Promise<Pqrsf> {
    const { data } = await api.put(`/pqrsf/${id}/respond`, { respuesta, estado });
    return data.data;
  },

  /** Cambia el estado de una PQRSF. */
  async updateStatus(id: number, estado: EstadoPqrsf): Promise<Pqrsf> {
    const { data } = await api.put(`/pqrsf/${id}/status`, { estado });
    return data.data;
  },
};

export { api };
