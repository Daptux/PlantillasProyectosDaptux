// backend/src/controllers/dashboard.controller.js
// Resumen de métricas para el dashboard del panel administrativo.

const { pool } = require('../config/db');

// GET /api/dashboard/resumen
async function resumen(req, res, next) {
  try {
    // Ejecuta las consultas en paralelo para mayor rapidez
    const [
      [citasHoy],
      [pendientesConfirmar],
      [pacientesNuevosMes],
      [ingresosHoy],
      [ingresosMes],
      [tratamientosActivos],
      [pacientesConSaldo],
      [insumosBajos],
      [proximosControles],
      [canceladasNoAsistio],
      serviciosTop,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS n FROM citas WHERE fecha = CURRENT_DATE AND estado NOT IN ('CANCELADA')"),
      pool.query("SELECT COUNT(*) AS n FROM citas WHERE estado = 'SOLICITADA'"),
      pool.query("SELECT COUNT(*) AS n FROM pacientes WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)"),
      pool.query('SELECT COALESCE(SUM(monto),0) AS total FROM pagos WHERE fecha::date = CURRENT_DATE'),
      pool.query("SELECT COALESCE(SUM(monto),0) AS total FROM pagos WHERE date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE)"),
      pool.query("SELECT COUNT(*) AS n FROM planes_tratamiento WHERE estado IN ('ACEPTADO','EN_PROCESO')"),
      pool.query(`SELECT COUNT(*) AS n FROM (
                    SELECT pt.paciente_id,
                           COALESCE(SUM(pt.total_final),0) - COALESCE((SELECT SUM(pg.monto) FROM pagos pg WHERE pg.paciente_id = pt.paciente_id),0) AS saldo
                      FROM planes_tratamiento pt
                     WHERE pt.estado IN ('ACEPTADO','EN_PROCESO','FINALIZADO')
                     GROUP BY pt.paciente_id
                  ) t WHERE t.saldo > 0`),
      pool.query('SELECT COUNT(*) AS n FROM inventario WHERE estado = 1 AND stock_actual <= stock_minimo'),
      pool.query("SELECT COUNT(*) AS n FROM citas WHERE fecha BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 day') AND estado = 'CONFIRMADA'"),
      pool.query("SELECT COUNT(*) AS n FROM citas WHERE estado IN ('CANCELADA','NO_ASISTIO') AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)"),
      pool.query(`SELECT s.nombre, COUNT(c.id) AS total
                    FROM citas c JOIN servicios s ON s.id = c.servicio_id
                   GROUP BY s.id, s.nombre ORDER BY total DESC LIMIT 5`),
    ]);

    res.json({
      ok: true,
      datos: {
        citas_hoy: citasHoy[0].n,
        citas_pendientes_confirmar: pendientesConfirmar[0].n,
        pacientes_nuevos_mes: pacientesNuevosMes[0].n,
        ingresos_hoy: Number(ingresosHoy[0].total),
        ingresos_mes: Number(ingresosMes[0].total),
        tratamientos_activos: tratamientosActivos[0].n,
        pacientes_con_saldo: pacientesConSaldo[0].n,
        insumos_bajos: insumosBajos[0].n,
        proximos_controles: proximosControles[0].n,
        citas_canceladas_no_asistio: canceladasNoAsistio[0].n,
        servicios_mas_solicitados: serviciosTop[0],
      },
    });
  } catch (err) { next(err); }
}

module.exports = { resumen };
