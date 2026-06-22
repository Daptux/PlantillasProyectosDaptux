/**
 * frontend/src/pages/admin/Citas.jsx
 * Gestión de citas: listado con filtros, alta/edición y cambio de estado.
 */
import { useEffect, useState } from 'react';
import { citasService } from '../../services/citasService';
import { pacientesService } from '../../services/pacientesService';
import { odontologosService } from '../../services/odontologosService';
import { serviciosService } from '../../services/serviciosService';
import { formatoFecha, colorEstadoCita } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const ESTADOS = ['SOLICITADA', 'CONFIRMADA', 'EN_ESPERA', 'EN_ATENCION', 'FINALIZADA', 'CANCELADA', 'NO_ASISTIO', 'REPROGRAMADA'];
const vacio = { paciente_id: '', odontologo_id: '', servicio_id: '', fecha: '', hora_inicio: '', hora_fin: '', motivo: '', observaciones: '', origen: 'PRESENCIAL' };

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({ fecha: '', estado: '' });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [catalogos, setCatalogos] = useState({ pacientes: [], odontologos: [], servicios: [] });
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    const params = {};
    if (filtros.fecha) params.fecha = filtros.fecha;
    if (filtros.estado) params.estado = filtros.estado;
    const r = await citasService.listar(params);
    setCitas(r.data);
    setCargando(false);
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [filtros]);
  useEffect(() => {
    Promise.all([pacientesService.listar(), odontologosService.listar(), serviciosService.listar()])
      .then(([p, o, s]) => setCatalogos({ pacientes: p.data, odontologos: o.data, servicios: s.data }))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function abrirNueva() { setForm(vacio); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(c) {
    setForm({
      paciente_id: c.paciente_id || '', odontologo_id: c.odontologo_id || '', servicio_id: c.servicio_id || '',
      fecha: c.fecha || '', hora_inicio: c.hora_inicio?.slice(0, 5) || '', hora_fin: c.hora_fin?.slice(0, 5) || '',
      motivo: c.motivo || '', observaciones: c.observaciones || '', origen: c.origen || 'PRESENCIAL',
    });
    setEditId(c.id); setError(''); setModal(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) await citasService.actualizar(editId, form);
      else await citasService.crear(form);
      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar la cita.');
    }
  }

  async function cambiarEstado(id, estado) {
    await citasService.cambiarEstado(id, estado);
    cargar();
  }

  return (
    <div>
      <PageHeader titulo="Citas" descripcion="Agenda y gestión de citas.">
        <button onClick={abrirNueva} className="btn-primary btn-sm">+ Nueva cita</button>
      </PageHeader>

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Fecha</label>
          <input type="date" className="input" value={filtros.fecha} onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })} />
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input" value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        {(filtros.fecha || filtros.estado) && (
          <button onClick={() => setFiltros({ fecha: '', estado: '' })} className="btn-ghost btn-sm">Limpiar</button>
        )}
      </div>

      <div className="card overflow-hidden">
        {cargando ? <Loader /> : citas.length === 0 ? <EmptyState mensaje="No hay citas." icono="📅" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th><th>Hora</th><th>Paciente</th><th>Odontólogo</th>
                  <th>Servicio</th><th>Origen</th><th>Estado</th><th className="px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">{formatoFecha(c.fecha)}</td>
                    <td>{c.hora_inicio?.slice(0, 5)}</td>
                    <td>{c.paciente_nombre?.trim() || c.nombre_contacto || '—'}</td>
                    <td>{c.odontologo_nombre || '—'}</td>
                    <td>{c.servicio_nombre || '—'}</td>
                    <td><span className="badge bg-slate-100 text-slate-600">{c.origen}</span></td>
                    <td>
                      <select
                        value={c.estado}
                        onChange={(e) => cambiarEstado(c.id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 ${colorEstadoCita[c.estado] || 'bg-slate-100'}`}
                      >
                        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td className="px-4">
                      <button onClick={() => abrirEditar(c)} className="text-brand-600 hover:underline">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal abierto={modal} titulo={editId ? 'Editar cita' : 'Nueva cita'} onClose={() => setModal(false)}>
        <form onSubmit={guardar} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Paciente</label>
              <select className="input" value={form.paciente_id} onChange={set('paciente_id')}>
                <option value="">Sin asignar</option>
                {catalogos.pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Odontólogo</label>
              <select className="input" value={form.odontologo_id} onChange={set('odontologo_id')}>
                <option value="">Sin asignar</option>
                {catalogos.odontologos.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Servicio</label>
              <select className="input" value={form.servicio_id} onChange={set('servicio_id')}>
                <option value="">Sin asignar</option>
                {catalogos.servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Origen</label>
              <select className="input" value={form.origen} onChange={set('origen')}>
                {['PRESENCIAL', 'WEB', 'WHATSAPP', 'LLAMADA'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="label">Fecha *</label><input type="date" className="input" value={form.fecha} onChange={set('fecha')} required /></div>
            <div><label className="label">Hora inicio *</label><input type="time" className="input" value={form.hora_inicio} onChange={set('hora_inicio')} required /></div>
            <div><label className="label">Hora fin</label><input type="time" className="input" value={form.hora_fin} onChange={set('hora_fin')} /></div>
          </div>
          <div><label className="label">Motivo</label><input className="input" value={form.motivo} onChange={set('motivo')} /></div>
          <div><label className="label">Observaciones</label><textarea className="input" rows="2" value={form.observaciones} onChange={set('observaciones')} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">{editId ? 'Guardar cambios' : 'Crear cita'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
