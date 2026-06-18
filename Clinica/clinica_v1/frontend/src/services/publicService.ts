import { api } from "./api";
import type { MedicoPublico, Especialidad } from "@/types";

/** Servicios publicos (sin auth) para la landing. */
export const publicService = {
  async doctors(clinica = 1): Promise<MedicoPublico[]> {
    const { data } = await api.get("/public/doctors", { params: { clinica } });
    return data.data;
  },
  async specialties(clinica = 1): Promise<Especialidad[]> {
    const { data } = await api.get("/public/specialties", { params: { clinica } });
    return data.data;
  },
};
