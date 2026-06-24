import api from './api.js';

export const paymentService = {
  // Inicia el pago: devuelve los datos firmados para abrir el widget de Wompi
  initWompi: (order_id) => api.post('/payments/wompi/init', { order_id }).then((r) => r.data),
  // Verifica una transacción tras pagar y actualiza el pedido
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
    script.onerror = () => {
      widgetPromise = null;
      reject(new Error('No se pudo cargar Wompi. Desactiva el bloqueador de anuncios o revisa tu conexión.'));
    };
    document.body.appendChild(script);
  });
  return widgetPromise;
}

// Abre el widget (modal) de Wompi. Al terminar, navega a /pago/resultado para verificar.
// onResult(transaction|null) opcional para manejar el cierre sin pagar.
export async function openWompiCheckout(init, orderId) {
  await loadWompiWidget();
  if (!window.WidgetCheckout) throw new Error('La pasarela de Wompi no está disponible en este momento.');

  const customerData = {};
  if (init.email) customerData.email = init.email;
  if (init.fullName) customerData.fullName = init.fullName;
  if (init.phone) customerData.phoneNumber = String(init.phone);

  const checkout = new window.WidgetCheckout({
    currency: init.currency,
    amountInCents: init.amountInCents,
    reference: init.reference,
    publicKey: init.publicKey,
    signature: { integrity: init.signature },
    ...(Object.keys(customerData).length ? { customerData } : {}),
  });

  checkout.open((result) => {
    const tx = result && result.transaction;
    if (tx && tx.id) {
      // Pagó (o intentó): vamos a verificar el estado real con el backend
      window.location.assign(`/pago/resultado?order=${orderId}&id=${tx.id}`);
    } else {
      // Cerró sin completar: al detalle del pedido para reintentar (evita bucle)
      window.location.assign(`/mis-pedidos/${orderId}`);
    }
  });
}
