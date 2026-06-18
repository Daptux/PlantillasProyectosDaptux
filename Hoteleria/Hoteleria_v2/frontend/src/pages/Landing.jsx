import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarDisponibles } from '../services/habitacionesService';
import { listarOpiniones } from '../services/opinionesService';
import { getError, formatFecha } from '../utils/helpers';
import PublicNavbar from '../components/PublicNavbar';
import SectionTitle from '../components/SectionTitle';
import RoomCard from '../components/RoomCard';
import '../styles/landing.css';
import '../styles/home.css';

const BENEFICIOS = [
  { ico: '🏷️', h: 'Mejor tarifa garantizada', p: 'Si encuentras un precio más bajo, te lo igualamos.' },
  { ico: '🔓', h: 'Sin cargos ocultos', p: 'El precio que ves es el precio que pagas. Transparencia total.' },
  { ico: '⚡', h: 'Confirmación inmediata', p: 'Tu reserva se confirma al instante, sin esperas.' },
  { ico: '🤝', h: 'Atención directa', p: 'Hablas directo con el hotel, sin intermediarios.' },
  { ico: '🛡️', h: 'Reserva segura', p: 'Tus datos viajan cifrados y protegidos.' },
  { ico: '🔄', h: 'Cancelación flexible', p: 'Cancela según la política de tu reserva sin complicaciones.' }
];

