import { api } from "./api";
import type { Usuario, Rol } from "@/types";

export const usersService = {
  async listRoles(): Promise<Rol[]> {
    const { data } = await api.get("/users/roles");
    return data.data;
  },
  async list(params: { search?: string; rol_id?: number } = {}): Promise<Usuario[]> {
    const { data } = await api.get("/users", { params });
    return data.data;
  },
  async create(payload: Record<string, unknown>): Promise<Usuario> {
    const { data } = await api.post("/users", payload);
    return data.data;
  },
  async update(id: number, payload: Record<string, unknown>): Promise<Usuario> {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

export { api };
