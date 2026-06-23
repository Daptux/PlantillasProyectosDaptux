// frontend/src/components/common/EstadoBadge.jsx
// Badge de color según el estado (citas, planes, etc.).

const COLORES = {
  // Citas
  SOLICITADA: 'bg-amber-100 text-amber-700',
  CONFIRMADA: 'bg-brand-100 text-brand-700',
  EN_ESPERA: 'bg-indigo-100 text-indigo-700',
  EN_ATENCION: 'bg-purple-100 text-purple-700',
  FINALIZADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-700',
  NO_ASISTIO: 'bg-slate-200 text-slate-600',
  REPROGRAMADA: 'bg-orange-100 text-orange-700',
  // Planes
  PROPUESTO: 'bg-amber-100 text-amber-700',
  ACEPTADO: 'bg-brand-100 text-brand-700',
  EN_PROCESO: 'bg-indigo-100 text-indigo-700',
  // Detalle / genéricos
  PENDIENTE: 'bg-slate-200 text-slate-600',
  REALIZADO: 'bg-green-100 text-green-700',
};

export default function EstadoBadge({ estado }) {
  const clase = COLORES[estado] || 'bg-slate-100 text-slate-600';
  return <span className={`badge ${clase}`}>{String(estado || '').replace(/_/g, ' ')}</span>;
}
