// frontend/src/pages/admin/Odontologos.jsx
// CRUD de odontólogos.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { odontologosService } from '../../services/odontologosService';

const VACIO = { nombre: '', especialidad_id: '', documento: '', registro_profesional: '', telefono: '', correo: '', foto_url: '', biografia: '', visible_landing: true, estado: true };

export default function Odontologos() {
  const [odontologos, setOdontologos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await odontologosService.listar();
      setOdontologos(data.datos || []);
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
  function abrirEditar(o) {
    setForm({ ...VACIO, ...o, especialidad_id: o.especialidad_id || '', visible_landing: !!o.visible_landing, estado: !!o.estado });
    setEditId(o.id); setError(''); setModal(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const payload = { ...form, especialidad_id: form.especialidad_id || null };
      if (editId) await odontologosService.actualizar(editId, payload);
      else await odontologosService.crear(payload);
      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }
  async function eliminar(id) {
    if (!confirm('¿Desactivar este odontólogo?')) return;
    await odontologosService.eliminar(id);
    cargar();
  }

  return (
    <div>
      <PageHeader titulo="Odontólogos" descripcion="Equipo profesional de la clínica"
        accion={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo odontólogo</button>} />

      {cargando ? <Loader /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {odontologos.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">👨‍⚕️</div>
                <div>
                  <h3 className="font-bold text-ink">{o.nombre}</h3>
                  <p className="text-sm text-brand-600">{o.especialidad || 'Odontología'}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">{o.telefono || 'Sin teléfono'} · {o.correo || 'Sin correo'}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`badge ${o.estado ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                  {o.estado ? 'Activo' : 'Inactivo'}
                </span>
                <div>
                  <button className="btn-ghost text-xs text-brand-600" onClick={() => abrirEditar(o)}>Editar</button>
                  <button className="btn-ghost text-xs text-red-500" onClick={() => eliminar(o.id)}>Desactivar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal abierto={modal} titulo={editId ? 'Editar odontólogo' : 'Nuevo odontólogo'} onCerrar={() => setModal(false)}>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nombre *</label>
            <input name="nombre" className="input" value={form.nombre} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Especialidad (ID)</label>
            <input type="number" name="especialidad_id" className="input" value={form.especialidad_id} onChange={onChange} placeholder="Ej: 1" />
          </div>
          <div>
            <label className="label">Documento</label>
            <input name="documento" className="input" value={form.documento} onChange={onChange} />
          </div>
          <div>
            <label className="label">Registro profesional</label>
            <input name="registro_profesional" className="input" value={form.registro_profesional} onChange={onChange} />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" className="input" value={form.telefono} onChange={onChange} />
          </div>
          <div>
            <label className="label">Correo</label>
            <input type="email" name="correo" className="input" value={form.correo} onChange={onChange} />
          </div>
          <div>
            <label className="label">Foto (URL)</label>
            <input name="foto_url" className="input" value={form.foto_url} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Biografía</label>
            <textarea name="biografia" rows="3" className="input" value={form.biografia} onChange={onChange} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="visible_landing" checked={form.visible_landing} onChange={onChange} />
            <label className="text-sm text-slate-600">Visible en landing</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="estado" checked={form.estado} onChange={onChange} />
            <label className="text-sm text-slate-600">Activo</label>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
