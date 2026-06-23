// frontend/src/components/common/PageHeader.jsx
// Encabezado estándar de cada página del panel: título, descripción y acción.

export default function PageHeader({ titulo, descripcion, accion }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-ink">{titulo}</h1>
        {descripcion && <p className="text-sm text-slate-500">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}
