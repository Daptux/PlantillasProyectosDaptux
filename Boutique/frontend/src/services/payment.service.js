import api from './api.js';

export const paymentService = {
  // Inicia el pago: devuelve los datos firmados para abrir el checkout de Wompi
  initWompi: (order_id) => api.post('/payments/wompi/init', { order_id }).then((r) => r.data),
  // Verifica una transacción tras volver de Wompi y actualiza el pedido
  verifyWompi: (transactionId) => api.get(`/payments/wompi/verify/${transactionId}`).then((r) => r.data),
};

// Construye la URL del Web Checkout de Wompi.
// Nota: las llaves con ":" (signature:integrity, customer-data:*) se dejan literales;
// solo se codifican los valores.
export function buildWompiCheckoutUrl(init, redirectUrl) {
  const params = [
    ['public-key', init.publicKey],
    ['currency', init.currency],
    ['amount-in-cents', init.amountInCents],
    ['reference', init.reference],
    ['signature:integrity', init.signature],
    ['redirect-url', redirectUrl],
    ['customer-data:email', init.email],
    ['customer-data:full-name', init.fullName],
    ['customer-data:phone-number', init.phone],
  ].filter(([, v]) => v != null && v !== '');

  const qs = params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `${init.checkoutUrl}?${qs}`;
}
