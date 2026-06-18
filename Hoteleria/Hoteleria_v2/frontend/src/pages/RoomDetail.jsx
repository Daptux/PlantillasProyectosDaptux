import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { useAuth } from '../context/AuthContext';
import { obtenerHabitacionPublica, verificarDisponibilidad, fechasOcupadas } from '../services/habitacionesService';
import { crearReserva } from '../services/reservasService';
import { formatMoney, formatFecha, getError } from '../utils/helpers';
import { imgHab } from '../utils/roomImages';
import PublicNavbar from '../components/PublicNavbar';
import Alert from '../components/Alert';
import '../styles/landing.css';
import '../styles/roomdetail.css';

const AMENIDADES = ['📶 WiFi gratis', '❄️ Aire acondicionado', '🛁 Baño privado', '📺 TV pantalla plana', '🧴 Artículos de aseo', '🛎️ Servicio a la habitación'];

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const parseYMD = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const hoyLocal = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();

  const [hab, setHab] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [reservando, setReservando] = useState(false);

  const [ocupadas, setOcupadas] = useState([]);
  const [range, setRange] = useState(undefined);
  const [fechas, setFechas] = useState({ fecha_entrada: '', fecha_salida: '' });
  const [dispo, setDispo] = useState(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    setCargando(true);
    obtenerHabitacionPublica(id)
      .then(setHab)
      .catch((e) => setError(getError(e)))
      .finally(() => setCargando(false));
    fechasOcupadas(id).then(setOcupadas).catch(() => setOcupadas([]));
  }, [id]);

  const rangosOcupados = useMemo(
    () => ocupadas.map((o) => ({ from: parseYMD(o.fecha_entrada), to: addDays(parseYMD(o.fecha_salida), -1) })),
    [ocupadas]
  );
  const diasDeshabilitados = useMemo(() => [{ before: hoyLocal() }, ...rangosOcupados], [rangosOcupados]);

  const { noches, total } = useMemo(() => {
    if (!hab || !fechas.fecha_entrada || !fechas.fecha_salida) return { noches: 0, total: 0 };
    const n = Math.round((parseYMD(fechas.fecha_salida) - parseYMD(fechas.fecha_entrada)) / 86400000);
    if (n <= 0) return { noches: 0, total: 0 };
    return { noches: n, total: n * Number(hab.precio_noche) };
  }, [hab, fechas]);

  useEffect(() => {
    if (!hab || noches <= 0) { setDispo(null); return; }
    let cancelado = false;
    setVerificando(true);
    verificarDisponibilidad(hab.id_habitacion, fechas.fecha_entrada, fechas.fecha_salida)
      .then((r) => { if (!cancelado) setDispo(r.disponible); })
      .catch(() => { if (!cancelado) setDispo(null); })
      .finally(() => { if (!cancelado) setVerificando(false); });
    return () => { cancelado = true; };
  }, [hab, fechas.fecha_entrada, fechas.fecha_salida, noches]);

  const onSelectRange = (r) => {
    setRange(r);
    if (r?.from && r?.to) setFechas({ fecha_entrada: toYMD(r.from), fecha_salida: toYMD(r.to) });
    else if (r?.from) setFechas({ fecha_entrada: toYMD(r.from), fecha_salida: '' });
    else setFechas({ fecha_entrada: '', fecha_salida: '' });
  };

  const esCliente = usuario && usuario.rol === 'CLIENTE';
  const activa = hab && hab.estado !== 'INACTIVA';

  const reservar = async (e) => {
    e.preventDefault();
    setError('');

    if (noches <= 0) { setError('Selecciona tus fechas en el calendario (entrada y salida).'); return; }
    if (dispo === false) { setError('La habitación no está disponible en esas fechas. Elige otras.'); return; }

    if (!usuario) {
      localStorage.setItem('reservaPendiente', JSON.stringify({
        id_habitacion: hab.id_habitacion,
        fecha_entrada: fechas.fecha_entrada,
        fecha_salida: fechas.fecha_salida
      }));
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!esCliente) { setError('Las reservas desde aquí son para clientes. El personal reserva desde el panel.'); return; }

    setReservando(true);
    try {
      const res = await crearReserva({
        id_habitacion: hab.id_habitacion,
        fecha_entrada: fechas.fecha_entrada,
        fecha_salida: fechas.fecha_salida
      });
      const r = res.reserva || {};
      navigate('/reserva-confirmada', {
        state: {
          id_reserva: r.id_reserva,
          numero: hab.numero,
          tipo: hab.tipo,
          fecha_entrada: fechas.fecha_entrada,
          fecha_salida: fechas.fecha_salida,
          noches: r.noches ?? noches,
          total: r.total ?? total
        }
      });
    } catch (err) {
      setError(getError(err));
      setReservando(false);
    }
  };

  return (
    <div className="landing">
      <PublicNavbar />

      <div className="rd-wrap">
        <Link to="/" className="rd-back">← Volver a habitaciones</Link>

        {cargando && <div className="loading"><div className="spinner" />Cargando habitación...</div>}
        {!cargando && error && !hab && <Alert error={error} />}

        {hab && (
          <>
            {/* IMAGEN DE LA HABITACIÓN */}
            <div className="rd-main-img" style={{ backgroundImage: `url(${imgHab(hab)})`, marginBottom: 8 }}>
              <span className="ptipo">{hab.tipo}</span>
            </div>

            <div className="rd-grid">
              {/* Información */}
              <div className="rd-info">
                <h1>Habitación {hab.numero}</h1>
                <div className="rd-sub">{hab.tipo} · 👥 Hasta {hab.capacidad} huésped(es)</div>

                <Alert error={error && hab ? error : ''} />

                <div className="rd-trust">
                  <div><span>🔒</span> Pago seguro</div>
                  <div><span>⚡</span> Confirmación inmediata</div>
                  <div><span>🏷️</span> Sin cargos ocultos</div>
                </div>

                <h3>Descripción</h3>
                <p>{hab.descripcion || 'Disfruta de una habitación cómoda y elegante, equipada con todas las comodidades para una estancia perfecta. Ideal para descansar y sentirte como en casa.'}</p>

                <h3>Comodidades</h3>
                <div className="rd-amenities">
                  {AMENIDADES.map((a) => <div key={a}>{a}</div>)}
                </div>

                <div className="rd-policy">
                  <span>✅</span>
                  <div><b>Cancelación flexible.</b> Puedes cancelar tu reserva mientras esté pendiente o confirmada, sin cargos, desde "Mis reservas".</div>
                </div>
              </div>

              {/* Caja de reserva */}
              <aside className="rd-book">
                <div className="rd-price">{formatMoney(hab.precio_noche)} <small>/ noche</small></div>

                {!activa && (
                  <div className="alert alert-error" style={{ marginTop: 14 }}>
                    Esta habitación no está disponible en este momento.
                  </div>
                )}

                {activa && (
                  <form onSubmit={reservar}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', margin: '12px 0 4px', textTransform: 'uppercase' }}>
                      Elige tus fechas
                    </label>

                    <div className="rd-legend">
                      <span><i className="dot dot-sel" /> Seleccionado</span>
                      <span><i className="dot dot-ocupado" /> Ocupado</span>
                    </div>

                    <div className="rd-calendar">
                      <DayPicker
                        mode="range"
                        locale={es}
                        selected={range}
                        onSelect={onSelectRange}
                        disabled={diasDeshabilitados}
                        excludeDisabled
                        modifiers={{ ocupado: rangosOcupados }}
                        modifiersClassNames={{ ocupado: 'day-ocupado' }}
                      />
                    </div>

                    {fechas.fecha_entrada && (
                      <div className="rd-fechas">
                        📅 {formatFecha(fechas.fecha_entrada)} → {fechas.fecha_salida ? formatFecha(fechas.fecha_salida) : '...'}
                      </div>
                    )}

                    {noches > 0 && (
                      <div className="rd-total">
                        {noches} noche(s) × {formatMoney(hab.precio_noche)}<br />
                        Total: <b>{formatMoney(total)}</b>
                      </div>
                    )}

                    {noches > 0 && (
                      <div style={{ margin: '4px 0 2px', fontSize: 13, fontWeight: 600,
                        color: verificando ? '#6b7280' : dispo === false ? 'var(--rojo)' : dispo === true ? 'var(--verde)' : '#6b7280' }}>
                        {verificando ? '⏳ Verificando disponibilidad...'
                          : dispo === true ? '✓ Disponible en esas fechas'
                          : dispo === false ? '✗ No disponible en esas fechas'
                          : ''}
                      </div>
                    )}

                    <button type="submit" className="btn-gold" disabled={reservando || verificando || dispo === false}>
                      {reservando ? 'Reservando...' : 'Reservar'}
                    </button>
                  </form>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
