import { useEffect, useState } from 'react';
import { IoAddOutline, IoCreateOutline, IoTrashOutline, IoPowerOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { formatDate } from '../../utils/format.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Input from '../../components/forms/Input.jsx';

const emptyForm = { nombre: '', apellido: '', email: '', password: '', telefono: '', estado: true };

export default function EmployeesAdmin() {
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
      const data = await adminService.employees();
      setRows(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los empleados');
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
      nombre: row.nombre || '',
      apellido: row.apellido || '',
      email: row.email || '',
      password: '',
      telefono: row.telefono || '',
      estado: !!row.estado,
    });
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const data = {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          estado: form.estado,
        };
        if (form.password) data.password = form.password;
        await adminService.updateEmployee(editing.id, data);
        setFeedback('Empleado actualizado');
      } else {
        await adminService.createEmployee({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          telefono: form.telefono,
        });
        setFeedback('Empleado creado');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el empleado');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEstado(row) {
    try {
      await adminService.updateEmployee(row.id, { estado: !row.estado });
      setFeedback(row.estado ? 'Empleado desactivado' : 'Empleado activado');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  }

  async function confirmDelete() {
    try {
      await adminService.removeEmployee(toDelete.id);
      setFeedback('Empleado eliminado');
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el empleado');
      setToDelete(null);
    }
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Empleado',
      render: (r) => <span className="font-medium text-ink">{r.nombre} {r.apellido}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono', render: (r) => r.telefono || '—' },
    { key: 'fecha_creacion', label: 'Alta', render: (r) => formatDate(r.fecha_creacion) },
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
          <button onClick={() => toggleEstado(r)} title="Activar/Desactivar" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
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
        <h1 className="font-display text-3xl font-bold">Empleados</h1>
        <Button variant="primary" onClick={openCreate}>
          <IoAddOutline size={18} className="mr-1 inline" /> Nuevo empleado
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      {loading ? (
        <Loader label="Cargando empleados..." />
      ) : (
        <DataTable columns={columns} rows={rows} empty="Sin empleados" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar empleado' : 'Nuevo empleado'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!!editing}
            required={!editing}
          />
          <Input
            label={editing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editing}
          />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.checked })} />
              Activo
            </label>
          )}
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
        title="Eliminar empleado"
        message={`¿Eliminar al empleado "${toDelete?.nombre} ${toDelete?.apellido || ''}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
