import { api } from "./api";
import { downloadFile } from "./documentsService";
import type { ResultadoMedico } from "@/types";

export const resultsService = {
  /** Listado general (staff: admin/laboratorio/medico). */
  async list(pacienteId?: number): Promise<ResultadoMedico[]> {
    const { data } = await api.get("/results", {
      params: pacienteId ? { paciente_id: pacienteId } : {},
    });
    return data.data;
  },

  /** Resultados del paciente autenticado. */
  async mine(): Promise<ResultadoMedico[]> {
    const { data } = await api.get("/results/mine");
    return data.data;
  },

  /** Resultados de un paciente (paciente solo los suyos). */
  async listByPatient(patientId: number): Promise<ResultadoMedico[]> {
    const { data } = await api.get(`/results/patient/${patientId}`);
    return data.data;
  },

  /** Carga un resultado (archivo opcional). */
  async upload(extra: Record<string, string | number>, file?: File | null): Promise<ResultadoMedico> {
    const form = new FormData();
    if (file) form.append("archivo", file);
    Object.entries(extra).forEach(([k, v]) => form.append(k, String(v)));
    const { data } = await api.post("/results/upload", form);
    return data.data;
  },

  download: (id: number, filename: string) => downloadFile(`/results/${id}/download`, filename),

  async remove(id: number): Promise<void> {
    await api.delete(`/results/${id}`);
  },
};

export { api };
