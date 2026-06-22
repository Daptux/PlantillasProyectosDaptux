import { useEffect, useState } from 'react';
import { IoCashOutline, IoReceiptOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { resolveImage } from '../../services/api.js';
import { formatPrice, ORDER_STATUS } from '../../utils/format.js';
import StatCard from '../../components/admin/StatCard.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';
import Input from '../../components/forms/Input.jsx';

export default function ReportsAdmin() {
  const [range, setRange] = useState({ desde: '', hasta: '' });
  const [applied, setApplied] = useState({ desde: '', hasta: '' });

  const [salesLoading, setSalesLoading] = useState(true);
  const [sales, setSales] = useState(null);
  const [best, setBest] = useState([]);
  const [low, setLow] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [othersLoading, setOthersLoading] = useState(true);
  const [error, setError] = useState('');

  // Ventas (depende del rango de fechas)
  useEffect(() => {
    setSalesLoading(true);
    const params = {};
    if (applied.desde) params.desde = applied.desde;
    if (applied.hasta) params.hasta = applied.hasta;
    adminService
      .sales(params)
      .then((d) => setSales(d))
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar las ventas'))
      .finally(() => setSalesLoading(false));
  }, [applied]);

  // Resto de reportes (una sola vez)
  useEffect(() => {
    Promise.all([adminService.bestProducts(), adminService.lowStock(), adminService.topCustomers()])
      .then(([b, l, c]) => {
        setBest(b || []);
        setLow(l || []);
        setCustomers(c || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los reportes'))
      .finally(() => setOthersLoading(false));
  }, []);

  function applyRange(e) {
    e.preventDefault();
    setApplied({ ...range });
  }

  const ventasMesColumns = [
    { key: 'mes', label: 'Mes' },
    { key: 'pedidos', label: 'Pedidos' },
    { key: 'ingresos', label: 'Ingresos', render: (r) => formatPrice(r.ingresos) },
  ];

  const porEstadoColumns = [
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => {
        const e = ORDER_STATUS[r.estado] || { label: r.estado, color: 'bg-neutral-200 text-neutral-700' };
        return <span className={`badge ${e.color}`}>{e.label}</span>;
      },
    },
    { key: 'total', label: 'Pedidos' },
  ];

  const bestColumns = [
    {
      key: 'nombre',
      label: 'Producto',
      render: (r) => (
        <div className="flex items-center gap-3">
          <img src={resolveImage(r.imagen)} alt={r.nombre} className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-medium text-ink">{r.nombre}</span>
        </div>
      ),
    },
    { key: 'categoria', label: 'Categoría', render: (r) => r.categoria || '—' },
    { key: 'precio', label: 'Precio', render: (r) => formatPrice(r.precio) },
    { key: 'ventas', label: 'Ventas' },
  ];

  const lowColumns = [
    { key: 'producto', label: 'Producto' },
    { key: 'talla', label: 'Talla' },
    { key: 'color', label: 'Color' },
    { key: 'sku', label: 'SKU', render: (r) => <span className="text-neutral-500">{r.sku}</span> },
    {
      key: 'stock',
      label: 'Stock',
      render: (r) => <span className="font-semibold text-red-600">{r.stock}</span>,
    },
    { key: 'stock_minimo', label: 'Mínimo' },
  ];

  const customersColumns = [
    {
      key: 'nombre',
      label: 'Cliente',
      render: (r) => <span className="font-medium text-ink">{[r.nombre, r.apellido].filter(Boolean).join(' ')}</span>,
    },
    { key: 'email', label: 'Email', render: (r) => <span className="text-neutral-500">{r.email}</span> },
    { key: 'total_pedidos', label: 'Pedidos' },
    { key: 'total_gastado', label: 'Total gastado', render: (r) => formatPrice(r.total_gastado) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Reportes</h1>

      {error && <Alert type="error">{error}</Alert>}

      {/* Ventas */}
      <section className="space-y-4">
        <form onSubmit={applyRange} className="card flex flex-wrap items-end gap-4 p-4">
          <Input
            label="Desde"
            type="date"
            value={range.desde}
            onChange={(e) => setRange((r) => ({ ...r, desde: e.target.value }))}
          />
          <Input
            label="Hasta"
            type="date"
            value={range.hasta}
            onChange={(e) => setRange((r) => ({ ...r, hasta: e.target.value }))}
          />
          <Button type="submit" variant="primary">
            Aplicar
          </Button>
        </form>

        {salesLoading ? (
          <Loader label="Cargando ventas..." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard title="Ingresos" value={formatPrice(sales?.ingresos)} Icon={IoCashOutline} color="bg-emerald-500" />
              <StatCard title="Pedidos" value={sales?.pedidos ?? 0} Icon={IoReceiptOutline} color="bg-blue-500" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 font-display text-xl font-semibold">Ventas por mes</h2>
                <DataTable columns={ventasMesColumns} rows={sales?.por_mes || []} empty="Sin datos" />
              </div>
              <div>
                <h2 className="mb-3 font-display text-xl font-semibold">Pedidos por estado</h2>
                <DataTable columns={porEstadoColumns} rows={sales?.por_estado || []} empty="Sin datos" />
              </div>
            </div>
          </>
        )}
      </section>

      {/* Otros reportes */}
      <section className="space-y-6">
        <div>
          <h2 className="mb-3 font-display text-xl font-semibold">Productos más vendidos</h2>
          <DataTable columns={bestColumns} rows={best} loading={othersLoading} empty="Sin datos" />
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-semibold">Productos bajo stock</h2>
          <DataTable columns={lowColumns} rows={low} loading={othersLoading} empty="Sin productos bajo stock" />
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-semibold">Mejores clientes</h2>
          <DataTable columns={customersColumns} rows={customers} loading={othersLoading} empty="Sin datos" />
        </div>
      </section>
    </div>
  );
}
