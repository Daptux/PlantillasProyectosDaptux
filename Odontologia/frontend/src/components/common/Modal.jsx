// frontend/src/components/common/Modal.jsx
// Modal reutilizable para crear/editar registros en el panel.

export default function Modal({ abierto, titulo, onCerrar, children, ancho = 'max-w-2xl' }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onCerrar} />
      {/* Contenido */}
      <div className={`relative w-full ${ancho} card max-h-[90vh] overflow-y-auto animate-fadeUp`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-ink">{titulo}</h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
