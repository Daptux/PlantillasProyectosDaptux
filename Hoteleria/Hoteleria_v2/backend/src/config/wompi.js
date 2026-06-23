const crypto = require('crypto');

// ============================================================
//  Configuración e integración con Wompi (sandbox)
//  Las llaves se leen del .env (ver server.js -> dotenv).
// ============================================================

const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
const WOMPI_API_URL = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
const MONEDA = 'COP';

// Firma de integridad para abrir el widget:
//   SHA256( referencia + montoEnCentavos + moneda + secretoIntegridad )
const firmaIntegridad = (referencia, montoCentavos, moneda = MONEDA) => {
  const cadena = `${referencia}${montoCentavos}${moneda}${WOMPI_INTEGRITY_SECRET}`;
  return crypto.createHash('sha256').update(cadena).digest('hex');
};

// Verifica el checksum de un evento (webhook) recibido de Wompi.
// El checksum es SHA256 de la concatenación de los valores de las
// propiedades indicadas en signature.properties + el timestamp + el
// secreto de eventos.
const verificarFirmaEvento = (evento) => {
  try {
    const propiedades = evento?.signature?.properties || [];
    const checksumRecibido = evento?.signature?.checksum;
    const timestamp = evento?.timestamp;

    if (!propiedades.length || !checksumRecibido || timestamp === undefined) {
      return false;
    }

    // "transaction.id" -> evento.data.transaction.id
    const valores = propiedades.map((ruta) =>
      ruta.split('.').reduce(
        (acc, clave) => (acc == null ? acc : acc[clave]),
        evento.data
      )
    );

    const cadena = `${valores.join('')}${timestamp}${WOMPI_EVENTS_SECRET}`;
    const calculado = crypto.createHash('sha256').update(cadena).digest('hex');

    return calculado.toLowerCase() === String(checksumRecibido).toLowerCase();
  } catch (error) {
    console.error('Error verificando firma de evento Wompi:', error);
    return false;
  }
};

// Consulta una transacción en la API de Wompi por su id.
// Es la FUENTE DE VERDAD del estado del pago: nunca confiamos en el
// estado que llega por el front o por el body del webhook.
const obtenerTransaccionWompi = async (transaccionId) => {
  const resp = await fetch(`${WOMPI_API_URL}/transactions/${transaccionId}`, {
    headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` }
  });

  if (!resp.ok) {
    throw new Error(`Wompi respondió ${resp.status} al consultar la transacción ${transaccionId}`);
  }

  const json = await resp.json();
  return json.data;
};

module.exports = {
  WOMPI_PUBLIC_KEY,
  WOMPI_PRIVATE_KEY,
  WOMPI_INTEGRITY_SECRET,
  WOMPI_EVENTS_SECRET,
  WOMPI_API_URL,
  MONEDA,
  firmaIntegridad,
  verificarFirmaEvento,
  obtenerTransaccionWompi
};
