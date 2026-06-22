/**
 * frontend/src/pages/admin/ServiciosAdmin.jsx
 */
import { useEffect, useState } from 'react';
import { serviciosService } from '../../services/serviciosService';
import { formatoMoneda } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIAS = ['General', 'Estetica', 'Ortodoncia', 'Cirugia', 'Endodoncia', 'Periodoncia', 'Rehabilitacion', 'Odontopediatria', 'Urgencias'];
const vacio = { nombre: '', categoria: 'General', descripcion_corta: '', descripcion_larga: '', precio_base: 0, duracion_min: 30, imagen_url: '', visible_landing: true, activo: true, orden: 0 };

export default function ServiciosAdmin() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);

  async function cargar() { setCargando(true); const r = await serviciosService.listar(); setLista(r.data); setCargando(false); }
  useEffect(() => { cargar(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  function abrirNuevo() { setForm(vacio); setEditId(null); setModal(true); }
  function abrirEditar(s) { setForm({ ...vacio, ...s, visible_landing: !!s.visible_landing, activo: !!s.activo }); setEditId(s.id); setModal(true); }

  async function guardar(e) {
    e.preventDefault();
    if (editId) await serviciosService.actualizar(editId, form);
    else await serviciosService.crear(form);
    setModal(false); cargar();
  }
  async function eliminar(id) { if (confirm('¿Inactivar servicio?')) { await serviciosService.eliminar(id); cargar(); } }

  return (
    <div>
      <PageHeader titulo="Servicios" descripcion="Catálogo de tratamientos.">
        <button onClick={abrirNuevo} className="btn-primary btn-sm">+ Nuevo servicio</button>
      </PageHeader>

      <div className="card overflow-hidden">
        {cargando ? <Loader /> : lista.length === 0 ? <EmptyState mensaje="No hay servicios." icono="🦷" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Nombre</th><th>Categoría</th><th>Precio</th><th>Web</th><th>Estado</th><th className="px-4">Acciones</th></tr></thead>
              <tbody>
                {lista.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.nombre}</td>
                    <td>{s.categoria}</td>
                    <td>{formatoMoneda(s.precio_base)}</td>
                    <td>{s.visible_landing ? '🌐' : '—'}</td>
                    <td><span className={`badge ${s.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{s.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="px-4 space-x-3 whitespace-nowrap">
                      <button onClick={() => abrirEditar(s)} className="text-brand-600 hover:underline">Editar</button>
                      <button onClick={() => eliminar(s.id)} className="text-red-600 hover:underline">Inactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal abierto={modal} titulo={editId ? 'Editar servicio' : 'Nuevo servicio'} onClose={() => setModal(false)}>
        <form onSubmit={guardar} className="space-y-4">
          <div><label className="label">Nombre *</label><input className="input" value={form.nombre} onChange={set('nombre')} required /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="label">Categoría</label><select className="input" value={form.categoria} onChange={set('categoria')}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Precio base</label><input type="number" className="input" value={form.precio_base} onChange={set('precio_base')} /></div>
            <div><label className="label">Duración (min)</label><input type="number" className="input" value={form.duracion_min} onChange={set('duracion_min')} /></div>
          </div>
          <div><label className="label">Descripción corta</label><input className="input" value={form.descripcion_corta || ''} onChange={set('descripcion_corta')} /></div>
          <div><label className="label">Descripción larga</label><textarea className="input" rows="3" value={form.descripcion_larga || ''} onChange={set('descripcion_larga')} /></div>
          <div><label className="label">Imagen (URL)</label><input className="input" value={form.imagen_url || ''} onChange={set('imagen_url')} /></div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.visible_landing} onChange={set('visible_landing')} /> Visible en web</label>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.activo} onChange={set('activo')} /> Activo</label>
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
