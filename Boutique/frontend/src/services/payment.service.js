import api from './api.js';

export const paymentService = {
  // Inicia el pago: devuelve los datos firmados para abrir el widget de Wompi
  initWompi: (order_id) => api.post('/payments/wompi/init', { order_id }).then((r) => r.data),
  // Verifica una transacción tras volver de Wompi y actualiza el pedido
  verifyWompi: (transactionId) => api.get(`/payments/wompi/verify/${transactionId}`).then((r) => r.data),
};

// Carga el script del widget de Wompi una sola vez
let widgetPromise = null;
function loadWompiWidget() {
  if (typeof window !== 'undefined' && window.WidgetCheckout) return Promise.resolve();
  if (widgetPromise) return widgetPromise;
  widgetPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { widgetPromise = null; reject(new Error('No se pudo cargar la pasarela de Wompi')); };
    document.body.appendChild(script);
  });
  return widgetPromise;
}

// Abre el widget/checkout de Wompi (modal seguro). Al terminar, Wompi
// redirige a redirectUrl con ?id=<transactionId>&env=...
export async function openWompiCheckout(init, redirectUrl) {
  await loadWompiWidget();
  const checkout = new window.WidgetCheckout({
    currency: init.currency,
    amountInCents: init.amountInCents,
    reference: init.reference,
    publicKey: init.publicKey,
    signature: { integrity: init.signature },
    redirectUrl,
    customerData: {
      email: init.email,
      fullName: init.fullName,
      phoneNumber: init.phone,
    },
  });
  // redirectUrl maneja la navegación al terminar; el callback es respaldo.
  checkout.open((result) => {
    const tx = result?.transaction;
    if (tx?.id) {
      window.location.href = `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}id=${tx.id}`;
    }
  });
}
