/**
 * frontend/src/pages/admin/Pagos.jsx
 * Registro de pagos/abonos y consulta de historial.
 */
import { useEffect, useState } from 'react';
import { pagosService } from '../../services/pagosService';
import { pacientesService } from '../../services/pacientesService';
import { planesService } from '../../services/historiasService';
import { formatoMoneda, formatoFechaHora } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'NEQUI', 'DAVIPLATA', 'OTRO'];

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ paciente_id: '', plan_id: '', monto: '', metodo: 'EFECTIVO', concepto: '', observaciones: '' });
  const [error, setError] = useState('');

  async function cargar() { setCargando(true); const r = await pagosService.listar(); setPagos(r.data); setCargando(false); }
  useEffect(() => { cargar(); pacientesService.listar().then((r) => setPacientes(r.data)).catch(() => {}); }, []);

  async function onPaciente(id) {
    setForm({ ...form, paciente_id: id, plan_id: '' });
    if (id) { const r = await planesService.listar({ paciente_id: id }); setPlanes(r.data); }
    else setPlanes([]);
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      await pagosService.crear(form);
      setModal(false);
      setForm({ paciente_id: '', plan_id: '', monto: '', metodo: 'EFECTIVO', concepto: '', observaciones: '' });
      cargar();
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al registrar el pago.'); }
  }

  return (
    <div>
      <PageHeader titulo="Pagos" descripcion="Abonos, pagos y saldos.">
        <button onClick={() => setModal(true)} className="btn-primary btn-sm">+ Registrar pago</button>
      </PageHeader>

      <div className="card overflow-hidden">
        {cargando ? <Loader /> : pagos.length === 0 ? <EmptyState mensaje="No hay pagos." icono="💳" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th>Paciente</th><th>Monto</th><th>Método</th><th>Concepto</th><th>Registró</th></tr></thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">{formatoFechaHora(p.fecha)}</td>
                    <td>{p.paciente_nombre}</td>
                    <td className="font-medium text-green-600">{formatoMoneda(p.monto)}</td>
                    <td><span className="badge bg-slate-100 text-slate-600">{p.metodo}</span></td>
                    <td>{p.concepto || '—'}</td>
                    <td className="text-slate-400">{p.registrado_por_nombre || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal abierto={modal} titulo="Registrar pago" onClose={() => setModal(false)}>
        <form onSubmit={guardar} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <div>
            <label className="label">Paciente *</label>
            <select className="input" value={form.paciente_id} onChange={(e) => onPaciente(e.target.value)} required>
              <option value="">Selecciona</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Plan de tratamiento (opcional)</label>
            <select className="input" value={form.plan_id} onChange={(e) => setForm({ ...form, plan_id: e.target.value })}>
              <option value="">Sin asociar</option>
              {planes.map((p) => <option key={p.id} value={p.id}>{p.nombre} — {formatoMoneda(p.total_final)}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Monto *</label><input type="number" className="input" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} required /></div>
            <div><label className="label">Método</label><select className="input" value={form.metodo} onChange={(e) => setForm({ ...form, metodo: e.target.value })}>{METODOS.map((m) => <option key={m}>{m}</option>)}</select></div>
          </div>
          <div><label className="label">Concepto</label><input className="input" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
