/**
 * frontend/src/components/common/PageHeader.jsx
 * Encabezado estándar de las páginas del admin.
 */
export default function PageHeader({ titulo, descripcion, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{titulo}</h1>
        {descripcion && <p className="text-slate-500 mt-1">{descripcion}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
