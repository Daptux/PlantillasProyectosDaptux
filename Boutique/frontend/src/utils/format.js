// Formatea un número como moneda colombiana (sin decimales)
export function formatPrice(value, currency = 'COP') {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// Etiquetas y colores de estados de pedido
export const ORDER_STATUS = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-amber-100 text-amber-700' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  PREPARANDO: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-700' },
  ENVIADO:    { label: 'Enviado',    color: 'bg-purple-100 text-purple-700' },
  ENTREGADO:  { label: 'Entregado',  color: 'bg-emerald-100 text-emerald-700' },
  CANCELADO:  { label: 'Cancelado',  color: 'bg-red-100 text-red-700' },
};

export const PAYMENT_STATUS = {
  PENDIENTE:   { label: 'Pendiente',   color: 'bg-amber-100 text-amber-700' },
  PAGADO:      { label: 'Pagado',      color: 'bg-emerald-100 text-emerald-700' },
  RECHAZADO:   { label: 'Rechazado',   color: 'bg-red-100 text-red-700' },
  REEMBOLSADO: { label: 'Reembolsado', color: 'bg-neutral-200 text-neutral-700' },
};

export const PAYMENT_METHODS = [
  { value: 'CONTRA_ENTREGA', label: 'Contra entrega' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
  { value: 'TARJETA', label: 'Tarjeta (pendiente)' },
];
