import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarOpiniones } from '../services/opinionesService';
import { formatFecha } from '../utils/helpers';
import PublicNavbar from '../components/PublicNavbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import '../styles/landing.css';

export default function OpinionesPublicas() {
  const [opiniones, setOpiniones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarOpiniones(50)
      .then(setOpiniones)
      .catch(() => setOpiniones([]))
      .finally(() => setCargando(false));
  }, []);

  const promedio = opiniones.length
    ? (opiniones.reduce((a, o) => a + Number(o.calificacion), 0) / opiniones.length).toFixed(1)
    : 0;

  return (
    <div className="landing">
      <PublicNavbar />

      <div className="rd-wrap" style={{ maxWidth: 1080 }}>
        <Link to="/" className="rd-back">← Volver al inicio</Link>

        <div className="section-title" style={{ marginBottom: 22 }}>
          <div className="tag">Opiniones verificadas</div>
          <h2>Lo que dicen nuestros huéspedes</h2>
          {opiniones.length > 0 && (
            <p>⭐ {promedio} / 5 · {opiniones.length} opiniones de huéspedes de Hotel Paraíso</p>
          )}
        </div>

        {cargando ? <LoadingSpinner /> : (
          opiniones.length === 0 ? (
            <EmptyState icon="💬" title="Aún no hay opiniones" message="Sé el primero en compartir tu experiencia." />
          ) : (
            <div className="op-list">
              {opiniones.map((o) => (
                <div className="op-card" key={o.id_opinion}>
                  <div className="op-stars">{'★'.repeat(o.calificacion)}{'☆'.repeat(5 - o.calificacion)}</div>
                  <p>"{o.comentario}"</p>
                  <div className="op-who">{o.nombre} {o.apellido || ''}<small>{formatFecha(o.fecha)}</small></div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
