import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { asyncHandler, ApiError } from '../utils/helpers.js';
import { wompi, verifyEventSignature, fetchTransaction, createPaymentLink, paymentLinkUrl } from '../config/wompi.js';
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

// Encuentra el pedido al que pertenece una transacción de Wompi
async function findOrderForTx(tx, fallbackOrderId) {
  if (tx?.payment_link_id) {
    const [r] = await pool.query('SELECT id, user_id FROM orders WHERE wompi_link_id = ?', [tx.payment_link_id]);
    if (r.length) return r[0];
  }
  if (tx?.reference) {
    const [r] = await pool.query('SELECT id, user_id FROM orders WHERE numero = ?', [tx.reference]);
    if (r.length) return r[0];
  }
  if (fallbackOrderId) {
    const [r] = await pool.query('SELECT id, user_id FROM orders WHERE id = ?', [fallbackOrderId]);
    if (r.length) return r[0];
  }
  return null;
}

// POST /api/payments/wompi/init   { order_id }   (cliente autenticado)
// Crea un Payment Link en Wompi y devuelve la URL de pago.
export const initWompi = asyncHandler(async (req, res) => {
  if (!wompi.privateKey) throw new ApiError(500, 'Wompi no está configurado en el servidor');

  const { order_id } = req.body;
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, req.user.id]);
  if (!rows.length) throw new ApiError(404, 'Pedido no encontrado');
  const order = rows[0];
  if (order.estado_pago === 'PAGADO') throw new ApiError(400, 'Este pedido ya fue pagado');

  const amountInCents = Math.round(Number(order.total) * 100);
  const redirectUrl = `${env.frontendUrl}/pago/resultado?order=${order.id}`;

  const link = await createPaymentLink({
    name: `Pedido ${order.numero}`,
    description: `Compra en la tienda (${order.numero})`,
    amountInCents,
    redirectUrl,
  });

  // Guardamos el id del link para correlacionar el webhook con el pedido
  await pool.query('UPDATE orders SET wompi_link_id = ? WHERE id = ?', [link.id, order.id]);

  res.json({ checkoutUrl: paymentLinkUrl(link.id), linkId: link.id });
});

// GET /api/payments/wompi/verify/:transactionId   (cliente autenticado)
// Consulta la transacción en Wompi y actualiza el pedido. Inmediato tras el redirect.
export const verifyWompi = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const tx = await fetchTransaction(transactionId);
  if (!tx) throw new ApiError(404, 'Transacción no encontrada en Wompi');

  const order = await findOrderForTx(tx, req.query.order);
  if (!order) throw new ApiError(404, 'Pedido no encontrado para esta transacción');
  if (order.user_id !== req.user.id && !['ADMIN', 'EMPLOYEE'].includes(req.user.rol)) {
    throw new ApiError(403, 'No autorizado');
  }

  await applyTxStatus(order.id, tx);

  const [updated] = await pool.query(
    'SELECT id, numero, estado, estado_pago, total FROM orders WHERE id = ?', [order.id]);
  res.json({ wompi_status: tx.status, payment_method: tx.payment_method_type, order: updated[0] });
});

// POST /api/payments/wompi/webhook   (público; lo llama Wompi)
// Fuente de verdad del estado del pago. Verifica la firma del evento.
export const wompiWebhook = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!verifyEventSignature(body)) {
    return res.status(401).json({ message: 'Firma de evento inválida' });
  }
  const tx = body?.data?.transaction;
  if (tx) {
    const order = await findOrderForTx(tx);
    if (order) await applyTxStatus(order.id, tx);
  }
  res.json({ received: true });
});

// GET /api/payments/config   (público)
export const wompiConfig = asyncHandler(async (req, res) => {
  res.json({ configurado: !!wompi.privateKey, currency: wompi.currency });
});
