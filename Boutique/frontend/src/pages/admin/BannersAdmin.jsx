import { useEffect, useState } from 'react';
import { IoAddOutline, IoCreateOutline, IoTrashOutline, IoPowerOutline, IoCloudUploadOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { resolveImage } from '../../services/api.js';
import { uploadService } from '../../services/upload.service.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Input from '../../components/forms/Input.jsx';

const emptyForm = { titulo: '', subtitulo: '', imagen: '', texto_boton: '', enlace: '', orden: 0, estado: true };

export default function BannersAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [toDelete, setToDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminService.banners();
      setRows(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los banners');
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
      titulo: row.titulo || '',
      subtitulo: row.subtitulo || '',
      imagen: row.imagen || '',
      texto_boton: row.texto_boton || '',
      enlace: row.enlace || '',
      orden: row.orden ?? 0,
      estado: !!row.estado,
    });
    setModalOpen(true);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadService.banner(file);
      setForm((f) => ({ ...f, imagen: res.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  }

  function buildData() {
    return {
      titulo: form.titulo,
      subtitulo: form.subtitulo,
      imagen: form.imagen,
      texto_boton: form.texto_boton,
      enlace: form.enlace,
      orden: Number(form.orden) || 0,
      estado: form.estado,
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await adminService.updateBanner(editing.id, buildData());
        setFeedback('Banner actualizado');
      } else {
        await adminService.createBanner(buildData());
        setFeedback('Banner creado');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el banner');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEstado(row) {
    try {
      await adminService.updateBanner(row.id, {
        titulo: row.titulo,
        subtitulo: row.subtitulo,
        imagen: row.imagen,
        texto_boton: row.texto_boton,
        enlace: row.enlace,
        orden: row.orden,
        estado: !row.estado,
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  }

  async function confirmDelete() {
    try {
      await adminService.removeBanner(toDelete.id);
      setFeedback('Banner eliminado');
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el banner');
      setToDelete(null);
    }
  }

  const columns = [
    {
      key: 'imagen',
      label: 'Imagen',
      render: (r) => (
        <img src={resolveImage(r.imagen)} alt={r.titulo} className="h-12 w-20 rounded-lg object-cover" />
      ),
    },
    { key: 'titulo', label: 'Título', render: (r) => <span className="font-medium text-ink">{r.titulo}</span> },
    { key: 'subtitulo', label: 'Subtítulo', render: (r) => <span className="text-neutral-500">{r.subtitulo}</span> },
    { key: 'orden', label: 'Orden' },
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
        <h1 className="font-display text-3xl font-bold">Banners</h1>
        <Button variant="primary" onClick={openCreate}>
          <IoAddOutline size={18} className="mr-1 inline" /> Nuevo banner
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      {loading ? (
        <Loader label="Cargando banners..." />
      ) : (
        <DataTable columns={columns} rows={rows} empty="Sin banners" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar banner' : 'Nuevo banner'} maxWidth="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <Input label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
          <Input label="Subtítulo" value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} />

          <div>
            <label className="label">Imagen</label>
            <Input value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} placeholder="URL o sube un archivo" />
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-blue-600">
              <IoCloudUploadOutline size={18} />
              {uploading ? 'Subiendo...' : 'Subir archivo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
            {form.imagen && (
              <img src={resolveImage(form.imagen)} alt="preview" className="mt-2 h-28 w-full rounded-lg object-cover" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Texto del botón" value={form.texto_boton} onChange={(e) => setForm({ ...form, texto_boton: e.target.value })} />
            <Input label="Enlace" value={form.enlace} onChange={(e) => setForm({ ...form, enlace: e.target.value })} placeholder="/shop" />
          </div>
          <Input label="Orden" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.checked })} />
            Activo
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving || uploading}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar banner"
        message={`¿Eliminar el banner "${toDelete?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
