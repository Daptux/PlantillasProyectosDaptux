import api from './api.js';

export const paymentService = {
  // Crea el link de pago en Wompi y devuelve { checkoutUrl }
  initWompi: (order_id) => api.post('/payments/wompi/init', { order_id }).then((r) => r.data),
  // Verifica una transacción tras volver de Wompi y actualiza el pedido
  verifyWompi: (transactionId, orderId) =>
    api.get(`/payments/wompi/verify/${transactionId}`, { params: orderId ? { order: orderId } : {} }).then((r) => r.data),
};

// Pide el link de pago al backend y redirige el navegador a la pasarela de Wompi.
export async function goToWompiCheckout(orderId) {
  const { checkoutUrl } = await paymentService.initWompi(orderId);
  if (!checkoutUrl) throw new Error('No se recibió el enlace de pago');
  window.location.href = checkoutUrl;
}
