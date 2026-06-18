import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { UpdateLandingInput } from "../validations/landing.validation";

interface SeccionRow extends RowDataPacket {
  seccion: string;
  contenido: unknown;
  orden: number;
}

/**
 * Devuelve las secciones activas de la landing de una clinica.
 * El contenido (columna JSON) lo devuelve mysql2 ya parseado.
 */
export async function getLanding(clinicaId: number) {
  const [rows] = await pool.execute<SeccionRow[]>(
    `SELECT seccion, contenido, orden
       FROM contenido_landing
      WHERE clinica_id = ? AND activo = 1
      ORDER BY orden`,
    [clinicaId]
  );
  // mysql2 puede devolver la columna JSON como string: la normalizamos a objeto.
  return rows.map((r) => ({
    seccion: r.seccion,
    orden: r.orden,
    contenido: typeof r.contenido === "string" ? JSON.parse(r.contenido) : r.contenido,
  }));
}

/**
 * Inserta/actualiza (upsert) las secciones enviadas, dentro de una transaccion.
 * Usa la clave unica (clinica_id, seccion).
 */
export async function updateLanding(clinicaId: number, input: UpdateLandingInput) {
  const conn: PoolConnection = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const s of input.secciones) {
      // La columna es JSON (en MariaDB un alias de LONGTEXT): se guarda el string JSON.
      await conn.execute(
        `INSERT INTO contenido_landing (clinica_id, seccion, contenido, orden)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE contenido = VALUES(contenido), orden = VALUES(orden), activo = 1`,
        [clinicaId, s.seccion, JSON.stringify(s.contenido), s.orden ?? 0]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return getLanding(clinicaId);
}
