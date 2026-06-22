/**
 * backend/src/utils/logger.js
 * Registra acciones importantes en la tabla logs_actividad.
 * No lanza errores: el logging nunca debe romper la operación principal.
 */
const { pool } = require('../config/db');

async function registrarLog({ usuarioId = null, accion, entidad = null, entidadId = null, detalle = null, ip = null }) {
  try {
    await pool.query(
      `INSERT INTO logs_actividad (usuario_id, accion, entidad, entidad_id, detalle, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, accion, entidad, entidadId, detalle, ip]
    );
  } catch (err) {
    console.error('⚠️  Error registrando log de actividad:', err.message);
  }
}

module.exports = { registrarLog };
