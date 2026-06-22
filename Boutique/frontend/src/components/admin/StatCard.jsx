export default function StatCard({ title, value, Icon, color = 'bg-ink', sub }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color} text-white`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-neutral-500">{title}</p>
        <p className="text-2xl font-bold text-ink">{value}</p>
        {sub && <p className="text-xs text-neutral-400">{sub}</p>}
      </div>
    </div>
  );
}
