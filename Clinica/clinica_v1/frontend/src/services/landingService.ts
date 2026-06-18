import { api } from "./api";
import type { LandingSeccion } from "@/types";

export const landingService = {
  /** Lee el contenido de la landing (publico). */
  async get(clinica = 1): Promise<LandingSeccion[]> {
    const { data } = await api.get("/landing", { params: { clinica } });
    return data.data;
  },

  /** Actualiza secciones de la landing (admin). */
  async update(secciones: LandingSeccion[]): Promise<LandingSeccion[]> {
    const { data } = await api.put("/landing", { secciones });
    return data.data;
  },
};
