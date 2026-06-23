import crypto from 'crypto';

// Configuración de la pasarela Wompi (sandbox por defecto).
// Las llaves se leen de variables de entorno. NUNCA expongas la privada ni los secretos al frontend.
export const wompi = {
  publicKey: process.env.WOMPI_PUBLIC_KEY || '',
  privateKey: process.env.WOMPI_PRIVATE_KEY || '',
  eventsSecret: process.env.WOMPI_EVENTS_SECRET || '',
  integritySecret: process.env.WOMPI_INTEGRITY_SECRET || '',
  apiUrl: process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1',
  checkoutUrl: process.env.WOMPI_CHECKOUT_URL || 'https://checkout.wompi.co/p/',
  currency: 'COP',
};

// Firma de integridad para abrir el checkout:
//   SHA256( reference + amountInCents + currency + integritySecret )
export function integritySignature(reference, amountInCents, currency = 'COP') {
  const cadena = `${reference}${amountInCents}${currency}${wompi.integritySecret}`;
  return crypto.createHash('sha256').update(cadena).digest('hex');
}

// Verifica la firma de un evento (webhook) de Wompi:
//   SHA256( valores de signature.properties (en orden) + timestamp + eventsSecret )
export function verifyEventSignature(body) {
  const sig = body?.signature;
  if (!sig?.properties || !sig?.checksum) return false;

  let cadena = '';
  for (const prop of sig.properties) {
    // prop ej: "transaction.id" -> navega dentro de body.data
    const value = prop.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), body.data);
    cadena += value;
  }
  cadena += body.timestamp;
  cadena += wompi.eventsSecret;

  const checksum = crypto.createHash('sha256').update(cadena).digest('hex');
  return checksum.toUpperCase() === String(sig.checksum).toUpperCase();
}

// Consulta una transacción en la API de Wompi
export async function fetchTransaction(transactionId) {
  const resp = await fetch(`${wompi.apiUrl}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${wompi.privateKey}` },
  });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json?.data || null;
}
