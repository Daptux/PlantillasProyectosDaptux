import { useEffect, useState } from 'react';
import { obtenerResumen } from '../services/dashboardService';
import { getError, formatMoney, formatFecha } from '../utils/helpers';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerResumen()
      .then(setData)
      .catch((err) => setError(getError(err)))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <LoadingSpinner text="Cargando dashboard..." />;
  if (error) return <Alert error={error} />;
  if (!data) return null;

  const totalHab = Number(data.total_habitaciones) || 0;
  const ocupadas = Number(data.habitaciones_ocupadas) || 0;
  const ocupacion = totalHab > 0 ? Math.round((ocupadas / totalHab) * 100) : 0;

  const cards = [
    { icon: '💰', label: 'Ingresos totales', value: formatMoney(data.ingresos_totales), accent: 'gold' },
    { icon: '✅', label: 'Habitaciones disponibles', value: data.habitaciones_disponibles, accent: 'green' },
    { icon: '🔒', label: 'Habitaciones ocupadas', value: data.habitaciones_ocupadas, accent: 'blue' },
    { icon: '⏳', label: 'Reservas pendientes', value: data.reservas_pendientes, accent: 'amber' },
    { icon: '📌', label: 'Reservas confirmadas', value: data.reservas_confirmadas, accent: 'navy' },
    { icon: '🏨', label: 'Reservas en curso', value: data.reservas_en_curso, accent: 'blue' },
    { icon: '🧑‍🤝‍🧑', label: 'Clientes', value: data.total_clientes, accent: 'navy' },
    { icon: '👔', label: 'Empleados', value: data.total_empleados, accent: 'navy' }
  ];

  return (
    <div>
      <div className="stat-grid">
        {cards.map((c) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} accent={c.accent} />
        ))}
      </div>

      <div className="occ-card">
        <div className="occ-head">
          <h3>Ocupación del hotel</h3>
          <span className="occ-pct">{ocupacion}%</span>
        </div>
        <div className="occ-bar"><i style={{ width: `${ocupacion}%` }} /></div>
        <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          {ocupadas} de {totalHab} habitaciones ocupadas
        </div>
      </div>

      <div className="panel-section"><h3>Últimas reservas</h3></div>
      {(!data.reservas_recientes || data.reservas_recientes.length === 0) ? (
        <EmptyState icon="🗓️" title="Sin reservas todavía" message="Cuando se hagan reservas aparecerán aquí." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Cliente</th><th>Habitación</th><th>Entrada</th><th>Salida</th><th>Total</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.reservas_recientes.map((r) => (
                <tr key={r.id_reserva}>
                  <td>{r.id_reserva}</td>
                  <td>{r.nombre} {r.apellido || ''}</td>
                  <td>{r.numero_habitacion} ({r.tipo_habitacion})</td>
                  <td>{formatFecha(r.fecha_entrada)}</td>
                  <td>{formatFecha(r.fecha_salida)}</td>
                  <td>{formatMoney(r.total)}</td>
                  <td><Badge estado={r.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
