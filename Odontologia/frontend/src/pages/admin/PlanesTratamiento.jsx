// frontend/src/pages/admin/PlanesTratamiento.jsx
// Planes de tratamiento: lista, creación y detalle con procedimientos (presupuesto).

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import EstadoBadge from '../../components/common/EstadoBadge';
import { planesService } from '../../services/historiasService';
import { pacientesService } from '../../services/pacientesService';
import { serviciosService } from '../../services/serviciosService';

const ESTADOS = ['PROPUESTO', 'ACEPTADO', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO'];
const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function PlanesTratamiento() {
  const [planes, setPlanes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [detalle, setDetalle] = useState(null); // plan seleccionado con su detalle
  const [form, setForm] = useState({ paciente_id: '', nombre: '', diagnostico_general: '', descripcion: '', descuento: 0 });
  const [linea, setLinea] = useState({ servicio_id: '', numero_diente: '', descripcion: '', precio: 0, cantidad: 1 });
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await planesService.listar();
      setPlanes(data.datos || []);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    cargar();
    pacientesService.listar().then(({ data }) => setPacientes(data.datos || [])).catch(() => {});
    serviciosService.listar({ activo: true }).then(({ data }) => setServicios(data.datos || [])).catch(() => {});
  }, []);

  async function crearPlan(e) {
    e.preventDefault();
    setError('');
    try {
      await planesService.crear(form);
      setModalNuevo(false);
      setForm({ paciente_id: '', nombre: '', diagnostico_general: '', descripcion: '', descuento: 0 });
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear el plan.');
    }
  }

  async function abrirDetalle(id) {
    const { data } = await planesService.obtener(id);
    setDetalle(data.datos);
  }

  async function agregarLinea(e) {
    e.preventDefault();
    setError('');
    try {
      await planesService.agregarDetalle(detalle.id, { ...linea, servicio_id: linea.servicio_id || null, numero_diente: linea.numero_diente || null });
      setLinea({ servicio_id: '', numero_diente: '', descripcion: '', precio: 0, cantidad: 1 });
      abrirDetalle(detalle.id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo agregar el procedimiento.');
    }
  }

  async function cambiarEstadoPlan(estado) {
    await planesService.actualizar(detalle.id, { estado });
    abrirDetalle(detalle.id);
    cargar();
  }

  return (
    <div>
      <PageHeader titulo="Planes de tratamiento" descripcion="Presupuestos y seguimiento de tratamientos"
        accion={<button className="btn-primary" onClick={() => { setError(''); setModalNuevo(true); }}>+ Nuevo plan</button>} />

      {cargando ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-ink">{p.nombre}</td>
                  <td className="px-4 py-3">{p.paciente_nombre}</td>
                  <td className="px-4 py-3 font-semibold">{peso(p.total_final)}</td>
                  <td className="px-4 py-3"><EstadoBadge estado={p.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost text-xs text-brand-600" onClick={() => abrirDetalle(p.id)}>Ver presupuesto</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo plan */}
      <Modal abierto={modalNuevo} titulo="Nuevo plan de tratamiento" onCerrar={() => setModalNuevo(false)} ancho="max-w-lg">
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={crearPlan} className="space-y-4">
          <div>
            <label className="label">Paciente *</label>
            <select className="input" value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: e.target.value })} required>
              <option value="">Selecciona…</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Nombre del plan *</label>
            <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label className="label">Diagnóstico general</label>
            <textarea rows="2" className="input" value={form.diagnostico_general} onChange={(e) => setForm({ ...form, diagnostico_general: e.target.value })} />
          </div>
          <div>
            <label className="label">Descuento (COP)</label>
            <input type="number" min="0" className="input" value={form.descuento} onChange={(e) => setForm({ ...form, descuento: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModalNuevo(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Crear plan</button>
          </div>
        </form>
      </Modal>

      {/* Modal detalle / presupuesto */}
      <Modal abierto={!!detalle} titulo={detalle ? `Presupuesto: ${detalle.nombre}` : ''} onCerrar={() => setDetalle(null)}>
        {detalle && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{detalle.paciente_nombre}</p>
                <EstadoBadge estado={detalle.estado} />
              </div>
              <select className="input max-w-[180px]" value={detalle.estado} onChange={(e) => cambiarEstadoPlan(e.target.value)}>
                {ESTADOS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Procedimiento</th>
                    <th className="px-3 py-2">Diente</th>
                    <th className="px-3 py-2">Cant.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.detalle || []).map((d) => (
                    <tr key={d.id} className="border-t border-slate-50">
                      <td className="px-3 py-2">{d.servicio_nombre || d.descripcion}</td>
                      <td className="px-3 py-2">{d.numero_diente || '—'}</td>
                      <td className="px-3 py-2">{d.cantidad}</td>
                      <td className="px-3 py-2 text-right">{peso(d.subtotal)}</td>
                    </tr>
                  ))}
                  {(detalle.detalle || []).length === 0 && (
                    <tr><td colSpan="4" className="px-3 py-4 text-center text-slate-400">Sin procedimientos.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-6 text-sm">
              <span className="text-slate-500">Total: <b className="text-ink">{peso(detalle.total)}</b></span>
              <span className="text-slate-500">Descuento: <b className="text-red-500">-{peso(detalle.descuento)}</b></span>
              <span className="text-slate-500">Total final: <b className="text-green-600">{peso(detalle.total_final)}</b></span>
            </div>

            {/* Agregar procedimiento */}
            <form onSubmit={agregarLinea} className="rounded-xl bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-ink">Agregar procedimiento</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <select className="input" value={linea.servicio_id}
                  onChange={(e) => {
                    const s = servicios.find((x) => String(x.id) === e.target.value);
                    setLinea({ ...linea, servicio_id: e.target.value, precio: s ? s.precio_base : linea.precio });
                  }}>
                  <option value="">Servicio…</option>
                  {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                <input className="input" placeholder="Diente" value={linea.numero_diente} onChange={(e) => setLinea({ ...linea, numero_diente: e.target.value })} />
                <input type="number" className="input" placeholder="Precio" value={linea.precio} onChange={(e) => setLinea({ ...linea, precio: e.target.value })} />
                <input type="number" min="1" className="input" placeholder="Cant." value={linea.cantidad} onChange={(e) => setLinea({ ...linea, cantidad: e.target.value })} />
                <button type="submit" className="btn-primary">Agregar</button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
