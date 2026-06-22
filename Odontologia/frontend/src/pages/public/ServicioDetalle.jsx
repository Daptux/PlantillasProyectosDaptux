/**
 * frontend/src/pages/public/ServicioDetalle.jsx
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { serviciosService } from '../../services/serviciosService';
import { formatoMoneda } from '../../utils/format';
import Loader from '../../components/common/Loader';

export default function ServicioDetalle() {
  const { id } = useParams();
  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    serviciosService.obtener(id).then((r) => setServicio(r.data)).catch(() => setServicio(null)).finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <Loader />;
  if (!servicio) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-slate-500">Servicio no encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link to="/servicios" className="text-sm text-brand-600 hover:underline">← Volver a servicios</Link>
      <div className="grid md:grid-cols-2 gap-8 mt-6 items-start">
        <img
          src={servicio.imagen_url || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=700&q=80'}
          alt={servicio.nombre}
          className="rounded-2xl shadow-soft object-cover w-full h-72"
        />
        <div>
          <span className="badge bg-teal-100 text-teal-700 mb-3">{servicio.categoria}</span>
          <h1 className="text-3xl font-extrabold text-slate-800">{servicio.nombre}</h1>
          {servicio.precio_base > 0 && <p className="text-brand-600 font-bold text-xl mt-3">Desde {formatoMoneda(servicio.precio_base)}</p>}
          <p className="text-slate-600 mt-4">{servicio.descripcion_larga || servicio.descripcion_corta}</p>
          <p className="text-sm text-slate-400 mt-3">Duración estimada: {servicio.duracion_min} min</p>
          <Link to="/reservar-cita" className="btn-primary mt-6">Agendar este servicio</Link>
        </div>
      </div>
    </div>
  );
}
