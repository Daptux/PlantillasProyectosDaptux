// Estado vacío reutilizable
export default function EmptyState({ icon = '📭', title = 'Nada por aquí', message = '', action = null }) {
  return (
    <div className="empty">
      <div style={{ fontSize: 42, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#475569', marginBottom: 4 }}>{title}</div>
      {message && <div>{message}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
