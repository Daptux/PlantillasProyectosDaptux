import { useEffect, useState } from 'react';
import { IoAddOutline, IoCreateOutline, IoTrashOutline, IoPowerOutline } from 'react-icons/io5';
import { brandService } from '../../services/product.service.js';
import { resolveImage } from '../../services/api.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Input from '../../components/forms/Input.jsx';

const emptyForm = { nombre: '', logo: '', estado: true };

export default function BrandsAdmin() {
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
      const data = await brandService.list(true);
      setRows(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las marcas');
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
    setForm({ nombre: row.nombre || '', logo: row.logo || '', estado: !!row.estado });
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await brandService.update(editing.id, form);
        setFeedback('Marca actualizada');
      } else {
        await brandService.create(form);
        setFeedback('Marca creada');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la marca');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEstado(row) {
    try {
      await brandService.update(row.id, { ...row, estado: !row.estado });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  }

  async function confirmDelete() {
    try {
      await brandService.remove(toDelete.id);
      setFeedback('Marca eliminada');
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la marca');
      setToDelete(null);
    }
  }

  const columns = [
    {
      key: 'logo',
      label: 'Logo',
      render: (r) => (
        <img src={resolveImage(r.logo)} alt={r.nombre} className="h-10 w-10 rounded-lg object-contain bg-neutral-50" />
      ),
    },
    { key: 'nombre', label: 'Nombre', render: (r) => <span className="font-medium text-ink">{r.nombre}</span> },
    { key: 'slug', label: 'Slug', render: (r) => <span className="text-neutral-500">{r.slug}</span> },
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
        <h1 className="font-display text-3xl font-bold">Marcas</h1>
        <Button variant="primary" onClick={openCreate}>
          <IoAddOutline size={18} className="mr-1 inline" /> Nueva marca
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      {loading ? (
        <Loader label="Cargando marcas..." />
      ) : (
        <DataTable columns={columns} rows={rows} empty="Sin marcas" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar marca' : 'Nueva marca'}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <Input label="Logo (URL)" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." />
          {form.logo && <img src={resolveImage(form.logo)} alt="preview" className="h-16 w-16 rounded-lg object-contain bg-neutral-50" />}
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
        title="Eliminar marca"
        message={`¿Eliminar la marca "${toDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
