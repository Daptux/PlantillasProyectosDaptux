// Mensaje de error o éxito. No renderiza nada si no hay mensaje.
export default function Alert({ error, success }) {
  if (error) return <div className="alert alert-error">{error}</div>;
  if (success) return <div className="alert alert-success">{success}</div>;
  return null;
}
