// frontend/src/components/common/Loader.jsx
export default function Loader({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      {texto}
    </div>
  );
}
