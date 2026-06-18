// Loader reutilizable
export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div className="loading">
      <div className="spinner" />
      {text}
    </div>
  );
}
