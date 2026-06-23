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
    script.onerror = () => { widgetPromise = null; reject(new Error('No se pudo cargar la pasarela de Wompi. Revisa tu conexión o desactiva el bloqueador de anuncios.')); };
    document.body.appendChild(script);
  });
  return widgetPromise;
}

// Abre el widget (modal seguro) de Wompi. Cuando el usuario termina, el callback
// entrega la transacción y navegamos a /pago/resultado para verificar el estado.
export async function openWompiCheckout(init, orderId) {
  await loadWompiWidget();
  if (!window.WidgetCheckout) throw new Error('La pasarela de Wompi no está disponible');

  const checkout = new window.WidgetCheckout({
    currency: init.currency,
    amountInCents: init.amountInCents,
    reference: init.reference,
    publicKey: init.publicKey,
    signature: { integrity: init.signature },
    customerData: {
      email: init.email,
      fullName: init.fullName,
      phoneNumber: init.phone,
    },
  });

  checkout.open((result) => {
    const tx = result && result.transaction;
    const idParam = tx && tx.id ? `&id=${tx.id}` : '';
    // Navegación completa para que la página de resultado verifique con el backend
    window.location.assign(`/pago/resultado?order=${orderId}${idParam}`);
  });
}
