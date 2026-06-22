import { useEffect, useState } from 'react';
import { IoAddOutline, IoCreateOutline, IoTrashOutline, IoPowerOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { formatPrice, formatDate } from '../../utils/format.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Input from '../../components/forms/Input.jsx';
import Select from '../../components/forms/Select.jsx';

const TIPOS = [
  { value: 'PORCENTAJE', label: 'Porcentaje (%)' },
  { value: 'FIJO', label: 'Monto fijo' },
];

const emptyForm = {
  codigo: '',
  descripcion: '',
  tipo: 'PORCENTAJE',
  valor: '',
  monto_minimo: '',
  usos_maximos: '',
  fecha_inicio: '',
  fecha_fin: '',
  estado: true,
};

function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function CouponsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminService.coupons();
      setRows(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los cupones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      codigo: row.codigo || '',
      descripcion: row.descripcion || '',
      tipo: row.tipo || 'PORCENTAJE',
      valor: row.valor ?? '',
      monto_minimo: row.monto_minimo ?? '',
      usos_maximos: row.usos_maximos ?? '',
      fecha_inicio: toDateInput(row.fecha_inicio),
      fecha_fin: toDateInput(row.fecha_fin),
      estado: !!row.estado,
    });
    setModalOpen(true);
  }

  function buildData() {
    return {
      codigo: form.codigo,
      descripcion: form.descripcion,
      tipo: form.tipo,
      valor: Number(form.valor),
      monto_minimo: form.monto_minimo === '' ? 0 : Number(form.monto_minimo),
      usos_maximos: form.usos_maximos === '' ? null : Number(form.usos_maximos),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      estado: form.estado,
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await adminService.updateCoupon(editing.id, buildData());
        setFeedback('Cupón actualizado');
      } else {
        await adminService.createCoupon(buildData());
        setFeedback('Cupón creado');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el cupón');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEstado(row) {
    try {
      await adminService.updateCoupon(row.id, {
        codigo: row.codigo,
        descripcion: row.descripcion,
        tipo: row.tipo,
        valor: row.valor,
        monto_minimo: row.monto_minimo,
        usos_maximos: row.usos_maximos,
        fecha_inicio: toDateInput(row.fecha_inicio),
        fecha_fin: toDateInput(row.fecha_fin),
        estado: !row.estado,
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  }

  async function confirmDelete() {
    try {
      await adminService.removeCoupon(toDelete.id);
      setFeedback('Cupón eliminado');
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el cupón');
      setToDelete(null);
    }
  }

  const columns = [
    { key: 'codigo', label: 'Código', render: (r) => <span className="font-semibold text-ink">{r.codigo}</span> },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (r) => (r.tipo === 'PORCENTAJE' ? 'Porcentaje' : 'Fijo'),
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (r) => (r.tipo === 'PORCENTAJE' ? `${r.valor}%` : formatPrice(r.valor)),
    },
    { key: 'monto_minimo', label: 'Mínimo', render: (r) => formatPrice(r.monto_minimo) },
    {
      key: 'usos',
      label: 'Usos',
      render: (r) => `${r.usos_actuales ?? 0} / ${r.usos_maximos ?? '∞'}`,
    },
    {
      key: 'vigencia',
      label: 'Vigencia',
      render: (r) => (
        <span className="text-neutral-500">{formatDate(r.fecha_inicio)} – {formatDate(r.fecha_fin)}</span>
      ),
    },
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
          <button onClick={() => toggleEstado(r)} title="Cambiar estado" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
            <IoPowerOutline size={18} />
          </button>
          <button onClick={() => openEdit(r)} title="Editar" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50">
            <IoCreateOutline size={18} />
          </button>
          <button onClick={() => setToDelete(r)} title="Eliminar" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
            <IoTrashOutline size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Cupones</h1>
        <Button variant="primary" onClick={openCreate}>
          <IoAddOutline size={18} className="mr-1 inline" /> Nuevo cupón
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      {loading ? (
        <Loader label="Cargando cupones..." />
      ) : (
        <DataTable columns={columns} rows={rows} empty="Sin cupones" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar cupón' : 'Nuevo cupón'} maxWidth="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
            <Select label="Tipo" options={TIPOS} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
          </div>
          <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Valor" type="number" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
            <Input label="Monto mínimo" type="number" min="0" value={form.monto_minimo} onChange={(e) => setForm({ ...form, monto_minimo: e.target.value })} />
            <Input label="Usos máximos" type="number" min="0" value={form.usos_maximos} onChange={(e) => setForm({ ...form, usos_maximos: e.target.value })} placeholder="Ilimitado" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required />
            <Input label="Fecha fin" type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.checked })} />
            Activo
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar cupón"
        message={`¿Eliminar el cupón "${toDelete?.codigo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
