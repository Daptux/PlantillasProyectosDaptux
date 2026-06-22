/**
 * frontend/src/pages/admin/Reportes.jsx
 * Reportes básicos y seguimiento de pacientes.
 */
import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/contenidoService';
import { formatoMoneda } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';

function Barra({ label, valor, max }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{label}</span><span className="font-medium">{valor}</span></div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function Reportes() {
  const [rep, setRep] = useState(null);
  const [seg, setSeg] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([dashboardService.reportes(), dashboardService.seguimiento()])
      .then(([r, s]) => { setRep(r.data); setSeg(s.data); })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loader />;

  const maxEstado = Math.max(1, ...(rep?.citasPorEstado || []).map((c) => c.total));
  const maxMes = Math.max(1, ...(rep?.ingresosPorMes || []).map((m) => Number(m.total)));

  return (
    <div>
      <PageHeader titulo="Reportes" descripcion="Indicadores de la clínica y seguimiento." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Citas por estado</h3>
          <div className="space-y-3">
            {(rep?.citasPorEstado || []).map((c) => <Barra key={c.estado} label={c.estado} valor={c.total} max={maxEstado} />)}
            {(!rep?.citasPorEstado || rep.citasPorEstado.length === 0) && <p className="text-slate-400 text-sm">Sin datos.</p>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Ingresos por mes</h3>
          <div className="space-y-3">
            {(rep?.ingresosPorMes || []).map((m) => (
              <div key={m.mes}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{m.mes}</span><span className="font-medium">{formatoMoneda(m.total)}</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500" style={{ width: `${Math.round((Number(m.total) / maxMes) * 100)}%` }} /></div>
              </div>
            ))}
            {(!rep?.ingresosPorMes || rep.ingresosPorMes.length === 0) && <p className="text-slate-400 text-sm">Sin datos.</p>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Ingresos por servicio</h3>
          <ul className="space-y-2 text-sm">
            {(rep?.ingresosPorServicio || []).map((s, i) => (
              <li key={i} className="flex justify-between"><span className="text-slate-600">{s.nombre}</span><span className="font-medium">{formatoMoneda(s.total)}</span></li>
            ))}
            {(!rep?.ingresosPorServicio || rep.ingresosPorServicio.length === 0) && <p className="text-slate-400">Sin datos.</p>}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Ingresos por odontólogo</h3>
          <ul className="space-y-2 text-sm">
            {(rep?.ingresosPorOdontologo || []).map((o, i) => (
              <li key={i} className="flex justify-between"><span className="text-slate-600">{o.nombre}</span><span className="font-medium">{formatoMoneda(o.total)}</span></li>
            ))}
            {(!rep?.ingresosPorOdontologo || rep.ingresosPorOdontologo.length === 0) && <p className="text-slate-400">Sin datos.</p>}
          </ul>
        </div>
      </div>

      {/* Seguimiento */}
      <h2 className="text-xl font-bold text-slate-800 mt-10 mb-4">Seguimiento de pacientes</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-3">Saldos pendientes</h3>
          <ul className="space-y-2 text-sm">
            {(seg?.saldosPendientes || []).map((s, i) => <li key={i} className="flex justify-between"><span>{s.paciente}</span><span className="text-red-600 font-medium">{formatoMoneda(s.saldo)}</span></li>)}
            {(!seg?.saldosPendientes || seg.saldosPendientes.length === 0) && <p className="text-slate-400">Sin saldos pendientes.</p>}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-3">Presupuestos por aceptar</h3>
          <ul className="space-y-2 text-sm">
            {(seg?.presupuestosPendientes || []).map((p) => <li key={p.id} className="flex justify-between"><span>{p.paciente} — {p.nombre}</span><span className="font-medium">{formatoMoneda(p.total_final)}</span></li>)}
            {(!seg?.presupuestosPendientes || seg.presupuestosPendientes.length === 0) && <p className="text-slate-400">Sin presupuestos pendientes.</p>}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-3">Tratamientos incompletos</h3>
          <ul className="space-y-2 text-sm">
            {(seg?.tratamientosIncompletos || []).map((t) => <li key={t.id} className="flex justify-between"><span>{t.paciente} — {t.nombre}</span><span className="badge bg-indigo-100 text-indigo-700">{t.estado}</span></li>)}
            {(!seg?.tratamientosIncompletos || seg.tratamientosIncompletos.length === 0) && <p className="text-slate-400">Sin tratamientos activos.</p>}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-3">Pacientes sin cita próxima</h3>
          <ul className="space-y-2 text-sm">
            {(seg?.sinCitaProxima || []).map((p) => <li key={p.id} className="flex justify-between"><span>{p.paciente}</span><span className="text-slate-400">{p.telefono || ''}</span></li>)}
            {(!seg?.sinCitaProxima || seg.sinCitaProxima.length === 0) && <p className="text-slate-400">Todos tienen cita próxima.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
