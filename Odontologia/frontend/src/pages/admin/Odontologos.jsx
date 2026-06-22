/**
 * frontend/src/pages/admin/Odontologos.jsx
 */
import { useEffect, useState } from 'react';
import { odontologosService } from '../../services/odontologosService';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const vacio = { nombre: '', especialidad_id: '', documento: '', registro_profesional: '', telefono: '', correo: '', foto_url: '', biografia: '', visible_landing: true };

export default function Odontologos() {
  const [lista, setLista] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    const r = await odontologosService.listar();
    setLista(r.data);
    setCargando(false);
  }
  useEffect(() => { cargar(); odontologosService.especialidades().then((r) => setEspecialidades(r.data)).catch(() => {}); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  function abrirNuevo() { setForm(vacio); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(o) { setForm({ ...vacio, ...o, visible_landing: !!o.visible_landing }); setEditId(o.id); setError(''); setModal(true); }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) await odontologosService.actualizar(editId, form);
      else await odontologosService.crear(form);
      setModal(false); cargar();
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al guardar.'); }
  }
  async function eliminar(id) { if (confirm('¿Inactivar odontólogo?')) { await odontologosService.eliminar(id); cargar(); } }

  return (
    <div>
      <PageHeader titulo="Odontólogos" descripcion="Profesionales de la clínica.">
        <button onClick={abrirNuevo} className="btn-primary btn-sm">+ Nuevo odontólogo</button>
      </PageHeader>

      {cargando ? <Loader /> : lista.length === 0 ? <EmptyState mensaje="No hay odontólogos." icono="👨‍⚕️" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lista.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex items-center gap-3">
                <img src={o.foto_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80'} className="h-14 w-14 rounded-full object-cover" alt={o.nombre} />
                <div>
                  <p className="font-bold text-slate-800">{o.nombre}</p>
                  <p className="text-sm text-brand-600">{o.especialidad || 'General'}</p>
                </div>
              </div>
              <div className="text-sm text-slate-500 mt-3 space-y-1">
                {o.telefono && <p>📞 {o.telefono}</p>}
                {o.correo && <p>✉️ {o.correo}</p>}
                <p>{o.visible_landing ? '🌐 Visible en web' : '🚫 Oculto en web'}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => abrirEditar(o)} className="btn-ghost btn-sm">Editar</button>
                <button onClick={() => eliminar(o.id)} className="text-red-600 text-sm hover:underline">Inactivar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal abierto={modal} titulo={editId ? 'Editar odontólogo' : 'Nuevo odontólogo'} onClose={() => setModal(false)}>
        <form onSubmit={guardar} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <div><label className="label">Nombre *</label><input className="input" value={form.nombre} onChange={set('nombre')} required /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Especialidad</label>
              <select className="input" value={form.especialidad_id || ''} onChange={set('especialidad_id')}>
                <option value="">—</option>
                {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div><label className="label">Registro profesional</label><input className="input" value={form.registro_profesional || ''} onChange={set('registro_profesional')} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Teléfono</label><input className="input" value={form.telefono || ''} onChange={set('telefono')} /></div>
            <div><label className="label">Correo</label><input type="email" className="input" value={form.correo || ''} onChange={set('correo')} /></div>
          </div>
          <div><label className="label">Foto (URL)</label><input className="input" value={form.foto_url || ''} onChange={set('foto_url')} /></div>
          <div><label className="label">Biografía</label><textarea className="input" rows="3" value={form.biografia || ''} onChange={set('biografia')} /></div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.visible_landing} onChange={set('visible_landing')} /> Visible en la web pública
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
