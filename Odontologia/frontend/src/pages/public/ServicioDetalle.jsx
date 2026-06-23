// frontend/src/pages/public/ServicioDetalle.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { serviciosService } from '../../services/serviciosService';
import Loader from '../../components/common/Loader';

const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function ServicioDetalle() {
  const { id } = useParams();
  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    serviciosService.listarPublicos()
      .then(({ data }) => setServicio((data.datos || []).find((s) => String(s.id) === String(id)) || null))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <Loader />;
  if (!servicio) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-slate-500">Servicio no encontrado.</p>
        <Link to="/servicios" className="btn-outline mt-4">Ver todos los servicios</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/servicios" className="text-sm text-brand-600 hover:underline">← Volver a servicios</Link>
      <span className="badge mt-4 bg-slate-100 text-slate-500">{servicio.categoria}</span>
      <h1 className="mt-2 text-3xl font-bold text-ink">{servicio.nombre}</h1>
      {servicio.precio_base > 0 && (
        <p className="mt-2 text-lg font-semibold text-brand-600">Desde {peso(servicio.precio_base)}</p>
      )}
      <p className="mt-6 leading-relaxed text-slate-600">
        {servicio.descripcion_larga || servicio.descripcion_corta}
      </p>
      <p className="mt-4 text-sm text-slate-400">Duración estimada: {servicio.duracion_min} minutos.</p>
      <Link to="/reservar-cita" className="btn-primary mt-8">Agendar este servicio</Link>
    </div>
  );
}
