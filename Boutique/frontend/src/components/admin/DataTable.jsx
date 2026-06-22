// Tabla genérica. columns: [{ key, label, render?(row), className? }]
export default function DataTable({ columns = [], rows = [], empty = 'Sin registros', loading }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`whitespace-nowrap px-4 py-3 font-semibold ${c.className || ''}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-neutral-400">Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-neutral-400">{empty}</td></tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id ?? i} className="transition hover:bg-neutral-50">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
