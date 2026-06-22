import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IoCashOutline,
  IoReceiptOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoAlertCircleOutline,
  IoCubeOutline,
} from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { resolveImage } from '../../services/api.js';
import { formatPrice, formatDate, ORDER_STATUS } from '../../utils/format.js';
import StatCard from '../../components/admin/StatCard.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService
      .dashboard()
      .then((d) => setData(d))
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el panel'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Cargando panel..." />;

  const stats = [
    { title: 'Ventas del mes', value: formatPrice(data?.ventas_mes), Icon: IoCashOutline, color: 'bg-emerald-500' },
    { title: 'Total pedidos', value: data?.total_pedidos ?? 0, Icon: IoReceiptOutline, color: 'bg-blue-500' },
    { title: 'Pedidos pendientes', value: data?.pedidos_pendientes ?? 0, Icon: IoTimeOutline, color: 'bg-amber-500' },
    { title: 'Clientes', value: data?.clientes ?? 0, Icon: IoPeopleOutline, color: 'bg-indigo-500' },
    { title: 'Productos bajo stock', value: data?.productos_bajo_stock ?? 0, Icon: IoAlertCircleOutline, color: 'bg-red-500' },
    { title: 'Total productos', value: data?.total_productos ?? 0, Icon: IoCubeOutline, color: 'bg-purple-500' },
  ];

  const columns = [
    { key: 'numero', label: 'Número', render: (r) => <span className="font-medium text-ink">#{r.numero}</span> },
    { key: 'nombre_cliente', label: 'Cliente' },
    { key: 'total', label: 'Total', render: (r) => formatPrice(r.total) },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => {
        const e = ORDER_STATUS[r.estado] || { label: r.estado, color: 'bg-neutral-200 text-neutral-700' };
        return <span className={`badge ${e.color}`}>{e.label}</span>;
      },
    },
    { key: 'created_at', label: 'Fecha', render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Panel de control</h1>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <h2 className="mb-3 font-display text-xl font-semibold">Últimos pedidos</h2>
          <DataTableLinkable
            columns={columns}
            rows={data?.ultimos_pedidos || []}
            onRowClick={(r) => navigate(`/admin/pedidos/${r.id}`)}
            empty="Sin pedidos recientes"
          />
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-semibold">Más vendidos</h2>
          <div className="card divide-y divide-neutral-100">
            {(data?.productos_mas_vendidos || []).length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-400">Sin datos</p>
            ) : (
              (data?.productos_mas_vendidos || []).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <img
                    src={resolveImage(p.imagen)}
                    alt={p.nombre}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.nombre}</p>
                    <p className="text-xs text-neutral-500">{formatPrice(p.precio)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-accent-dark">{p.ventas} vts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// DataTable con filas clicables (reusa estilos de DataTable pero permite navegación)
function DataTableLinkable({ columns = [], rows = [], empty = 'Sin registros', onRowClick }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`whitespace-nowrap px-4 py-3 font-semibold ${c.className || ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-neutral-400">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className="cursor-pointer transition hover:bg-neutral-50"
                >
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
