const pool = require('../config/db');

const METODOS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
const ESTADOS_PAGO = ['PENDIENTE', 'PAGADO', 'RECHAZADO'];

// Registrar un pago de una reserva.
// Si con este pago (sumando los anteriores PAGADO) se cubre el total de la
// reserva, la reserva pasa automáticamente a CONFIRMADA.
const registrarPago = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id_reserva, metodo_pago, monto, estado } = req.body;

    if (!id_reserva || !metodo_pago || monto === undefined) {
      return res.status(400).json({
        mensaje: 'id_reserva, metodo_pago y monto son obligatorios'
      });
    }

    if (!METODOS.includes(metodo_pago)) {
      return res.status(400).json({
        mensaje: 'Método de pago inválido. Use: ' + METODOS.join(', ')
      });
    }

    const estadoPago = estado || 'PAGADO';
    if (!ESTADOS_PAGO.includes(estadoPago)) {
      return res.status(400).json({
        mensaje: 'Estado de pago inválido. Use: ' + ESTADOS_PAGO.join(', ')
      });
    }

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({
        mensaje: 'El monto debe ser un número positivo'
      });
    }

    await connection.beginTransaction();

    const [reservas] = await connection.query(
      'SELECT id_reserva, total, estado FROM reservas WHERE id_reserva = ?',
      [id_reserva]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const reserva = reservas[0];

    if (reserva.estado === 'CANCELADA') {
      await connection.rollback();
      return res.status(400).json({
        mensaje: 'No se puede registrar un pago de una reserva cancelada'
      });
    }

    const [resultado] = await connection.query(
      `INSERT INTO pagos (id_reserva, metodo_pago, monto, estado)
       VALUES (?, ?, ?, ?)`,
      [id_reserva, metodo_pago, montoNum, estadoPago]
    );

    // Total efectivamente pagado de la reserva
    const [[suma]] = await connection.query(
      "SELECT COALESCE(SUM(monto), 0) AS pagado FROM pagos WHERE id_reserva = ? AND estado = 'PAGADO'",
      [id_reserva]
    );

    const totalPagado = Number(suma.pagado);
    const totalReserva = Number(reserva.total);
    let reservaConfirmada = false;

    if (totalPagado >= totalReserva && reserva.estado === 'PENDIENTE') {
      await connection.query(
        "UPDATE reservas SET estado = 'CONFIRMADA' WHERE id_reserva = ?",
        [id_reserva]
      );
      reservaConfirmada = true;
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Pago registrado correctamente',
      pago: {
        id_pago: resultado.insertId,
        id_reserva,
        metodo_pago,
        monto: montoNum,
        estado: estadoPago
      },
      total_reserva: totalReserva,
      total_pagado: totalPagado,
      saldo_pendiente: Math.max(totalReserva - totalPagado, 0),
      reserva_confirmada: reservaConfirmada
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const obtenerPagos = async (req, res) => {
  try {
    const [pagos] = await pool.query(
      `SELECT
        p.id_pago,
        p.id_reserva,
        p.metodo_pago,
        p.monto,
        p.estado,
        p.fecha_pago,
        r.total AS total_reserva,
        r.estado AS estado_reserva,
        u.nombre,
        u.apellido,
        h.numero AS numero_habitacion
       FROM pagos p
       INNER JOIN reservas r ON p.id_reserva = r.id_reserva
       INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
       INNER JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
       ORDER BY p.fecha_pago DESC`
    );

    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerPagosPorReserva = async (req, res) => {
  try {
    const { id_reserva } = req.params;

    const [reservas] = await pool.query(
      'SELECT id_reserva, total FROM reservas WHERE id_reserva = ?',
      [id_reserva]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const [pagos] = await pool.query(
      `SELECT id_pago, id_reserva, metodo_pago, monto, estado, fecha_pago
       FROM pagos
       WHERE id_reserva = ?
       ORDER BY fecha_pago DESC`,
      [id_reserva]
    );

    const [[suma]] = await pool.query(
      "SELECT COALESCE(SUM(monto), 0) AS pagado FROM pagos WHERE id_reserva = ? AND estado = 'PAGADO'",
      [id_reserva]
    );

    const totalReserva = Number(reservas[0].total);
    const totalPagado = Number(suma.pagado);

    res.json({
      id_reserva: Number(id_reserva),
      total_reserva: totalReserva,
      total_pagado: totalPagado,
      saldo_pendiente: Math.max(totalReserva - totalPagado, 0),
      pagos
    });
  } catch (error) {
    console.error('Error al obtener pagos de la reserva:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

module.exports = {
  registrarPago,
  obtenerPagos,
  obtenerPagosPorReserva
};
