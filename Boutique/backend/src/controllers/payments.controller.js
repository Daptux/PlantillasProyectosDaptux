import { pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/helpers.js';
import { wompi, integritySignature, verifyEventSignature, fetchTransaction } from '../config/wompi.js';
import { markOrderPaid, markOrderPaymentFailed } from './orders.controller.js';

// Aplica el estado de una transacción de Wompi al pedido correspondiente
async function applyTxStatus(orderId, tx) {
  const status = tx.status; // APPROVED | DECLINED | VOIDED | ERROR | PENDING
  const methodLabel = `WOMPI:${tx.payment_method_type || 'ONLINE'}`;
  if (status === 'APPROVED') {
    await markOrderPaid(orderId, { transactionId: tx.id, methodLabel });
  } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(status)) {
    await markOrderPaymentFailed(orderId, { transactionId: tx.id, methodLabel });
  }
  // PENDING -> no se cambia nada todavía
}

// POST /api/payments/wompi/init   { order_id }   (cliente autenticado)
// Devuelve los datos firmados para abrir el checkout de Wompi.
export const initWompi = asyncHandler(async (req, res) => {
  if (!wompi.publicKey || !wompi.integritySecret) {
    throw new ApiError(500, 'Wompi no está configurado en el servidor');
  }
  const { order_id } = req.body;
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, req.user.id]);
  if (!rows.length) throw new ApiError(404, 'Pedido no encontrado');
  const order = rows[0];
  if (order.estado_pago === 'PAGADO') throw new ApiError(400, 'Este pedido ya fue pagado');

  const amountInCents = Math.round(Number(order.total) * 100);
  const reference = order.numero; // referencia única
  const signature = integritySignature(reference, amountInCents, wompi.currency);

  res.json({
    publicKey: wompi.publicKey,
    checkoutUrl: wompi.checkoutUrl,
    currency: wompi.currency,
    amountInCents,
    reference,
    signature,
    email: order.email_cliente,
    fullName: order.nombre_cliente,
    phone: order.telefono,
    orderId: order.id,
  });
});

// GET /api/payments/wompi/verify/:transactionId   (cliente autenticado)
// Consulta la transacción en Wompi y actualiza el pedido. Fuente inmediata tras el redirect.
export const verifyWompi = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const tx = await fetchTransaction(transactionId);
  if (!tx) throw new ApiError(404, 'Transacción no encontrada en Wompi');

  const [orders] = await pool.query('SELECT id, user_id FROM orders WHERE numero = ?', [tx.reference]);
  if (!orders.length) throw new ApiError(404, 'Pedido no encontrado para esa referencia');
  const order = orders[0];

  // El cliente solo puede verificar su propio pedido (staff puede cualquiera)
  if (order.user_id !== req.user.id && !['ADMIN', 'EMPLOYEE'].includes(req.user.rol)) {
    throw new ApiError(403, 'No autorizado');
  }

  await applyTxStatus(order.id, tx);

  const [updated] = await pool.query(
    'SELECT id, numero, estado, estado_pago, total FROM orders WHERE id = ?', [order.id]);
  res.json({
    wompi_status: tx.status,
    payment_method: tx.payment_method_type,
    order: updated[0],
  });
});

// POST /api/payments/wompi/webhook   (público; lo llama Wompi)
// Fuente de verdad del estado del pago. Verifica la firma del evento.
export const wompiWebhook = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!verifyEventSignature(body)) {
    return res.status(401).json({ message: 'Firma de evento inválida' });
  }
  const tx = body?.data?.transaction;
  if (tx?.reference) {
    const [orders] = await pool.query('SELECT id FROM orders WHERE numero = ?', [tx.reference]);
    if (orders.length) await applyTxStatus(orders[0].id, tx);
  }
  // Responder 200 siempre que la firma sea válida (evita reintentos infinitos de Wompi)
  res.json({ received: true });
});

// GET /api/payments/config   (público) -> llave pública para el frontend
export const wompiConfig = asyncHandler(async (req, res) => {
  res.json({ publicKey: wompi.publicKey, checkoutUrl: wompi.checkoutUrl, currency: wompi.currency });
});
