/**
 * frontend/src/pages/admin/Usuarios.jsx
 * CRUD de usuarios del sistema.
 */
import { useEffect, useState } from 'react';
import { usuariosService } from '../../services/contenidoService';
import { formatoFechaHora } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const vacio = { nombre: '', correo: '', password: '', rol_id: '', telefono: '' };

export default function Usuarios() {
  const [lista, setLista] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function cargar() { setCargando(true); const r = await usuariosService.listar(); setLista(r.data); setCargando(false); }
  useEffect(() => { cargar(); usuariosService.roles().then((r) => setRoles(r.data)).catch(() => {}); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  function abrirNuevo() { setForm(vacio); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(u) { setForm({ nombre: u.nombre, correo: u.correo, password: '', rol_id: u.rol_id, telefono: u.telefono || '' }); setEditId(u.id); setError(''); setModal(true); }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) await usuariosService.actualizar(editId, payload);
      else await usuariosService.crear(payload);
      setModal(false); cargar();
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al guardar.'); }
  }
  async function eliminar(id) { if (confirm('¿Desactivar usuario?')) { await usuariosService.eliminar(id); cargar(); } }

  return (
    <div>
      <PageHeader titulo="Usuarios" descripcion="Gestión de accesos al sistema.">
        <button onClick={abrirNuevo} className="btn-primary btn-sm">+ Nuevo usuario</button>
      </PageHeader>

      <div className="card overflow-hidden">
        {cargando ? <Loader /> : lista.length === 0 ? <EmptyState mensaje="No hay usuarios." icono="👥" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Último login</th><th className="px-4">Acciones</th></tr></thead>
              <tbody>
                {lista.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td><span className="badge bg-brand-100 text-brand-700">{u.rol}</span></td>
                    <td><span className={`badge ${u.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="text-slate-400">{u.ultimo_login ? formatoFechaHora(u.ultimo_login) : '—'}</td>
                    <td className="px-4 space-x-3 whitespace-nowrap">
                      <button onClick={() => abrirEditar(u)} className="text-brand-600 hover:underline">Editar</button>
                      <button onClick={() => eliminar(u.id)} className="text-red-600 hover:underline">Desactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal abierto={modal} titulo={editId ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModal(false)} ancho="max-w-lg">
        <form onSubmit={guardar} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <div><label className="label">Nombre *</label><input className="input" value={form.nombre} onChange={set('nombre')} required /></div>
          <div><label className="label">Correo *</label><input type="email" className="input" value={form.correo} onChange={set('correo')} required /></div>
          <div><label className="label">{editId ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label><input type="password" className="input" value={form.password} onChange={set('password')} required={!editId} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Rol *</label>
              <select className="input" value={form.rol_id} onChange={set('rol_id')} required>
                <option value="">Selecciona</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div><label className="label">Teléfono</label><input className="input" value={form.telefono} onChange={set('telefono')} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
