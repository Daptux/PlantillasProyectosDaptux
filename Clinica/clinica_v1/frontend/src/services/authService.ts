import { api } from "./api";
import type { ApiResponse, AuthResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPatientPayload {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento: string;
  fecha_nacimiento?: string;
  sexo?: "M" | "F" | "OTRO";
  clinica_id?: number;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
    return data.data;
  },

  async registerPatient(payload: RegisterPatientPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/register-patient", payload);
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },
};
