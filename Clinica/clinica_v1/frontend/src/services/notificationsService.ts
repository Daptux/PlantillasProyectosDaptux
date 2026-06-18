import { api } from "./api";
import type { Notificacion } from "@/types";

export const notificationsService = {
  async list(): Promise<Notificacion[]> {
    const { data } = await api.get("/notifications");
    return data.data;
  },
  async unreadCount(): Promise<number> {
    const { data } = await api.get("/notifications/unread-count");
    return data.data.count;
  },
  async markRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },
  async markAllRead(): Promise<void> {
    await api.put("/notifications/read-all");
  },
};
