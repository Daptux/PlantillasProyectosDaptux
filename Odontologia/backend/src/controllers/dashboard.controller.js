/**
 * backend/src/controllers/dashboard.controller.js
 * Métricas del dashboard, reportes básicos y seguimiento de pacientes.
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/dashboard/resumen */
const resumen = asyncHandler(async (req, res) => {
  const [[citasHoy]] = await pool.query(
    "SELECT COUNT(*) AS total FROM citas WHERE fecha = CURDATE() AND estado NOT IN ('CANCELADA','NO_ASISTIO')"
  );
  const [[porConfirmar]] = await pool.query(
    "SELECT COUNT(*) AS total FROM citas WHERE estado = 'SOLICITADA'"
  );
  const [[pacientesNuevos]] = await pool.query(
    "SELECT COUNT(*) AS total FROM pacientes WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())"
  );
  const [[ingresosHoy]] = await pool.query(
    'SELECT COALESCE(SUM(monto),0) AS total FROM pagos WHERE DATE(fecha) = CURDATE()'
  );
  const [[ingresosMes]] = await pool.query(
    'SELECT COALESCE(SUM(monto),0) AS total FROM pagos WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())'
  );
  const [[tratamientosActivos]] = await pool.query(
    "SELECT COUNT(*) AS total FROM planes_tratamiento WHERE estado IN ('ACEPTADO','EN_PROCESO')"
  );
  const [[insumosBajos]] = await pool.query(
    'SELECT COUNT(*) AS total FROM inventario WHERE estado = 1 AND stock_actual <= stock_minimo'
  );
  const [[canceladas]] = await pool.query(
    "SELECT COUNT(*) AS total FROM citas WHERE estado IN ('CANCELADA','NO_ASISTIO') AND MONTH(fecha) = MONTH(CURDATE())"
  );

  // Pacientes con saldo pendiente
  const [[saldosPendientes]] = await pool.query(
    `SELECT COUNT(*) AS total FROM (
        SELECT pt.paciente_id,
               SUM(pt.total_final) - COALESCE((SELECT SUM(pg.monto) FROM pagos pg WHERE pg.paciente_id = pt.paciente_id),0) AS saldo
        FROM planes_tratamiento pt
        WHERE pt.estado <> 'CANCELADO'
        GROUP BY pt.paciente_id
        HAVING saldo > 0
     ) t`
  );

  // Próximos controles (evoluciones con próxima cita sugerida futura)
  const [[proximosControles]] = await pool.query(
    'SELECT COUNT(*) AS total FROM evoluciones_clinicas WHERE proxima_cita_sugerida >= CURDATE()'
  );

  // Servicios más solicitados (top 5)
  const [serviciosTop] = await pool.query(
    `SELECT s.nombre, COUNT(*) AS total FROM citas c
     JOIN servicios s ON s.id = c.servicio_id
     GROUP BY c.servicio_id ORDER BY total DESC LIMIT 5`
  );

  // Agenda del día
  const [agendaHoy] = await pool.query(
    `SELECT c.id, c.hora_inicio, c.estado,
            CONCAT(COALESCE(p.nombres,c.nombre_contacto),' ',COALESCE(p.apellidos,'')) AS paciente,
            o.nombre AS odontologo, s.nombre AS servicio
     FROM citas c
     LEFT JOIN pacientes p ON p.id = c.paciente_id
     LEFT JOIN odontologos o ON o.id = c.odontologo_id
     LEFT JOIN servicios s ON s.id = c.servicio_id
     WHERE c.fecha = CURDATE() ORDER BY c.hora_inicio`
  );

  res.json({
    ok: true,
    data: {
      citasHoy: citasHoy.total,
      citasPorConfirmar: porConfirmar.total,
      pacientesNuevosMes: pacientesNuevos.total,
      ingresosHoy: Number(ingresosHoy.total),
      ingresosMes: Number(ingresosMes.total),
      tratamientosActivos: tratamientosActivos.total,
      pacientesConSaldo: saldosPendientes.total,
      insumosBajos: insumosBajos.total,
      proximosControles: proximosControles.total,
      citasCanceladasMes: canceladas.total,
      serviciosTop,
      agendaHoy,
    },
  });
});

