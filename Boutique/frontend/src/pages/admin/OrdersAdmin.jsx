import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEyeOutline, IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { formatPrice, formatDate, ORDER_STATUS, PAYMENT_STATUS } from '../../utils/format.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';
import Select from '../../components/forms/Select.jsx';
import Input from '../../components/forms/Input.jsx';

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  ...Object.entries(ORDER_STATUS).map(([value, { label }]) => ({ value, label })),
];
const PAGO_OPTIONS = [
  { value: '', label: 'Todos los pagos' },
  ...Object.entries(PAYMENT_STATUS).map(([value, { label }]) => ({ value, label })),
];

const LIMIT = 20;

export default function OrdersAdmin() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ estado: '', estado_pago: '', search: '', desde: '', hasta: '' });

  function load() {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filters.estado) params.estado = filters.estado;
    if (filters.estado_pago) params.estado_pago = filters.estado_pago;
    if (filters.search) params.search = filters.search;
    if (filters.desde) params.desde = filters.desde;
    if (filters.hasta) params.hasta = filters.hasta;
    adminService
      .orders(params)
      .then((res) => {
        setOrders(res?.data || []);
        setPagination(res?.pagination || null);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [page, filters]);

  function setFilter(key, value) {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const totalPages = pagination?.totalPages || pagination?.pages || 1;

  const columns = [
    { key: 'numero', label: 'Número', render: (r) => <span className="font-medium text-ink">#{r.numero}</span> },
    { key: 'nombre_cliente', label: 'Cliente' },
    { key: 'created_at', label: 'Fecha', render: (r) => formatDate(r.created_at) },
    { key: 'total_items', label: 'Items', render: (r) => r.total_items ?? 0 },
    { key: 'total', label: 'Total', render: (r) => formatPrice(r.total) },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => {
        const e = ORDER_STATUS[r.estado] || { label: r.estado, color: 'bg-neutral-200 text-neutral-700' };
        return <span className={`badge ${e.color}`}>{e.label}</span>;
      },
    },
    {
      key: 'estado_pago',
      label: 'Pago',
      render: (r) => {
        const p = PAYMENT_STATUS[r.estado_pago] || { label: r.estado_pago, color: 'bg-neutral-200 text-neutral-700' };
        return <span className={`badge ${p.color}`}>{p.label}</span>;
      },
    },
    {
      key: 'acciones',
      label: '',
      render: (r) => (
        <Link
          to={`/admin/pedidos/${r.id}`}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
        >
          <IoEyeOutline size={16} /> Ver
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Pedidos</h1>

      {error && <Alert type="error">{error}</Alert>}

      <div className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Estado"
          options={ESTADO_OPTIONS}
          value={filters.estado}
          onChange={(e) => setFilter('estado', e.target.value)}
        />
        <Select
          label="Estado de pago"
          options={PAGO_OPTIONS}
          value={filters.estado_pago}
          onChange={(e) => setFilter('estado_pago', e.target.value)}
        />
        <Input
          label="Buscar"
          placeholder="Cliente o número"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
        />
        <Input label="Desde" type="date" value={filters.desde} onChange={(e) => setFilter('desde', e.target.value)} />
        <Input label="Hasta" type="date" value={filters.hasta} onChange={(e) => setFilter('hasta', e.target.value)} />
      </div>

      {loading ? (
        <Loader label="Cargando pedidos..." />
      ) : (
        <DataTable columns={columns} rows={orders} empty="No hay pedidos" />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <IoChevronBackOutline size={18} />
          </Button>
          <span className="text-sm text-neutral-600">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <IoChevronForwardOutline size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
