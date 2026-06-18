import { NextFunction, Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { ok } from "../utils/response";

/**
 * Endpoints PUBLICOS (sin autenticacion) para la landing.
 * Solo exponen datos no sensibles de la clinica indicada (?clinica=, por defecto 1).
 */

function clinicaId(req: Request): number {
  const raw = Number(req.query.clinica);
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

/** GET /api/public/specialties — especialidades activas de la clinica. */
export async function specialties(req: Request, res: Response, next: NextFunction) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombre, descripcion, icono FROM especialidades WHERE clinica_id = ? AND activo = 1 ORDER BY nombre",
      [clinicaId(req)]
    );
    return ok(res, rows, "Especialidades");
  } catch (err) {
    next(err);
  }
}

/** GET /api/public/doctors — directorio medico publico de la clinica. */
export async function doctors(req: Request, res: Response, next: NextFunction) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.id, m.nombres, m.apellidos, m.foto_url, m.biografia,
              GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR '||') AS especialidades
         FROM medicos m
         LEFT JOIN medico_especialidades me ON me.medico_id = m.id
         LEFT JOIN especialidades e ON e.id = me.especialidad_id AND e.activo = 1
        WHERE m.clinica_id = ? AND m.activo = 1
        GROUP BY m.id, m.nombres, m.apellidos, m.foto_url, m.biografia
        ORDER BY m.apellidos, m.nombres`,
      [clinicaId(req)]
    );
    const data = rows.map((r) => ({
      id: r.id,
      nombres: r.nombres,
      apellidos: r.apellidos,
      foto_url: r.foto_url,
      biografia: r.biografia,
      especialidades: r.especialidades ? String(r.especialidades).split("||") : [],
    }));
    return ok(res, data, "Directorio medico");
  } catch (err) {
    next(err);
  }
}
