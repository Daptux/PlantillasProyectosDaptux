import { api } from "./api";
import type { Pago, CreatePaymentPayload, EstadoPago, MetodoPago } from "@/types";

export const paymentsService = {
  /** Lista pagos (el backend filtra: paciente solo los suyos). */
  async list(filters: { estado?: EstadoPago; paciente_id?: number } = {}): Promise<Pago[]> {
    const { data } = await api.get("/payments", { params: filters });
    return data.data;
  },

  async get(id: number): Promise<Pago> {
    const { data } = await api.get(`/payments/${id}`);
    return data.data;
  },

  /** Crea una factura/pago (admin/facturacion). */
  async create(payload: CreatePaymentPayload): Promise<Pago> {
    const { data } = await api.post("/payments", payload);
    return data.data;
  },

  /** Cambia el estado de un pago (admin/facturacion). */
  async updateStatus(id: number, estado: EstadoPago, metodo?: MetodoPago): Promise<Pago> {
    const { data } = await api.put(`/payments/${id}/status`, { estado, ...(metodo ? { metodo } : {}) });
    return data.data;
  },

  /** El paciente paga su factura pendiente. */
  async pay(id: number, metodo?: MetodoPago): Promise<Pago> {
    const { data } = await api.post(`/payments/${id}/pay`, metodo ? { metodo } : {});
    return data.data;
  },
};

export { api };
