import { useEffect, useState } from 'react';
import { listarOpiniones, crearOpinion } from '../services/opinionesService';
import { getError, formatFecha } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function Estrellas({ valor, onChange }) {
  return (
    <div className="stars-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={n <= valor ? 'on' : ''} onClick={() => onChange(n)} aria-label={`${n} estrellas`}>★</button>
      ))}
    </div>
  );
}

export default function Opiniones() {
  const toast = useToast();
  const [opiniones, setOpiniones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    setCargando(true);
    listarOpiniones()
      .then(setOpiniones)
      .catch((e) => toast.error(getError(e)))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const enviar = async (e) => {
    e.preventDefault();
    if (comentario.trim().length < 5) { toast.error('Escribe al menos 5 caracteres'); return; }
    setEnviando(true);
    try {
      await crearOpinion({ calificacion, comentario });
      toast.success('¡Gracias por tu opinión!');
      setComentario('');
      setCalificacion(5);
      cargar();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div className="page-header"><h2>Opiniones</h2></div>

      <div className="card" style={{ maxWidth: 640, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, color: 'var(--navy-800)' }}>Comparte tu experiencia</h3>
        <form onSubmit={enviar}>
          <div className="form-group">
            <label>Tu calificación</label>
            <Estrellas valor={calificacion} onChange={setCalificacion} />
          </div>
          <div className="form-group">
            <label>Tu opinión</label>
            <textarea className="input" rows="3" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Cuéntanos cómo fue tu estadía en Hotel Paraíso..." required />
          </div>
          <button className="btn btn-gold" disabled={enviando}>{enviando ? 'Enviando...' : 'Publicar opinión'}</button>
        </form>
      </div>

      <div className="panel-section"><h3>Opiniones recientes</h3></div>
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
  );
}
