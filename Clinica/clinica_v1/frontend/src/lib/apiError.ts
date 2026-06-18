import { AxiosError } from "axios";

/**
 * Extrae el mensaje de error de la API ({ success, message, errors })
 * o devuelve un mensaje generico.
 */
export function getApiError(err: unknown, fallback = "Ocurrio un error"): string {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return axiosErr?.response?.data?.message ?? (err as Error)?.message ?? fallback;
}
