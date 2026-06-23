// Carga perezosa del widget de Wompi y apertura del checkout embebido.

let promesaCarga = null;

// Inyecta el script del widget de Wompi una sola vez.
export function cargarWidgetWompi() {
  if (typeof window !== 'undefined' && window.WidgetCheckout) {
    return Promise.resolve();
  }
  if (promesaCarga) return promesaCarga;

  promesaCarga = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      promesaCarga = null;
      reject(new Error('No se pudo cargar el widget de pagos de Wompi.'));
    };
    document.head.appendChild(script);
  });

  return promesaCarga;
}

// Abre el widget embebido y resuelve con la transacción al cerrarse.
// Devuelve null si el usuario cierra sin completar el pago.
export function abrirWidgetWompi({ publicKey, currency, amountInCents, reference, signatureIntegrity }) {
  return new Promise((resolve, reject) => {
    try {
      const checkout = new window.WidgetCheckout({
        currency,
        amountInCents,
        reference,
        publicKey,
        signature: { integrity: signatureIntegrity }
      });
      checkout.open((result) => {
        resolve(result?.transaction || null);
      });
    } catch (error) {
      reject(error);
    }
  });
}