const EXPERIENCIAS = [
  { label: '🏊 Piscina', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=70', cls: 'span-2 row-2' },
  { label: '🍽️ Restaurante', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=70' },
  { label: '💆 Spa & Wellness', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=70' },
  { label: '🛏️ Habitaciones', img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=700&q=70' },
  { label: '🍸 Bar & Lounge', img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=700&q=70' },
  { label: '🌇 Zonas de descanso', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=70', cls: 'span-2' }
];

const FAQS = [
  { q: '¿Cómo hago una reserva en Hotel Paraíso?', a: 'En Hotel Paraíso eliges una habitación, seleccionas tus fechas en el calendario y pulsas "Reservar". Si no has iniciado sesión, te lo pediremos y tu reserva se completa automáticamente.' },
  { q: '¿Puedo cancelar mi reserva en Hotel Paraíso?', a: 'Sí. En Hotel Paraíso, desde "Mis reservas" puedes cancelar cualquier reserva pendiente o confirmada sin cargos.' },
  { q: '¿Qué métodos de pago acepta Hotel Paraíso?', a: 'Hotel Paraíso acepta efectivo, tarjeta y transferencia. El pago se gestiona en recepción al confirmar tu estadía.' },
  { q: '¿El desayuno está incluido en Hotel Paraíso?', a: 'Sí, todas las tarifas de Hotel Paraíso incluyen desayuno buffet sin costo adicional.' }
];

const tagFor = (room) => {
  if (room.tipo === 'SUITE') return { kind: 'premium', label: 'Premium' };
  return null;
};

export default function Landing() {
  const navigate = useNavigate();

  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({ tipo: '', huespedes: '', fecha_entrada: '', fecha_salida: '' });
  const [busquedaActiva, setBusquedaActiva] = useState(false);
  const [faqAbierto, setFaqAbierto] = useState(0);
  const [opiniones, setOpiniones] = useState([]);

  const cargar = (params) => {
    setCargando(true);
    listarDisponibles(params)
      .then(setHabitaciones)
      .catch((e) => setError(getError(e)))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    listarOpiniones().then(setOpiniones).catch(() => setOpiniones([]));
  }, []);

  const filtradas = useMemo(() => habitaciones.filter((h) => {
    if (filtros.tipo && h.tipo !== filtros.tipo) return false;
    if (filtros.huespedes && Number(h.capacidad) < Number(filtros.huespedes)) return false;
    return true;
  }), [habitaciones, filtros.tipo, filtros.huespedes]);

  const nochesBusqueda = useMemo(() => {
    if (!busquedaActiva || !filtros.fecha_entrada || !filtros.fecha_salida) return 0;
    const n = Math.round((new Date(filtros.fecha_salida) - new Date(filtros.fecha_entrada)) / 86400000);
    return n > 0 ? n : 0;
  }, [busquedaActiva, filtros.fecha_entrada, filtros.fecha_salida]);

  const verDetalle = (idHab) => navigate(`/habitacion/${idHab}`);
  const scrollA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const onFiltro = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const buscar = (e) => {
    e.preventDefault();
    if (filtros.fecha_entrada && filtros.fecha_salida) {
      if (filtros.fecha_salida <= filtros.fecha_entrada) {
        setError('La fecha de salida debe ser posterior a la de entrada.');
        return;
      }
      setError('');
      setBusquedaActiva(true);
      cargar({
        fecha_entrada: filtros.fecha_entrada,
        fecha_salida: filtros.fecha_salida,
        tipo: filtros.tipo || undefined,
        capacidad: filtros.huespedes || undefined
      });
    }
    scrollA('habitaciones');
  };

  const limpiarBusqueda = () => {
    setFiltros({ tipo: '', huespedes: '', fecha_entrada: '', fecha_salida: '' });
    setBusquedaActiva(false);
    cargar();
  };

  return (
    <div className="landing">
      <PublicNavbar />

      {/* HERO + BUSCADOR */}
      <header className="hero" id="inicio">
        <div className="tag">Bienvenido a Hotel Paraíso</div>
        <h1>Vive una estadía inolvidable</h1>
        <p className="lead">Reserva habitaciones exclusivas de forma rápida, segura y sin cargos ocultos.</p>

        <div className="hero-cta">
          <button className="btn btn-gold" onClick={() => scrollA('habitaciones')}>Ver habitaciones</button>
        </div>

        <form className="search-bar" onSubmit={buscar}>
          <div className="sb-field">
            <label>Llegada</label>
            <input type="date" name="fecha_entrada" value={filtros.fecha_entrada} onChange={onFiltro} />
          </div>
          <div className="sb-field">
            <label>Salida</label>
            <input type="date" name="fecha_salida" value={filtros.fecha_salida} onChange={onFiltro} />
          </div>
          <div className="sb-field">
            <label>Huéspedes</label>
            <select name="huespedes" value={filtros.huespedes} onChange={onFiltro}>
              <option value="">Cualquiera</option>
              <option value="1">1 persona</option>
              <option value="2">2 personas</option>
              <option value="3">3 personas</option>
              <option value="4">4+ personas</option>
            </select>
          </div>
          <div className="sb-field">
            <label>Tipo</label>
            <select name="tipo" value={filtros.tipo} onChange={onFiltro}>
              <option value="">Todos</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="DOBLE">Doble</option>
              <option value="SUITE">Suite</option>
              <option value="FAMILIAR">Familiar</option>
            </select>
          </div>
          <button type="submit" className="btn-gold">🔍 Buscar disponibilidad</button>
        </form>
      </header>

      {/* HABITACIONES DESTACADAS (justo bajo el buscador) */}
      <section className="servicios-bg" id="habitaciones">
        <div className="section-pad">
          <SectionTitle tag="Nuestras habitaciones" title="Encuentra tu espacio ideal" subtitle="Explora nuestras habitaciones disponibles y reserva en segundos." />

          {busquedaActiva && (
            <div className="search-info">
              Disponibilidad para {filtros.fecha_entrada} → {filtros.fecha_salida}
              <span className="clear" onClick={limpiarBusqueda}>✕ limpiar</span>
            </div>
          )}

          <div className="room-filters">
            <select name="tipo" value={filtros.tipo} onChange={onFiltro}>
              <option value="">Todos los tipos</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="DOBLE">Doble</option>
              <option value="SUITE">Suite</option>
              <option value="FAMILIAR">Familiar</option>
            </select>
            <select name="huespedes" value={filtros.huespedes} onChange={onFiltro}>
              <option value="">Cualquier capacidad</option>
              <option value="1">1+ huésped</option>
              <option value="2">2+ huéspedes</option>
              <option value="3">3+ huéspedes</option>
              <option value="4">4+ huéspedes</option>
            </select>
          </div>

          {cargando && <div className="loading"><div className="spinner" />Cargando habitaciones...</div>}
          {error && <div className="alert alert-error" style={{ maxWidth: 520, margin: '0 auto' }}>{error}</div>}

          {!cargando && !error && (
            filtradas.length === 0 ? (
              <div className="empty">
                {busquedaActiva
                  ? 'No hay habitaciones disponibles para esas fechas. Prueba con otras.'
                  : 'No hay habitaciones que coincidan con tu búsqueda.'}
              </div>
            ) : (
              <div className="public-rooms">
                {filtradas.map((h) => (
                  <RoomCard
                    key={h.id_habitacion}
                    room={h}
                    tag={tagFor(h)}
                    noches={nochesBusqueda}
                    onReservar={verDetalle}
                    onDetalle={verDetalle}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="section-pad">
        <SectionTitle tag="Por qué reservar con nosotros" title="La diferencia Hotel Paraíso" subtitle="Razones que hacen de tu estadía algo memorable." />
        <div className="benefits-grid">
          {BENEFICIOS.map((b) => (
            <div className="benefit" key={b.h}>
              <div className="b-ico">{b.ico}</div>
              <h4>{b.h}</h4>
              <p>{b.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCIA */}
      <section className="section-pad" id="servicios">
        <SectionTitle tag="La experiencia" title="Mucho más que una habitación" subtitle="Disfruta de instalaciones pensadas para tu descanso y diversión." />
        <div className="exp-grid">
          {EXPERIENCIAS.map((e) => (
            <div className={`exp-tile ${e.cls || ''}`} key={e.label} style={{ backgroundImage: `url(${e.img})` }}>
              <span className="exp-label">{e.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* OPINIONES REALES */}
      <section className="testi-bg">
        <div className="section-pad">
          <SectionTitle tag="Opiniones" title="Lo que dicen nuestros huéspedes" subtitle="Opiniones reales de quienes se hospedaron en Hotel Paraíso." light />
          {opiniones.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#cbd5e1' }}>
              Aún no hay opiniones. ¡Sé el primero en compartir tu experiencia tras tu estadía!
            </p>
          ) : (
            <>
              <div className="testi-grid">
                {opiniones.slice(0, 6).map((o) => (
                  <div className="testi" key={o.id_opinion}>
                    <div className="stars">{'★'.repeat(o.calificacion)}{'☆'.repeat(5 - o.calificacion)}</div>
                    <p>"{o.comentario}"</p>
                    <div className="who">{o.nombre} {o.apellido || ''}<small>{formatFecha(o.fecha)}</small></div>
                  </div>
                ))}
              </div>
              {opiniones.length > 6 && (
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <button className="btn btn-gold" onClick={() => navigate('/resenas')}>Ver más opiniones</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* NOSOTROS */}
      <section className="section-pad" id="nosotros">
        <SectionTitle tag="Sobre nosotros" title="Más de 20 años de hospitalidad" subtitle="Elegancia, comodidad y un servicio cercano para que te sientas como en casa." />
        <div className="stats">
          <div className="stat"><div className="num">20+</div><div className="lbl">Años de experiencia</div></div>
          <div className="stat"><div className="num">50K+</div><div className="lbl">Huéspedes felices</div></div>
          <div className="stat"><div className="num">4.8★</div><div className="lbl">Calificación promedio</div></div>
          <div className="stat"><div className="num">24/7</div><div className="lbl">Atención al cliente</div></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="servicios-bg" id="faq">
        <div className="section-pad">
          <SectionTitle tag="Dudas frecuentes" title="Preguntas y respuestas" />
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div className="faq-item" key={f.q}>
                <button className={`faq-q ${faqAbierto === i ? 'open' : ''}`} onClick={() => setFaqAbierto(faqAbierto === i ? -1 : i)}>
                  {f.q} <span className="chev">▾</span>
                </button>
                {faqAbierto === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <h2>¿Listo para tu próxima estadía?</h2>
        <p>Explora nuestras habitaciones y reserva con las mejores tarifas garantizadas.</p>
        <button className="btn-gold" onClick={() => scrollA('habitaciones')}>Reservar ahora</button>
      </section>

      {/* FOOTER */}
      <footer className="lfooter" id="contacto">
        <div className="fgrid">
          <div className="fcol-brand">
            <h4 className="fbrand">🏨 Hotel <span>Paraíso</span></h4>
            <p>Tu hogar lejos de casa. Elegancia, confort y un servicio cercano en cada detalle de tu estadía.</p>
            <div className="fsocial">
              <a href="#contacto" onClick={(e) => e.preventDefault()} aria-label="Facebook">f</a>
              <a href="#contacto" onClick={(e) => e.preventDefault()} aria-label="Instagram">◉</a>
              <a href="#contacto" onClick={(e) => e.preventDefault()} aria-label="X">𝕏</a>
              <a href="#contacto" onClick={(e) => e.preventDefault()} aria-label="WhatsApp">✆</a>
            </div>
          </div>
          <div>
            <h4>Explorar</h4>
            <ul>
              <li><a href="#habitaciones" onClick={(e) => { e.preventDefault(); scrollA('habitaciones'); }}>Habitaciones</a></li>
              <li><a href="#servicios" onClick={(e) => { e.preventDefault(); scrollA('servicios'); }}>Experiencia</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollA('faq'); }}>Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div>
            <h4>Cuenta</h4>
            <ul>
              <li><a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Iniciar sesión</a></li>
              <li><a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Crear cuenta</a></li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul className="fcontact">
              <li>📍 Calle 123 #45-67, Ciudad</li>
              <li>📞 +57 300 000 0000</li>
              <li>✉️ reservas@hotelparaiso.com</li>
            </ul>
          </div>
        </div>
        <div className="fbottom">
          <span>© {new Date().getFullYear()} Hotel Paraíso. Todos los derechos reservados.</span>
          <span className="fbadges">🔒 Pago seguro · ⚡ Confirmación inmediata</span>
        </div>
      </footer>
    </div>
  );
}
