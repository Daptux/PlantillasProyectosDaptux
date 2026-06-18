const pool = require('../config/db');

const crearReserva = async (req, res) => {
  const {
    id_habitacion,
    fecha_entrada,
    fecha_salida,
    id_usuario: idUsuarioBody
  } = req.body;

  // ---- Validaciones que NO necesitan transacción ----
  if (!id_habitacion || !fecha_entrada || !fecha_salida) {
    return res.status(400).json({
      mensaje: 'Habitación, fecha de entrada y fecha de salida son obligatorias'
    });
  }

  const entrada = new Date(fecha_entrada);
  const salida = new Date(fecha_salida);

  if (isNaN(entrada.getTime()) || isNaN(salida.getTime())) {
    return res.status(400).json({ mensaje: 'Fechas inválidas' });
  }
  if (salida <= entrada) {
    return res.status(400).json({
      mensaje: 'La fecha de salida debe ser mayor a la fecha de entrada'
    });
  }

  // Por defecto la reserva es del usuario autenticado.
  // ADMIN y EMPLEADO pueden crearla para otro cliente enviando id_usuario.
  let id_usuario = req.user.id_usuario;

  if (idUsuarioBody && ['ADMIN', 'EMPLEADO'].includes(req.user.rol)) {
    const [clienteDestino] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'CLIENTE' AND estado = 'ACTIVO'",
      [idUsuarioBody]
    );
    if (clienteDestino.length === 0) {
      return res.status(404).json({
        mensaje: 'El cliente indicado no existe o no está activo'
      });
    }
    id_usuario = idUsuarioBody;
  }

  // ---- Sección crítica: transacción + bloqueo de la habitación ----
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // FOR UPDATE bloquea la fila de la habitación hasta el commit/rollback,
    // así dos reservas simultáneas de la misma habitación se serializan.
    const [habitaciones] = await connection.query(
      'SELECT * FROM habitaciones WHERE id_habitacion = ? FOR UPDATE',
      [id_habitacion]
    );

    if (habitaciones.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Habitación no encontrada' });
    }

    const habitacion = habitaciones[0];

    if (habitacion.estado === 'INACTIVA') {
      await connection.rollback();
      return res.status(400).json({ mensaje: 'La habitación no está activa' });
    }

    // Solapamiento real (incluye EN_CURSO; las CANCELADA/FINALIZADA no cuentan)
    const [reservasExistentes] = await connection.query(
      `SELECT id_reserva
       FROM reservas
       WHERE id_habitacion = ?
       AND estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO')
       AND fecha_entrada < ?
       AND fecha_salida > ?`,
      [id_habitacion, fecha_salida, fecha_entrada]
    );

    if (reservasExistentes.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        mensaje: 'La habitación ya tiene una reserva en esas fechas'
      });
    }

    const noches = Math.round((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
    const total = noches * Number(habitacion.precio_noche);

    const [resultado] = await connection.query(
      `INSERT INTO reservas
      (id_usuario, id_habitacion, fecha_entrada, fecha_salida, total, estado)
      VALUES (?, ?, ?, ?, ?, 'PENDIENTE')`,
      [id_usuario, id_habitacion, fecha_entrada, fecha_salida, total]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Reserva creada correctamente',
      reserva: {
        id_reserva: resultado.insertId,
        id_usuario,
        id_habitacion,
        fecha_entrada,
        fecha_salida,
        noches,
        total,
        estado: 'PENDIENTE'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const obtenerMisReservas = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;

    const [reservas] = await pool.query(
      `SELECT 
        r.id_reserva,
        r.fecha_entrada,
        r.fecha_salida,
        r.total,
        r.estado,
        r.fecha_creacion,
        h.id_habitacion,
        h.numero,
        h.tipo,
        h.precio_noche,
        h.capacidad
      FROM reservas r
      INNER JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
      WHERE r.id_usuario = ?
      ORDER BY r.fecha_creacion DESC`,
      [id_usuario]
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerReservas = async (req, res) => {
  try {
    const [reservas] = await pool.query(
      `SELECT 
        r.id_reserva,
        r.fecha_entrada,
        r.fecha_salida,
        r.total,
        r.estado,
        r.fecha_creacion,
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        h.id_habitacion,
        h.numero,
        h.tipo,
        h.precio_noche
      FROM reservas r
      INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
      INNER JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
      ORDER BY r.fecha_creacion DESC`
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [reservas] = await pool.query(
      `SELECT 
        r.id_reserva,
        r.id_usuario,
        r.id_habitacion,
        r.fecha_entrada,
        r.fecha_salida,
        r.total,
        r.estado,
        u.nombre,
        u.apellido,
        u.email,
        h.numero,
        h.tipo,
        h.precio_noche
      FROM reservas r
      INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
      INNER JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
      WHERE r.id_reserva = ?`,
      [id]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const reserva = reservas[0];

    if (
      req.user.rol === 'CLIENTE' &&
      reserva.id_usuario !== req.user.id_usuario
    ) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para ver esta reserva'
      });
    }

    res.json(reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const actualizarEstadoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'CANCELADA', 'FINALIZADA'];

    if (!estado || !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: 'Estado inválido'
      });
    }

    const [reservas] = await pool.query(
      'SELECT * FROM reservas WHERE id_reserva = ?',
      [id]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    await pool.query(
      'UPDATE reservas SET estado = ? WHERE id_reserva = ?',
      [estado, id]
    );

    res.json({
      mensaje: 'Estado de reserva actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const cancelarMiReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const [reservas] = await pool.query(
      'SELECT * FROM reservas WHERE id_reserva = ?',
      [id]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const reserva = reservas[0];

    if (reserva.id_usuario !== req.user.id_usuario) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para cancelar esta reserva'
      });
    }

    if (reserva.estado === 'CANCELADA') {
      return res.status(400).json({
        mensaje: 'La reserva ya está cancelada'
      });
    }

    if (reserva.estado === 'EN_CURSO') {
      return res.status(400).json({
        mensaje: 'No puedes cancelar una reserva que ya está en curso (check-in realizado). Contacta al hotel.'
      });
    }

    if (reserva.estado === 'FINALIZADA') {
      return res.status(400).json({
        mensaje: 'No puedes cancelar una reserva finalizada'
      });
    }

    await pool.query(
      'UPDATE reservas SET estado = "CANCELADA" WHERE id_reserva = ?',
      [id]
    );

    res.json({
      mensaje: 'Reserva cancelada correctamente'
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const hacerCheckIn = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [reservas] = await connection.query(
      `SELECT 
        r.id_reserva,
        r.id_habitacion,
        r.estado,
        h.estado AS estado_habitacion
      FROM reservas r
      INNER JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
      WHERE r.id_reserva = ?`,
      [id]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const reserva = reservas[0];

    if (reserva.estado !== 'CONFIRMADA') {
      await connection.rollback();
      return res.status(400).json({
        mensaje: 'Solo se puede hacer check-in a reservas CONFIRMADAS'
      });
    }

    if (reserva.estado_habitacion !== 'DISPONIBLE') {
      await connection.rollback();
      return res.status(400).json({
        mensaje: 'La habitación no está disponible para check-in'
      });
    }

    await connection.query(
      `UPDATE reservas 
       SET estado = 'EN_CURSO'
       WHERE id_reserva = ?`,
      [id]
    );

    await connection.query(
      `UPDATE habitaciones 
       SET estado = 'OCUPADA'
       WHERE id_habitacion = ?`,
      [reserva.id_habitacion]
    );

    await connection.commit();

    res.json({
      mensaje: 'Check-in realizado correctamente'
    });
  } catch (error) {
    await connection.rollback();

    console.error('Error al hacer check-in:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const hacerCheckOut = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [reservas] = await connection.query(
      `SELECT 
        r.id_reserva,
        r.id_habitacion,
        r.estado
      FROM reservas r
      WHERE r.id_reserva = ?`,
      [id]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const reserva = reservas[0];

    if (reserva.estado !== 'EN_CURSO') {
      await connection.rollback();
      return res.status(400).json({
        mensaje: 'Solo se puede hacer check-out a reservas EN_CURSO'
      });
    }

    await connection.query(
      `UPDATE reservas 
       SET estado = 'FINALIZADA'
       WHERE id_reserva = ?`,
      [id]
    );

    await connection.query(
      `UPDATE habitaciones 
       SET estado = 'DISPONIBLE'
       WHERE id_habitacion = ?`,
      [reserva.id_habitacion]
    );

    await connection.commit();

    res.json({
      mensaje: 'Check-out realizado correctamente'
    });
  } catch (error) {
    await connection.rollback();

    console.error('Error al hacer check-out:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  crearReserva,
  obtenerMisReservas,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarEstadoReserva,
  cancelarMiReserva,
  hacerCheckIn,
  hacerCheckOut
};