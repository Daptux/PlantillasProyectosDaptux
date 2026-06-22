/**
 * frontend/src/utils/format.js
 * Helpers de formato reutilizables.
 */

export const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(Number(valor) || 0);

export const formatoFecha = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha.includes?.('T') ? fecha : `${fecha}T00:00:00`);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatoFechaHora = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

// Colores de badge por estado de cita
export const colorEstadoCita = {
  SOLICITADA: 'bg-amber-100 text-amber-700',
  CONFIRMADA: 'bg-blue-100 text-blue-700',
  EN_ESPERA: 'bg-purple-100 text-purple-700',
  EN_ATENCION: 'bg-indigo-100 text-indigo-700',
  FINALIZADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-700',
  NO_ASISTIO: 'bg-rose-100 text-rose-700',
  REPROGRAMADA: 'bg-slate-100 text-slate-700',
};

export const colorEstadoPlan = {
  PROPUESTO: 'bg-amber-100 text-amber-700',
  ACEPTADO: 'bg-blue-100 text-blue-700',
  EN_PROCESO: 'bg-indigo-100 text-indigo-700',
  FINALIZADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
};
