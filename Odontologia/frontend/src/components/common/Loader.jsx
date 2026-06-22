/**
 * frontend/src/components/common/Loader.jsx
 */
export default function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full mb-3" />
      <p>{texto}</p>
    </div>
  );
}
