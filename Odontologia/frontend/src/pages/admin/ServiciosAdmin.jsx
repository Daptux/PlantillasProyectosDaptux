// frontend/src/pages/admin/ServiciosAdmin.jsx
// CRUD de servicios odontológicos.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { serviciosService } from '../../services/serviciosService';

const CATEGORIAS = ['General', 'Estetica', 'Ortodoncia', 'Cirugia', 'Endodoncia', 'Periodoncia', 'Rehabilitacion', 'Odontopediatria', 'Urgencias'];
const VACIO = { nombre: '', categoria: 'General', descripcion_corta: '', descripcion_larga: '', precio_base: 0, duracion_min: 30, imagen_url: '', visible_landing: true, activo: true };
const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await serviciosService.listar();
      setServicios(data.datos || []);
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
  function abrirEditar(s) { setForm({ ...VACIO, ...s, visible_landing: !!s.visible_landing, activo: !!s.activo }); setEditId(s.id); setError(''); setModal(true); }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (editId) await serviciosService.actualizar(editId, form);
      else await serviciosService.crear(form);
      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Desactivar este servicio?')) return;
    await serviciosService.eliminar(id);
    cargar();
  }

  return (
    <div>
      <PageHeader titulo="Servicios" descripcion="Catálogo de servicios de la clínica"
        accion={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo servicio</button>} />

      {cargando ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Landing</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-ink">{s.nombre}</td>
                  <td className="px-4 py-3">{s.categoria}</td>
                  <td className="px-4 py-3">{peso(s.precio_base)}</td>
                  <td className="px-4 py-3">{s.visible_landing ? '✅' : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost text-xs text-brand-600" onClick={() => abrirEditar(s)}>Editar</button>
                    <button className="btn-ghost text-xs text-red-500" onClick={() => eliminar(s.id)}>Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal abierto={modal} titulo={editId ? 'Editar servicio' : 'Nuevo servicio'} onCerrar={() => setModal(false)}>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nombre *</label>
            <input name="nombre" className="input" value={form.nombre} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select name="categoria" className="input" value={form.categoria} onChange={onChange}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Precio base (COP)</label>
            <input type="number" min="0" name="precio_base" className="input" value={form.precio_base} onChange={onChange} />
          </div>
          <div>
            <label className="label">Duración (min)</label>
            <input type="number" min="5" name="duracion_min" className="input" value={form.duracion_min} onChange={onChange} />
          </div>
          <div>
            <label className="label">Imagen (URL)</label>
            <input name="imagen_url" className="input" value={form.imagen_url} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descripción corta</label>
            <input name="descripcion_corta" className="input" value={form.descripcion_corta} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descripción larga</label>
            <textarea name="descripcion_larga" rows="3" className="input" value={form.descripcion_larga} onChange={onChange} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="visible_landing" checked={form.visible_landing} onChange={onChange} />
            <label className="text-sm text-slate-600">Visible en landing</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} />
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
