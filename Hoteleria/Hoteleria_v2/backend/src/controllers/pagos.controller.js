const pool = require('../config/db');
const {
  MONEDA,
  WOMPI_PUBLIC_KEY,
  firmaIntegridad,
  verificarFirmaEvento,
  obtenerTransaccionWompi
} = require('../config/wompi');

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

// ============================================================
//  PASARELA DE PAGOS WOMPI
//  Flujo: el cliente NO crea una reserva al reservar. Crea un
//  "intento de pago", paga en el widget de Wompi y, sólo cuando
//  el pago queda APROBADO (verificado contra la API de Wompi),
//  se crea la reserva CONFIRMADA + el pago.
// ============================================================

// Genera una referencia única para Wompi (sólo letras, números y guiones).
const generarReferencia = (idUsuario, idHabitacion) => {
  const aleatorio = Math.random().toString(36).slice(2, 10);
  return `HOTEL-${idUsuario}-${idHabitacion}-${Date.now()}-${aleatorio}`;
};

// 1) Crea el intento de pago y devuelve los datos firmados para el widget.
//    Sólo los CLIENTE pagan por aquí (el personal reserva desde el panel).
const crearCheckout = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id_habitacion, fecha_entrada, fecha_salida } = req.body;

    if (!id_habitacion || !fecha_entrada || !fecha_salida) {
      return res.status(400).json({
        mensaje: 'Habitación, fecha de entrada y fecha de salida son obligatorias'
      });
    }

    if (req.user.rol !== 'CLIENTE') {
      return res.status(403).json({
        mensaje: 'El pago en línea es sólo para clientes. El personal reserva desde el panel.'
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

    const id_usuario = req.user.id_usuario;

    await connection.beginTransaction();

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

    // Chequeo temprano de disponibilidad (se vuelve a validar al aprobar el pago).
    const [solapadas] = await connection.query(
      `SELECT id_reserva FROM reservas
       WHERE id_habitacion = ?
       AND estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO')
       AND fecha_entrada < ? AND fecha_salida > ?`,
      [id_habitacion, fecha_salida, fecha_entrada]
    );
    if (solapadas.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        mensaje: 'La habitación ya tiene una reserva en esas fechas'
      });
    }

    const noches = Math.round((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
    const total = noches * Number(habitacion.precio_noche);
    const montoCentavos = Math.round(total * 100);
    const referencia = generarReferencia(id_usuario, id_habitacion);

    await connection.query(
      `INSERT INTO pagos_intentos
        (referencia, id_usuario, id_habitacion, fecha_entrada, fecha_salida, monto, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
      [referencia, id_usuario, id_habitacion, fecha_entrada, fecha_salida, total]
    );

    await connection.commit();

    res.status(201).json({
      referencia,
      montoCentavos,
      moneda: MONEDA,
      llavePublica: WOMPI_PUBLIC_KEY,
      firmaIntegridad: firmaIntegridad(referencia, montoCentavos),
      resumen: {
        numero: habitacion.numero,
        tipo: habitacion.tipo,
        fecha_entrada,
        fecha_salida,
        noches,
        total
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear checkout Wompi:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  } finally {
    connection.release();
  }
};

// Procesa una transacción YA consultada en la API de Wompi (fuente de verdad).
// Idempotente: si el intento ya fue aprobado devuelve la reserva existente.
// Si la transacción está aprobada, re-valida disponibilidad y crea la
// reserva CONFIRMADA + el pago. Devuelve un objeto con el estado resultante.
const procesarTransaccion = async (transaccion, idUsuarioSolicitante = null) => {
  const referencia = transaccion?.reference;
  if (!referencia) {
    return { estado: 'SIN_REFERENCIA', mensaje: 'La transacción no tiene referencia' };
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [intentos] = await connection.query(
      'SELECT * FROM pagos_intentos WHERE referencia = ? FOR UPDATE',
      [referencia]
    );
    if (intentos.length === 0) {
      await connection.rollback();
      return { estado: 'SIN_INTENTO', mensaje: 'No existe un intento de pago para esa referencia' };
    }

    const intento = intentos[0];

    // Si lo solicita un cliente, debe ser el dueño del intento.
    if (idUsuarioSolicitante && intento.id_usuario !== idUsuarioSolicitante) {
      await connection.rollback();
      return { estado: 'NO_AUTORIZADO', mensaje: 'Este pago no te pertenece' };
    }

    // Idempotencia: ya se procesó y creó la reserva.
    if (intento.estado === 'APROBADO' && intento.id_reserva) {
      await connection.commit();
      return { estado: 'APROBADO', referencia, id_reserva: intento.id_reserva, ya_procesado: true };
    }

    // Estado no aprobado -> registrar y salir.
    if (transaccion.status !== 'APPROVED') {
      const nuevoEstado = transaccion.status === 'PENDING' ? 'PENDIENTE' : 'RECHAZADO';
      await connection.query(
        'UPDATE pagos_intentos SET estado = ?, wompi_transaction_id = ? WHERE id_intento = ?',
        [nuevoEstado, transaccion.id, intento.id_intento]
      );
      await connection.commit();
      return { estado: nuevoEstado, referencia, estado_wompi: transaccion.status };
    }

    // Verificar que el monto y la moneda coincidan con lo esperado.
    const montoEsperado = Math.round(Number(intento.monto) * 100);
    if (Number(transaccion.amount_in_cents) !== montoEsperado || transaccion.currency !== MONEDA) {
      await connection.query(
        'UPDATE pagos_intentos SET estado = "CONFLICTO", wompi_transaction_id = ? WHERE id_intento = ?',
        [transaccion.id, intento.id_intento]
      );
      await connection.commit();
      return {
        estado: 'CONFLICTO',
        referencia,
        mensaje: 'El monto o la moneda del pago no coinciden con la reserva (requiere reembolso)'
      };
    }

    // Re-validar disponibilidad con bloqueo (puede haber cambiado durante el pago).
    const [habitaciones] = await connection.query(
      'SELECT * FROM habitaciones WHERE id_habitacion = ? FOR UPDATE',
      [intento.id_habitacion]
    );
    if (habitaciones.length === 0 || habitaciones[0].estado === 'INACTIVA') {
      await connection.query(
        'UPDATE pagos_intentos SET estado = "CONFLICTO", wompi_transaction_id = ? WHERE id_intento = ?',
        [transaccion.id, intento.id_intento]
      );
      await connection.commit();
      return {
        estado: 'CONFLICTO',
        referencia,
        mensaje: 'La habitación ya no está disponible (requiere reembolso)'
      };
    }

    const [solapadas] = await connection.query(
      `SELECT id_reserva FROM reservas
       WHERE id_habitacion = ?
       AND estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO')
       AND fecha_entrada < ? AND fecha_salida > ?`,
      [intento.id_habitacion, intento.fecha_salida, intento.fecha_entrada]
    );
    if (solapadas.length > 0) {
      await connection.query(
        'UPDATE pagos_intentos SET estado = "CONFLICTO", wompi_transaction_id = ? WHERE id_intento = ?',
        [transaccion.id, intento.id_intento]
      );
      await connection.commit();
      return {
        estado: 'CONFLICTO',
        referencia,
        mensaje: 'Otra reserva tomó esas fechas mientras pagabas (requiere reembolso)'
      };
    }

    // Crear la reserva CONFIRMADA y registrar el pago.
    const [resReserva] = await connection.query(
      `INSERT INTO reservas
        (id_usuario, id_habitacion, fecha_entrada, fecha_salida, total, estado)
       VALUES (?, ?, ?, ?, ?, 'CONFIRMADA')`,
      [intento.id_usuario, intento.id_habitacion, intento.fecha_entrada, intento.fecha_salida, intento.monto]
    );
    const id_reserva = resReserva.insertId;

    await connection.query(
      `INSERT INTO pagos
        (id_reserva, metodo_pago, monto, referencia, wompi_transaction_id, estado)
       VALUES (?, 'WOMPI', ?, ?, ?, 'PAGADO')`,
      [id_reserva, intento.monto, referencia, transaccion.id]
    );

    await connection.query(
      'UPDATE pagos_intentos SET estado = "APROBADO", id_reserva = ?, wompi_transaction_id = ? WHERE id_intento = ?',
      [id_reserva, transaccion.id, intento.id_intento]
    );

    await connection.commit();
    return { estado: 'APROBADO', referencia, id_reserva };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 2) El cliente confirma el pago tras cerrar el widget.
//    Recibe el id de transacción, lo verifica contra Wompi y procesa.
const confirmarPago = async (req, res) => {
  try {
    const { transaccion_id } = req.body;
    if (!transaccion_id) {
      return res.status(400).json({ mensaje: 'transaccion_id es obligatorio' });
    }

    const transaccion = await obtenerTransaccionWompi(transaccion_id);
    const resultado = await procesarTransaccion(transaccion, req.user.id_usuario);

    res.json(resultado);
  } catch (error) {
    console.error('Error al confirmar pago Wompi:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

// 3) Webhook de eventos de Wompi (público, sin auth). Valida la firma,
//    vuelve a consultar la transacción en la API y la procesa.
const webhookWompi = async (req, res) => {
  try {
    const evento = req.body;

    if (!verificarFirmaEvento(evento)) {
      return res.status(401).json({ mensaje: 'Firma de evento inválida' });
    }

    const transaccionEvento = evento?.data?.transaction;
    if (transaccionEvento?.id) {
      // Procesamos en segundo plano; a Wompi le respondemos 200 enseguida.
      obtenerTransaccionWompi(transaccionEvento.id)
        .then((tx) => procesarTransaccion(tx, null))
        .catch((err) => console.error('Error procesando webhook Wompi:', err));
    }

    res.status(200).json({ recibido: true });
  } catch (error) {
    console.error('Error en webhook Wompi:', error);
    // Respondemos 200 para que Wompi no reintente indefinidamente.
    res.status(200).json({ recibido: true });
  }
};

// 4) Estado de un intento de pago (para la pantalla de retorno del cliente).
const obtenerEstadoIntento = async (req, res) => {
  try {
    const { referencia } = req.params;

    const [intentos] = await pool.query(
      'SELECT referencia, estado, id_reserva, id_usuario FROM pagos_intentos WHERE referencia = ?',
      [referencia]
    );
    if (intentos.length === 0) {
      return res.status(404).json({ mensaje: 'Intento de pago no encontrado' });
    }

    const intento = intentos[0];
    if (req.user.rol === 'CLIENTE' && intento.id_usuario !== req.user.id_usuario) {
      return res.status(403).json({ mensaje: 'No tienes permisos para ver este pago' });
    }

    res.json({
      referencia: intento.referencia,
      estado: intento.estado,
      id_reserva: intento.id_reserva
    });
  } catch (error) {
    console.error('Error al obtener estado de intento:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  registrarPago,
  obtenerPagos,
  obtenerPagosPorReserva,
  crearCheckout,
  confirmarPago,
  webhookWompi,
  obtenerEstadoIntento
};
