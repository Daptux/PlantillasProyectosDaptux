import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { formatMoney, formatFecha } from '../utils/helpers';
import '../styles/confirmacion.css';

export default function ReservaConfirmada() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Sin datos de reserva (acceso directo / refresh) -> a Mis reservas
  if (!state || !state.id_reserva) return <Navigate to="/mis-reservas" replace />;

  const codigo = 'HP-' + String(state.id_reserva).padStart(5, '0');

  return (
    <div className="conf-wrap">
      <div className="conf-card">
        <div className="conf-check">
          <svg viewBox="0 0 52 52"><path d="M14 27 l8 8 l16 -18" /></svg>
        </div>

        <h1>¡Reserva confirmada!</h1>
        <p className="conf-sub">Tu reserva ha sido registrada correctamente. Te esperamos. 🏨</p>

        {state.pago === 'APROBADO' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#dcfce7', color: '#166534', fontWeight: 700,
            padding: '6px 14px', borderRadius: 999, fontSize: 14, margin: '0 0 4px'
          }}>
            ✓ Pago aprobado
          </div>
        )}

        <div className="conf-code">
          <div className="lbl">Código de reserva</div>
          <div className="val">{codigo}</div>
        </div>

        <div className="conf-summary">
          <div className="row"><span className="k">Habitación</span><span className="v">{state.numero} · {state.tipo}</span></div>
          <div className="row"><span className="k">Entrada</span><span className="v">{formatFecha(state.fecha_entrada)}</span></div>
          <div className="row"><span className="k">Salida</span><span className="v">{formatFecha(state.fecha_salida)}</span></div>
          <div className="row"><span className="k">Noches</span><span className="v">{state.noches}</span></div>
          <div className="row total"><span className="k">Total</span><span className="v">{formatMoney(state.total)}</span></div>
        </div>

        <div className="conf-actions">
          <button className="btn btn-light" onClick={() => navigate('/')}>Volver al inicio</button>
          <button className="btn btn-primary" onClick={() => navigate('/mis-reservas')}>Ver mis reservas</button>
        </div>
      </div>
    </div>
  );
}
