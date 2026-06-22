/**
 * frontend/src/pages/admin/Dashboard.jsx
 * Resumen con métricas clave y agenda del día.
 */
import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/contenidoService';
import { formatoMoneda, colorEstadoCita } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';

function Card({ titulo, valor, icono, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`h-12 w-12 grid place-items-center rounded-xl text-2xl ${color}`}>{icono}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800">{valor}</p>
        <p className="text-xs text-slate-500">{titulo}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardService.resumen().then((r) => setData(r.data)).finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loader texto="Cargando dashboard..." />;
  if (!data) return <p className="text-slate-500">No se pudo cargar el resumen.</p>;

  return (
    <div>
      <PageHeader titulo="Dashboard" descripcion="Resumen general de la clínica." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card titulo="Citas hoy" valor={data.citasHoy} icono="📅" color="bg-brand-50" />
        <Card titulo="Por confirmar" valor={data.citasPorConfirmar} icono="⏳" color="bg-amber-50" />
        <Card titulo="Pacientes nuevos (mes)" valor={data.pacientesNuevosMes} icono="🧑‍⚕️" color="bg-teal-50" />
        <Card titulo="Tratamientos activos" valor={data.tratamientosActivos} icono="🗂️" color="bg-indigo-50" />
        <Card titulo="Ingresos hoy" valor={formatoMoneda(data.ingresosHoy)} icono="💵" color="bg-green-50" />
        <Card titulo="Ingresos del mes" valor={formatoMoneda(data.ingresosMes)} icono="📈" color="bg-green-50" />
        <Card titulo="Pacientes con saldo" valor={data.pacientesConSaldo} icono="💳" color="bg-red-50" />
        <Card titulo="Insumos bajos" valor={data.insumosBajos} icono="📦" color="bg-orange-50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agenda del día */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Agenda de hoy</h3>
          {data.agendaHoy.length === 0 ? (
            <p className="text-slate-400 text-sm">No hay citas programadas para hoy.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400 border-b">
                  <tr><th className="py-2">Hora</th><th>Paciente</th><th>Odontólogo</th><th>Servicio</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {data.agendaHoy.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{c.hora_inicio?.slice(0, 5)}</td>
                      <td>{c.paciente?.trim() || '—'}</td>
                      <td>{c.odontologo || '—'}</td>
                      <td>{c.servicio || '—'}</td>
                      <td><span className={`badge ${colorEstadoCita[c.estado] || 'bg-slate-100'}`}>{c.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Servicios top */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Servicios más solicitados</h3>
          {data.serviciosTop.length === 0 ? (
            <p className="text-slate-400 text-sm">Sin datos aún.</p>
          ) : (
            <ul className="space-y-3">
              {data.serviciosTop.map((s, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{s.nombre}</span>
                  <span className="badge bg-brand-100 text-brand-700">{s.total}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 pt-4 border-t text-sm text-slate-500 space-y-2">
            <div className="flex justify-between"><span>Próximos controles</span><strong>{data.proximosControles}</strong></div>
            <div className="flex justify-between"><span>Citas canceladas/no asistió (mes)</span><strong>{data.citasCanceladasMes}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
