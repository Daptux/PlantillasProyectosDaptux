// Tarjeta de métrica reutilizable
// props: icon, label, value, accent ('navy'|'gold'|'green'|'blue'|'amber'|'red')
export default function StatCard({ icon, label, value, accent = 'navy' }) {
  return (
    <div className={`statcard sc-${accent}`}>
      <div className="sc-ico">{icon}</div>
      <div className="sc-body">
        <div className="sc-label">{label}</div>
        <div className="sc-value">{value}</div>
      </div>
    </div>
  );
}
