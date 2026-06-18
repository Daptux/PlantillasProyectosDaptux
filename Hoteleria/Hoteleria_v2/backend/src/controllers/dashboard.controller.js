const pool = require('../config/db');

const obtenerResumenDashboard = async (req, res) => {
  try {
    const [[usuarios]] = await pool.query(`
      SELECT COUNT(*) AS total_usuarios
      FROM usuarios
    `);

    const [[clientes]] = await pool.query(`
      SELECT COUNT(*) AS total_clientes
      FROM usuarios
      WHERE rol = 'CLIENTE'
    `);

    const [[empleados]] = await pool.query(`
      SELECT COUNT(*) AS total_empleados
      FROM usuarios
      WHERE rol = 'EMPLEADO'
    `);

    const [[habitaciones]] = await pool.query(`
      SELECT COUNT(*) AS total_habitaciones
      FROM habitaciones
    `);

    const [[habitacionesDisponibles]] = await pool.query(`
      SELECT COUNT(*) AS habitaciones_disponibles
      FROM habitaciones
      WHERE estado = 'DISPONIBLE'
    `);

    const [[habitacionesOcupadas]] = await pool.query(`
      SELECT COUNT(*) AS habitaciones_ocupadas
      FROM habitaciones
      WHERE estado = 'OCUPADA'
    `);

    const [[reservasPendientes]] = await pool.query(`
      SELECT COUNT(*) AS reservas_pendientes
      FROM reservas
      WHERE estado = 'PENDIENTE'
    `);

    const [[reservasConfirmadas]] = await pool.query(`
      SELECT COUNT(*) AS reservas_confirmadas
      FROM reservas
      WHERE estado = 'CONFIRMADA'
    `);

    const [[reservasEnCurso]] = await pool.query(`
      SELECT COUNT(*) AS reservas_en_curso
      FROM reservas
      WHERE estado = 'EN_CURSO'
    `);

    const [[ingresos]] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS ingresos_totales
      FROM reservas
      WHERE estado = 'FINALIZADA'
    `);

    const [reservasRecientes] = await pool.query(`
      SELECT 
        r.id_reserva,
        r.fecha_entrada,
        r.fecha_salida,
        r.total,
        r.estado,
        r.fecha_creacion,
        u.nombre,
        u.apellido,
        u.email,
        h.numero AS numero_habitacion,
        h.tipo AS tipo_habitacion
      FROM reservas r
      INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
      INNER JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
      ORDER BY r.fecha_creacion DESC
      LIMIT 5
    `);

    res.json({
      total_usuarios: usuarios.total_usuarios,
      total_clientes: clientes.total_clientes,
      total_empleados: empleados.total_empleados,
      total_habitaciones: habitaciones.total_habitaciones,
      habitaciones_disponibles: habitacionesDisponibles.habitaciones_disponibles,
      habitaciones_ocupadas: habitacionesOcupadas.habitaciones_ocupadas,
      reservas_pendientes: reservasPendientes.reservas_pendientes,
      reservas_confirmadas: reservasConfirmadas.reservas_confirmadas,
      reservas_en_curso: reservasEnCurso.reservas_en_curso,
      ingresos_totales: ingresos.ingresos_totales,
      reservas_recientes: reservasRecientes
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  obtenerResumenDashboard
};