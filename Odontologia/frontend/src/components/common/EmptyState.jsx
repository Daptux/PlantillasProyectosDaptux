/**
 * frontend/src/components/common/EmptyState.jsx
 */
export default function EmptyState({ mensaje = 'No hay registros para mostrar.', icono = '📭' }) {
  return (
    <div className="text-center py-16 text-slate-400">
      <div className="text-5xl mb-3">{icono}</div>
      <p>{mensaje}</p>
    </div>
  );
}
