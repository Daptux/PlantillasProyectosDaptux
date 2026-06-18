import { api } from "./api";
import type { DocumentoPaciente } from "@/types";

/** Dispara la descarga de un archivo protegido (la peticion lleva el JWT). */
export async function downloadFile(path: string, filename: string) {
  const res = await api.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const documentsService = {
  /** Documentos del paciente autenticado. */
  async mine(): Promise<DocumentoPaciente[]> {
    const { data } = await api.get("/documents/mine");
    return data.data;
  },

  /** Documentos de un paciente. */
  async listByPatient(patientId: number): Promise<DocumentoPaciente[]> {
    const { data } = await api.get(`/documents/patient/${patientId}`);
    return data.data;
  },

  /** Sube un documento (multipart). `extra` lleva tipo / paciente_id / cita_id. */
  async upload(file: File, extra: Record<string, string | number>): Promise<DocumentoPaciente> {
    const form = new FormData();
    form.append("archivo", file);
    Object.entries(extra).forEach(([k, v]) => form.append(k, String(v)));
    const { data } = await api.post("/documents/upload", form);
    return data.data;
  },

  download: (id: number, filename: string) => downloadFile(`/documents/${id}/download`, filename),

  async remove(id: number): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
