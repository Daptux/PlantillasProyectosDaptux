/**
 * frontend/src/pages/admin/PlanesTratamiento.jsx
 * Listado de planes, creación y vista de detalle con presupuesto.
 */
import { useEffect, useState } from 'react';
import { planesService } from '../../services/historiasService';
import { pacientesService } from '../../services/pacientesService';
import { serviciosService } from '../../services/serviciosService';
import { formatoMoneda, colorEstadoPlan } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const ESTADOS = ['PROPUESTO', 'ACEPTADO', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO'];

export default function PlanesTratamiento() {
  const [planes, setPlanes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ paciente_id: '', nombre: '', diagnostico_general: '', descripcion: '', descuento: 0 });
  const [detalle, setDetalle] = useState(null); // plan seleccionado con detalles
  const [nuevoDet, setNuevoDet] = useState({ servicio_id: '', numero_diente: '', descripcion: '', precio: 0, cantidad: 1 });

  async function cargar() { setCargando(true); const r = await planesService.listar(); setPlanes(r.data); setCargando(false); }
  useEffect(() => {
    cargar();
    pacientesService.listar().then((r) => setPacientes(r.data)).catch(() => {});
    serviciosService.listar().then((r) => setServicios(r.data)).catch(() => {});
  }, []);

  async function crear(e) {
    e.preventDefault();
    await planesService.crear(form);
    setModal(false);
    setForm({ paciente_id: '', nombre: '', diagnostico_general: '', descripcion: '', descuento: 0 });
    cargar();
  }

  async function verDetalle(id) { const r = await planesService.obtener(id); setDetalle(r.data); }

  async function agregarDetalle(e) {
    e.preventDefault();
    await planesService.agregarDetalle(detalle.id, nuevoDet);
    setNuevoDet({ servicio_id: '', numero_diente: '', descripcion: '', precio: 0, cantidad: 1 });
    verDetalle(detalle.id);
  }
  async function quitarDetalle(detId) { await planesService.eliminarDetalle(detId); verDetalle(detalle.id); }
  async function cambiarEstadoPlan(estado) { await planesService.actualizar(detalle.id, { estado }); verDetalle(detalle.id); cargar(); }

  if (detalle) {
    return (
      <div>
        <button onClick={() => setDetalle(null)} className="text-sm text-brand-600 hover:underline">← Volver a planes</button>
        <PageHeader titulo={detalle.nombre} descripcion={`Paciente: ${detalle.paciente_nombre}`}>
          <select value={detalle.estado} onChange={(e) => cambiarEstadoPlan(e.target.value)} className={`text-sm font-semibold rounded-lg px-3 py-1.5 ${colorEstadoPlan[detalle.estado]}`}>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </PageHeader>

        {detalle.diagnostico_general && <p className="text-slate-600 mb-4">{detalle.diagnostico_general}</p>}

        <div className="card overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Procedimiento</th><th>Diente</th><th>Precio</th><th>Cant.</th><th>Subtotal</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {detalle.detalles.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-400">Sin procedimientos. Agrega el primero abajo.</td></tr>
              ) : detalle.detalles.map((d) => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{d.servicio_nombre || d.descripcion || '—'}</td>
                  <td>{d.numero_diente || '—'}</td>
                  <td>{formatoMoneda(d.precio)}</td>
                  <td>{d.cantidad}</td>
                  <td className="font-medium">{formatoMoneda(d.subtotal)}</td>
                  <td><span className="badge bg-slate-100 text-slate-600">{d.estado}</span></td>
                  <td className="px-4"><button onClick={() => quitarDetalle(d.id)} className="text-red-600 hover:underline text-xs">Quitar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Presupuesto */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <div className="card p-4"><p className="text-xs text-slate-400">Total</p><p className="text-lg font-bold">{formatoMoneda(detalle.total)}</p></div>
          <div className="card p-4"><p className="text-xs text-slate-400">Descuento</p><p className="text-lg font-bold text-amber-600">{formatoMoneda(detalle.descuento)}</p></div>
          <div className="card p-4"><p className="text-xs text-slate-400">Total final</p><p className="text-lg font-bold text-brand-600">{formatoMoneda(detalle.total_final)}</p></div>
          <div className="card p-4"><p className="text-xs text-slate-400">Saldo pendiente</p><p className="text-lg font-bold text-red-600">{formatoMoneda(detalle.saldo_pendiente)}</p></div>
        </div>

        {/* Agregar procedimiento */}
        <form onSubmit={agregarDetalle} className="card p-5 grid sm:grid-cols-6 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="label">Servicio</label>
            <select className="input" value={nuevoDet.servicio_id} onChange={(e) => {
              const s = servicios.find((x) => String(x.id) === e.target.value);
              setNuevoDet({ ...nuevoDet, servicio_id: e.target.value, precio: s ? s.precio_base : nuevoDet.precio });
            }}>
              <option value="">Personalizado</option>
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div><label className="label">Diente</label><input className="input" value={nuevoDet.numero_diente} onChange={(e) => setNuevoDet({ ...nuevoDet, numero_diente: e.target.value })} /></div>
          <div><label className="label">Precio</label><input type="number" className="input" value={nuevoDet.precio} onChange={(e) => setNuevoDet({ ...nuevoDet, precio: e.target.value })} /></div>
          <div><label className="label">Cant.</label><input type="number" className="input" value={nuevoDet.cantidad} onChange={(e) => setNuevoDet({ ...nuevoDet, cantidad: e.target.value })} /></div>
          <button className="btn-primary">+ Agregar</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <PageHeader titulo="Planes de tratamiento" descripcion="Presupuestos y planes por paciente.">
        <button onClick={() => setModal(true)} className="btn-primary btn-sm">+ Nuevo plan</button>
      </PageHeader>

      <div className="card overflow-hidden">
        {cargando ? <Loader /> : planes.length === 0 ? <EmptyState mensaje="No hay planes." icono="🗂️" /> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Plan</th><th>Paciente</th><th>Total final</th><th>Estado</th><th className="px-4"></th></tr></thead>
            <tbody>
              {planes.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.nombre}</td>
                  <td>{p.paciente_nombre}</td>
                  <td>{formatoMoneda(p.total_final)}</td>
                  <td><span className={`badge ${colorEstadoPlan[p.estado]}`}>{p.estado}</span></td>
                  <td className="px-4"><button onClick={() => verDetalle(p.id)} className="text-brand-600 hover:underline">Ver / editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal abierto={modal} titulo="Nuevo plan de tratamiento" onClose={() => setModal(false)}>
        <form onSubmit={crear} className="space-y-4">
          <div>
            <label className="label">Paciente *</label>
            <select className="input" value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: e.target.value })} required>
              <option value="">Selecciona</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
            </select>
          </div>
          <div><label className="label">Nombre del plan *</label><input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
          <div><label className="label">Diagnóstico general</label><textarea className="input" rows="2" value={form.diagnostico_general} onChange={(e) => setForm({ ...form, diagnostico_general: e.target.value })} /></div>
          <div><label className="label">Descuento</label><input type="number" className="input" value={form.descuento} onChange={(e) => setForm({ ...form, descuento: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">Crear plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
