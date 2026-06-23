// frontend/src/pages/admin/Pagos.jsx
// Registro de pagos/abonos y consulta de saldo por paciente.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { pagosService } from '../../services/pagosService';
import { pacientesService } from '../../services/pacientesService';

const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'NEQUI', 'DAVIPLATA', 'OTRO'];
const VACIO = { paciente_id: '', monto: '', metodo: 'EFECTIVO', concepto: '', observaciones: '' };
const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');
  const [saldo, setSaldo] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await pagosService.listar();
      setPagos(data.datos || []);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    cargar();
    pacientesService.listar().then(({ data }) => setPacientes(data.datos || [])).catch(() => {});
  }, []);

  function onChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function verSaldo(pacienteId) {
    setForm((f) => ({ ...f, paciente_id: pacienteId }));
    setSaldo(null);
    if (!pacienteId) return;
    try {
      const { data } = await pagosService.saldo(pacienteId);
      setSaldo(data.datos);
    } catch { /* ignore */ }
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      await pagosService.crear({ ...form, monto: Number(form.monto) });
      setModal(false);
      setForm(VACIO);
      setSaldo(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo registrar el pago.');
    }
  }

  return (
    <div>
      <PageHeader titulo="Pagos" descripcion="Abonos, saldos y movimientos financieros"
        accion={<button className="btn-primary" onClick={() => { setForm(VACIO); setSaldo(null); setError(''); setModal(true); }}>+ Registrar pago</button>} />

      {cargando ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Registró</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">{p.fecha?.slice(0, 16).replace('T', ' ')}</td>
                  <td className="px-4 py-3 font-medium text-ink">{p.paciente_nombre || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{peso(p.monto)}</td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{p.metodo}</span></td>
                  <td className="px-4 py-3">{p.concepto || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{p.registrado_por_nombre || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal abierto={modal} titulo="Registrar pago" onCerrar={() => setModal(false)} ancho="max-w-lg">
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="label">Paciente *</label>
            <select name="paciente_id" className="input" value={form.paciente_id} onChange={(e) => verSaldo(e.target.value)} required>
              <option value="">Selecciona…</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {saldo && (
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
              <div><p className="text-slate-400">Tratamientos</p><p className="font-bold text-ink">{peso(saldo.total_tratamientos)}</p></div>
              <div><p className="text-slate-400">Abonado</p><p className="font-bold text-green-600">{peso(saldo.total_abonado)}</p></div>
              <div><p className="text-slate-400">Saldo</p><p className="font-bold text-red-500">{peso(saldo.saldo_pendiente)}</p></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Monto *</label>
              <input type="number" min="1" name="monto" className="input" value={form.monto} onChange={onChange} required />
            </div>
            <div>
              <label className="label">Método</label>
              <select name="metodo" className="input" value={form.metodo} onChange={onChange}>
                {METODOS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Concepto</label>
            <input name="concepto" className="input" value={form.concepto} onChange={onChange} />
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea name="observaciones" rows="2" className="input" value={form.observaciones} onChange={onChange} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
