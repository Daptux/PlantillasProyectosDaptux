// frontend/src/pages/admin/Citas.jsx
// Gestión de citas: filtros, creación y cambio de estado.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import EstadoBadge from '../../components/common/EstadoBadge';
import { citasService } from '../../services/citasService';
import { pacientesService } from '../../services/pacientesService';
import { odontologosService } from '../../services/odontologosService';
import { serviciosService } from '../../services/serviciosService';

const ESTADOS = ['SOLICITADA', 'CONFIRMADA', 'EN_ESPERA', 'EN_ATENCION', 'FINALIZADA', 'CANCELADA', 'NO_ASISTIO', 'REPROGRAMADA'];
const VACIO = { paciente_id: '', odontologo_id: '', servicio_id: '', fecha: '', hora_inicio: '', hora_fin: '', motivo: '', estado: 'CONFIRMADA', origen: 'PRESENCIAL' };

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({ fecha: '', estado: '' });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [catalogos, setCatalogos] = useState({ pacientes: [], odontologos: [], servicios: [] });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const params = {};
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.estado) params.estado = filtros.estado;
      const { data } = await citasService.listar(params);
      setCitas(data.datos || []);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [filtros]);

  useEffect(() => {
    Promise.all([
      pacientesService.listar(),
      odontologosService.listar(),
      serviciosService.listar({ activo: true }),
    ]).then(([p, o, s]) => setCatalogos({
      pacientes: p.data.datos || [], odontologos: o.data.datos || [], servicios: s.data.datos || [],
    })).catch(() => {});
  }, []);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const payload = {
        ...form,
        paciente_id: form.paciente_id || null,
        odontologo_id: form.odontologo_id || null,
        servicio_id: form.servicio_id || null,
      };
      await citasService.crear(payload);
      setModal(false);
      setForm(VACIO);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear la cita.');
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(id, estado) {
    await citasService.cambiarEstado(id, estado);
    cargar();
  }

  return (
    <div>
      <PageHeader
        titulo="Citas"
        descripcion="Agenda y gestión de citas"
        accion={<button className="btn-primary" onClick={() => { setForm(VACIO); setError(''); setModal(true); }}>+ Nueva cita</button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input type="date" className="input max-w-xs" value={filtros.fecha} onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })} />
        <select className="input max-w-xs" value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        {(filtros.fecha || filtros.estado) && (
          <button className="btn-ghost" onClick={() => setFiltros({ fecha: '', estado: '' })}>Limpiar</button>
        )}
      </div>

      {cargando ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha / Hora</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Odontólogo</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Cambiar estado</th>
              </tr>
            </thead>
            <tbody>
              {citas.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">Sin citas.</td></tr>
              ) : citas.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">{c.fecha} <span className="text-slate-400">{c.hora_inicio?.slice(0, 5)}</span></td>
                  <td className="px-4 py-3 font-medium text-ink">{c.paciente_nombre || c.nombre_contacto || '—'}</td>
                  <td className="px-4 py-3">{c.odontologo_nombre || '—'}</td>
                  <td className="px-4 py-3">{c.servicio_nombre || '—'}</td>
                  <td className="px-4 py-3"><EstadoBadge estado={c.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <select
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      value={c.estado}
                      onChange={(e) => cambiarEstado(c.id, e.target.value)}
                    >
                      {ESTADOS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal abierto={modal} titulo="Nueva cita" onCerrar={() => setModal(false)}>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Paciente</label>
            <select name="paciente_id" className="input" value={form.paciente_id} onChange={onChange}>
              <option value="">Selecciona…</option>
              {catalogos.pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Odontólogo</label>
            <select name="odontologo_id" className="input" value={form.odontologo_id} onChange={onChange}>
              <option value="">Selecciona…</option>
              {catalogos.odontologos.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Servicio</label>
            <select name="servicio_id" className="input" value={form.servicio_id} onChange={onChange}>
              <option value="">Selecciona…</option>
              {catalogos.servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Origen</label>
            <select name="origen" className="input" value={form.origen} onChange={onChange}>
              {['PRESENCIAL', 'WEB', 'WHATSAPP', 'LLAMADA'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fecha *</label>
            <input type="date" name="fecha" className="input" value={form.fecha} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Hora inicio *</label>
            <input type="time" name="hora_inicio" className="input" value={form.hora_inicio} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Hora fin</label>
            <input type="time" name="hora_fin" className="input" value={form.hora_fin} onChange={onChange} />
          </div>
          <div>
            <label className="label">Estado</label>
            <select name="estado" className="input" value={form.estado} onChange={onChange}>
              {ESTADOS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Motivo</label>
            <input name="motivo" className="input" value={form.motivo} onChange={onChange} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Crear cita'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
