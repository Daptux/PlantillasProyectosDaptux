import { Request } from "express";
import { pool } from "../config/db";

/**
 * Registra una accion sensible en la tabla auditoria.
 * Se llama desde los servicios/controladores. Nunca lanza:
 * un fallo de auditoria no debe romper la operacion principal.
 */
export async function audit(
  req: Request,
  accion: string,
  entidad?: string,
  entidadId?: number | null,
  detalle?: unknown
): Promise<void> {
  try {
    await pool.execute(
      `INSERT INTO auditoria (clinica_id, usuario_id, accion, entidad, entidad_id, detalle, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.clinicaId ?? null,
        req.user?.id ?? null,
        accion,
        entidad ?? null,
        entidadId ?? null,
        detalle ? JSON.stringify(detalle) : null,
        req.ip ?? null,
        (req.headers["user-agent"] ?? "").toString().slice(0, 255),
      ]
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("⚠️  No se pudo registrar auditoria:", (e as Error).message);
  }
}
