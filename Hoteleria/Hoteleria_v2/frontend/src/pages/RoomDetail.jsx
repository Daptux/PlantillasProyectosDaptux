import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { useAuth } from '../context/AuthContext';
import { obtenerHabitacionPublica, verificarDisponibilidad, fechasOcupadas } from '../services/habitacionesService';
import { iniciarCheckout, confirmarPagoWompi } from '../services/pagosService';
import { cargarWidgetWompi, abrirWidgetWompi } from '../utils/wompi';
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Espera la confirmación del pago consultando el backend (que verifica
// contra la API de Wompi). La TARJETA aprueba al instante; los métodos
// asíncronos (Nequi, DaviPlata, PSE, transferencias...) nacen en PENDING
// y se aprueban a los pocos segundos, por eso reconsultamos varias veces.
async function esperarConfirmacion(transaccionId, onPendiente) {
  const INTENTOS = 40;     // ~2 minutos
  const ESPERA_MS = 3000;
  let ultimo = null;
  for (let i = 0; i < INTENTOS; i++) {
    ultimo = await confirmarPagoWompi(transaccionId);
    if (ultimo.estado !== 'PENDIENTE') return ultimo; // APROBADO / RECHAZADO / CONFLICTO
    if (onPendiente) onPendiente(i + 1, INTENTOS);
    await sleep(ESPERA_MS);
  }
  return ultimo || { estado: 'PENDIENTE' };
}

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();

  const [hab, setHab] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [reservando, setReservando] = useState(false);
  const [infoPago, setInfoPago] = useState('');

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

  // Si el cliente venía de "Reservar" sin sesión, al volver logueado
  // retomamos sus fechas para que sólo tenga que completar el pago.
  // (No se crea nada hasta pagar.)
  useEffect(() => {
    if (!hab) return;
    const raw = localStorage.getItem('reservaPendiente');
    if (!raw) return;
    try {
      const pend = JSON.parse(raw);
      if (
        String(pend.id_habitacion) === String(hab.id_habitacion) &&
        pend.fecha_entrada && pend.fecha_salida
      ) {
        setRange({ from: parseYMD(pend.fecha_entrada), to: parseYMD(pend.fecha_salida) });
        setFechas({ fecha_entrada: pend.fecha_entrada, fecha_salida: pend.fecha_salida });
      }
    } catch {
      // ignorar datos corruptos
    }
    localStorage.removeItem('reservaPendiente');
  }, [hab]);

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
      // 1) Crear el intento de pago en el backend (aún NO hay reserva).
      const checkout = await iniciarCheckout({
        id_habitacion: hab.id_habitacion,
        fecha_entrada: fechas.fecha_entrada,
        fecha_salida: fechas.fecha_salida
      });

      // 2) Abrir el widget de Wompi y esperar a que el cliente pague.
      await cargarWidgetWompi();
      const transaccion = await abrirWidgetWompi({
        publicKey: checkout.llavePublica,
        currency: checkout.moneda,
        amountInCents: checkout.montoCentavos,
        reference: checkout.referencia,
        signatureIntegrity: checkout.firmaIntegridad
      });

      // El cliente cerró el widget sin completar el pago.
      if (!transaccion) {
        setError('Pago cancelado. La reserva no se realizó.');
        setReservando(false);
        return;
      }

      // 3) Confirmar el pago. La tarjeta queda aprobada al instante; los
      //    métodos asíncronos (Nequi, PSE, transferencias) quedan en PENDING
      //    y se confirman tras unos segundos -> esperamos con polling.
      //    La reserva sólo se crea cuando el pago queda APROBADO.
      setInfoPago('⏳ Confirmando tu pago...');
      const conf = await esperarConfirmacion(transaccion.id, () =>
        setInfoPago('⏳ Esperando la aprobación de tu pago, no cierres esta ventana...')
      );
      setInfoPago('');

      if (conf.estado === 'APROBADO') {
        navigate('/reserva-confirmada', {
          state: {
            id_reserva: conf.id_reserva,
            numero: hab.numero,
            tipo: hab.tipo,
            fecha_entrada: fechas.fecha_entrada,
            fecha_salida: fechas.fecha_salida,
            noches,
            total,
            pago: 'APROBADO'
          }
        });
      } else if (conf.estado === 'CONFLICTO') {
        setError(conf.mensaje || 'El pago se realizó pero la habitación ya no estaba disponible. Te contactaremos para el reembolso.');
        setReservando(false);
      } else if (conf.estado === 'PENDIENTE') {
        setError('Tu pago quedó en proceso. Si lo apruebas en tu app, la reserva se confirmará automáticamente; revisa "Mis reservas" en unos minutos.');
        setReservando(false);
      } else {
        setError(`El pago no fue aprobado (estado: ${conf.estado_wompi || conf.estado}). No se realizó la reserva. Puedes intentarlo de nuevo.`);
        setReservando(false);
      }
    } catch (err) {
      setInfoPago('');
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
                      {reservando ? 'Procesando pago...' : 'Pagar y reservar'}
                    </button>

                    {infoPago && (
                      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: '#2563eb', textAlign: 'center' }}>
                        {infoPago}
                      </div>
                    )}

                    <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                      🔒 Pago seguro procesado por Wompi
                    </div>
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
