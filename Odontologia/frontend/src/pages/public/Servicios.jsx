// frontend/src/pages/public/Servicios.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviciosService } from '../../services/serviciosService';
import Loader from '../../components/common/Loader';

const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    serviciosService.listarPublicos()
      .then(({ data }) => setServicios(data.datos || []))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-ink">Servicios odontológicos</h1>
        <p className="mt-2 text-slate-500">Tratamientos integrales para toda la familia.</p>
      </div>
      {cargando ? (
        <Loader />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <div key={s.id} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-2xl">🦷</div>
              <span className="badge bg-slate-100 text-slate-500">{s.categoria}</span>
              <h3 className="mt-2 text-lg font-bold text-ink">{s.nombre}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.descripcion_corta}</p>
              {s.precio_base > 0 && <p className="mt-3 text-sm font-semibold text-brand-600">Desde {peso(s.precio_base)}</p>}
              <div className="mt-4 flex gap-2">
                <Link to={`/servicios/${s.id}`} className="btn-outline text-xs">Ver más</Link>
                <Link to="/reservar-cita" className="btn-primary text-xs">Agendar</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
