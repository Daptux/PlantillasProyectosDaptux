// Extrae el mensaje de error del backend de forma segura
export function getError(err) {
  return (
    err?.response?.data?.mensaje ||
    err?.response?.data?.error ||
    err?.message ||
    'Ocurrió un error inesperado'
  );
}

// Formatea un número como moneda (COP por defecto)
export function formatMoney(valor) {
  const n = Number(valor || 0);
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });
}

// Formatea una fecha ISO a YYYY-MM-DD legible
export function formatFecha(fecha) {
  if (!fecha) return '-';
  return String(fecha).slice(0, 10);
}

// Clase CSS de badge según el estado
export function badgeClass(estado) {
  return 'badge badge-' + String(estado || '').toLowerCase();
}