/** GET /api/dashboard/reportes?desde=&hasta= */
const reportes = asyncHandler(async (req, res) => {
  const desde = req.query.desde || null;
  const hasta = req.query.hasta || null;
  const rango = desde && hasta;

  const citasPorEstado = (await pool.query(
    `SELECT estado, COUNT(*) AS total FROM citas
     ${rango ? 'WHERE fecha BETWEEN ? AND ?' : ''} GROUP BY estado`,
    rango ? [desde, hasta] : []
  ))[0];

  const ingresosPorMes = (await pool.query(
    `SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, SUM(monto) AS total
     FROM pagos GROUP BY mes ORDER BY mes DESC LIMIT 12`
  ))[0];

  const ingresosPorServicio = (await pool.query(
    `SELECT s.nombre, SUM(pg.monto) AS total
     FROM pagos pg
     JOIN citas c ON c.id = pg.cita_id
     JOIN servicios s ON s.id = c.servicio_id
     ${rango ? 'WHERE DATE(pg.fecha) BETWEEN ? AND ?' : ''}
     GROUP BY s.id ORDER BY total DESC`,
    rango ? [desde, hasta] : []
  ))[0];

  const ingresosPorOdontologo = (await pool.query(
    `SELECT o.nombre, SUM(pg.monto) AS total
     FROM pagos pg
     JOIN citas c ON c.id = pg.cita_id
     JOIN odontologos o ON o.id = c.odontologo_id
     ${rango ? 'WHERE DATE(pg.fecha) BETWEEN ? AND ?' : ''}
     GROUP BY o.id ORDER BY total DESC`,
    rango ? [desde, hasta] : []
  ))[0];

  res.json({ ok: true, data: { citasPorEstado, ingresosPorMes, ingresosPorServicio, ingresosPorOdontologo } });
});

/** GET /api/dashboard/seguimiento */
const seguimiento = asyncHandler(async (req, res) => {
  const [tratamientosIncompletos] = await pool.query(
    `SELECT pt.id, pt.nombre, CONCAT(p.nombres,' ',p.apellidos) AS paciente, pt.estado
     FROM planes_tratamiento pt JOIN pacientes p ON p.id = pt.paciente_id
     WHERE pt.estado IN ('ACEPTADO','EN_PROCESO') ORDER BY pt.created_at DESC`
  );

  const [saldosPendientes] = await pool.query(
    `SELECT pt.paciente_id, CONCAT(p.nombres,' ',p.apellidos) AS paciente,
            SUM(pt.total_final) - COALESCE((SELECT SUM(pg.monto) FROM pagos pg WHERE pg.paciente_id = pt.paciente_id),0) AS saldo
     FROM planes_tratamiento pt JOIN pacientes p ON p.id = pt.paciente_id
     WHERE pt.estado <> 'CANCELADO'
     GROUP BY pt.paciente_id HAVING saldo > 0 ORDER BY saldo DESC`
  );

  const [noAsistieron] = await pool.query(
    `SELECT c.id, c.fecha, CONCAT(COALESCE(p.nombres,c.nombre_contacto),' ',COALESCE(p.apellidos,'')) AS paciente
     FROM citas c LEFT JOIN pacientes p ON p.id = c.paciente_id
     WHERE c.estado = 'NO_ASISTIO' ORDER BY c.fecha DESC LIMIT 50`
  );

  const [presupuestosPendientes] = await pool.query(
    `SELECT pt.id, pt.nombre, CONCAT(p.nombres,' ',p.apellidos) AS paciente, pt.total_final
     FROM planes_tratamiento pt JOIN pacientes p ON p.id = pt.paciente_id
     WHERE pt.estado = 'PROPUESTO' ORDER BY pt.created_at DESC`
  );

  // Pacientes sin cita futura
  const [sinCitaProxima] = await pool.query(
    `SELECT p.id, CONCAT(p.nombres,' ',p.apellidos) AS paciente, p.telefono
     FROM pacientes p
     WHERE p.estado = 1 AND NOT EXISTS (
        SELECT 1 FROM citas c WHERE c.paciente_id = p.id AND c.fecha >= CURDATE()
            AND c.estado NOT IN ('CANCELADA','NO_ASISTIO')
     ) ORDER BY p.apellidos LIMIT 50`
  );

  res.json({
    ok: true,
    data: { tratamientosIncompletos, saldosPendientes, noAsistieron, presupuestosPendientes, sinCitaProxima },
  });
});

module.exports = { resumen, reportes, seguimiento };
