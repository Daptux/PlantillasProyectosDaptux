import { useEffect, useState } from 'react';
import { IoEyeOutline, IoPowerOutline, IoSearchOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { formatPrice, formatDate, ORDER_STATUS } from '../../utils/format.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';

export default function UsersAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function load(params = {}) {
    setLoading(true);
    try {
      const res = await adminService.users({ search, ...params });
      setRows(res?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function submitSearch(e) {
    e.preventDefault();
    load();
  }

  async function openDetail(row) {
    setDetail({ user: row, orders: [] });
    setDetailLoading(true);
    try {
      const res = await adminService.userDetail(row.id);
      setDetail(res);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el detalle');
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleEstado(row) {
    try {
      await adminService.updateUser(row.id, { estado: !row.estado });
      setFeedback(row.estado ? 'Cliente desactivado' : 'Cliente activado');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Cliente',
      render: (r) => <span className="font-medium text-ink">{r.nombre} {r.apellido}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono', render: (r) => r.telefono || '—' },
    { key: 'total_pedidos', label: 'Pedidos', render: (r) => r.total_pedidos ?? 0 },
    { key: 'fecha_creacion', label: 'Registro', render: (r) => formatDate(r.fecha_creacion) },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => (
        <span className={`badge ${r.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-600'}`}>
          {r.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openDetail(r)} title="Ver detalle" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50">
            <IoEyeOutline size={18} />
          </button>
          <button onClick={() => toggleEstado(r)} title="Activar/Desactivar" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
            <IoPowerOutline size={18} />
          </button>
        </div>
      ),
    },
  ];

  const u = detail?.user;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Clientes</h1>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">Buscar</Button>
      </form>

      {loading ? (
        <Loader label="Cargando clientes..." />
      ) : (
        <DataTable columns={columns} rows={rows} empty="Sin clientes" />
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detalle del cliente" maxWidth="max-w-2xl">
        {detailLoading ? (
          <Loader label="Cargando..." />
        ) : u ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre" value={`${u.nombre || ''} ${u.apellido || ''}`} />
              <Field label="Email" value={u.email} />
              <Field label="Teléfono" value={u.telefono || '—'} />
              <Field label="Registro" value={formatDate(u.fecha_creacion)} />
              <Field label="Estado" value={u.estado ? 'Activo' : 'Inactivo'} />
              <Field label="Total pedidos" value={u.total_pedidos ?? 0} />
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Historial de pedidos</h4>
              {(detail.orders || []).length === 0 ? (
                <p className="text-sm text-neutral-400">Sin pedidos</p>
              ) : (
                <div className="card divide-y divide-neutral-100">
                  {detail.orders.map((o) => {
                    const e = ORDER_STATUS[o.estado] || { label: o.estado, color: 'bg-neutral-200 text-neutral-700' };
                    return (
                      <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span className="font-medium text-ink">#{o.numero}</span>
                        <span className="text-neutral-500">{formatDate(o.created_at)}</span>
                        <span className={`badge ${e.color}`}>{e.label}</span>
                        <span className="font-semibold">{formatPrice(o.total)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
