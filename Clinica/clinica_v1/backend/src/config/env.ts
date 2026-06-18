import dotenv from "dotenv";

dotenv.config();

/**
 * Configuracion central de variables de entorno.
 * Se valida que las criticas existan para fallar rapido al arrancar.
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable de entorno faltante: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",

  db: {
    host: required("DB_HOST", "localhost"),
    port: Number(process.env.DB_PORT ?? 3306),
    user: required("DB_USER", "root"),
    password: process.env.DB_PASSWORD ?? "",
    database: required("DB_NAME", "clinica_app"),
  },

  jwt: {
    secret: required("JWT_SECRET", "cambiar_este_secret"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
} as const;
