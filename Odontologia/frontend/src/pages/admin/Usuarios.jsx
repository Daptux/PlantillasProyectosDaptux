// frontend/src/pages/admin/Usuarios.jsx
// CRUD de usuarios del sistema (solo ADMIN/SUPERADMIN).

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { usuariosService } from '../../services/contenidoService';

// rol_id según seed.sql: 1 SUPERADMIN, 2 ADMIN, 3 RECEPCIONISTA, 4 ODONTOLOGO, 5 AUXILIAR, 6 CAJA, 7 PACIENTE
const ROLES = [
  { id: 2, nombre: 'ADMIN' },
  { id: 3, nombre: 'RECEPCIONISTA' },
  { id: 4, nombre: 'ODONTOLOGO' },
  { id: 5, nombre: 'AUXILIAR' },
  { id: 6, nombre: 'CAJA' },
  { id: 1, nombre: 'SUPERADMIN' },
];
const VACIO = { nombre: '', correo: '', password: '', rol_id: 3, telefono: '', activo: true };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await usuariosService.listar();
      setUsuarios(data.datos || []);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }
  function abrirNuevo() { setForm(VACIO); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(u) { setForm({ nombre: u.nombre, correo: u.correo, password: '', rol_id: u.rol_id, telefono: u.telefono || '', activo: !!u.activo }); setEditId(u.id); setError(''); setModal(true); }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) await usuariosService.actualizar(editId, payload);
      else await usuariosService.crear(payload);
      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }
  async function eliminar(id) {
    if (!confirm('¿Desactivar este usuario?')) return;
    await usuariosService.eliminar(id);
    cargar();
  }

  return (
    <div>
      <PageHeader titulo="Usuarios" descripcion="Acceso al sistema y roles"
        accion={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo usuario</button>} />

      {cargando ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-ink">{u.nombre}</td>
                  <td className="px-4 py-3">{u.correo}</td>
                  <td className="px-4 py-3"><span className="badge bg-brand-100 text-brand-700">{u.rol}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost text-xs text-brand-600" onClick={() => abrirEditar(u)}>Editar</button>
                    <button className="btn-ghost text-xs text-red-500" onClick={() => eliminar(u.id)}>Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal abierto={modal} titulo={editId ? 'Editar usuario' : 'Nuevo usuario'} onCerrar={() => setModal(false)} ancho="max-w-lg">
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input name="nombre" className="input" value={form.nombre} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Correo *</label>
            <input type="email" name="correo" className="input" value={form.correo} onChange={onChange} required />
          </div>
          <div>
            <label className="label">{editId ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label>
            <input type="password" name="password" className="input" value={form.password} onChange={onChange} required={!editId} minLength={6} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Rol</label>
              <select name="rol_id" className="input" value={form.rol_id} onChange={onChange}>
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input name="telefono" className="input" value={form.telefono} onChange={onChange} />
            </div>
          </div>
          {editId && (
            <div className="flex items-center gap-2">
              <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} />
              <label className="text-sm text-slate-600">Usuario activo</label>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
