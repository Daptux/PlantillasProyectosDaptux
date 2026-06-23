// frontend/src/pages/admin/Dashboard.jsx
// Resumen de métricas de la clínica.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { dashboardService } from '../../services/contenidoService';

const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

// Clases completas (Tailwind no detecta nombres construidos dinámicamente).
const COLOR_ICONO = {
  brand: 'bg-brand-100',
  amber: 'bg-amber-100',
  teal: 'bg-teal-100',
  indigo: 'bg-indigo-100',
  green: 'bg-green-100',
  red: 'bg-red-100',
  orange: 'bg-orange-100',
  slate: 'bg-slate-200',
};

function Metrica({ titulo, valor, icono, color = 'brand' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{titulo}</p>
          <p className="mt-1 text-2xl font-bold text-ink">{valor}</p>
        </div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${COLOR_ICONO[color] || COLOR_ICONO.brand}`}>
          {icono}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService
      .resumen()
      .then(({ data }) => setDatos(data.datos))
      .catch((e) => setError(e.response?.data?.mensaje || 'Error al cargar el dashboard.'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loader />;
  if (error) return <div className="card p-6 text-red-600">{error}</div>;

  const top = datos.servicios_mas_solicitados || [];

  return (
    <div>
      <PageHeader titulo="Dashboard" descripcion="Resumen general de la clínica" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica titulo="Citas de hoy" valor={datos.citas_hoy} icono="📅" />
        <Metrica titulo="Por confirmar" valor={datos.citas_pendientes_confirmar} icono="⏳" color="amber" />
        <Metrica titulo="Pacientes nuevos (mes)" valor={datos.pacientes_nuevos_mes} icono="🧑‍🦱" color="teal" />
        <Metrica titulo="Tratamientos activos" valor={datos.tratamientos_activos} icono="🗂️" color="indigo" />
        <Metrica titulo="Ingresos de hoy" valor={peso(datos.ingresos_hoy)} icono="💵" color="green" />
        <Metrica titulo="Ingresos del mes" valor={peso(datos.ingresos_mes)} icono="📈" color="green" />
        <Metrica titulo="Pacientes con saldo" valor={datos.pacientes_con_saldo} icono="💳" color="red" />
        <Metrica titulo="Insumos bajos" valor={datos.insumos_bajos} icono="📦" color="orange" />
        <Metrica titulo="Próximos controles (7 días)" valor={datos.proximos_controles} icono="🔔" />
        <Metrica titulo="Canceladas / No asistió (mes)" valor={datos.citas_canceladas_no_asistio} icono="🚫" color="slate" />
      </div>

      <div className="mt-6 card p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Servicios más solicitados</h2>
        {top.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay datos de servicios.</p>
        ) : (
          <ul className="space-y-3">
            {top.map((s, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{s.nombre}</span>
                <span className="badge bg-brand-100 text-brand-700">{s.total} citas</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
