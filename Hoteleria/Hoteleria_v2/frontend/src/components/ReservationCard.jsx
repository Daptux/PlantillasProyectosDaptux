import Badge from './Badge';
import { formatMoney, formatFecha } from '../utils/helpers';
import { imgHab } from '../utils/roomImages';

// Tarjeta de reserva reutilizable (vista cliente)
// props: reserva { id_reserva, numero, tipo, fecha_entrada, fecha_salida, total, estado }, onCancelar(id)
export default function ReservationCard({ reserva, onCancelar }) {
  const cancelable = reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA';

  return (
    <div className="res-card">
      <div className="rc-img" style={{ backgroundImage: `url(${imgHab(reserva)})` }}>
        <div className="rc-badge"><Badge estado={reserva.estado} /></div>
      </div>
      <div className="rc-body">
        <div className="rc-title">Habitación {reserva.numero} · {reserva.tipo}</div>
        <div className="rc-row"><span>📅 Entrada</span><b>{formatFecha(reserva.fecha_entrada)}</b></div>
        <div className="rc-row"><span>📅 Salida</span><b>{formatFecha(reserva.fecha_salida)}</b></div>
        <div className="rc-row"><span>Total</span><span className="rc-total">{formatMoney(reserva.total)}</span></div>
        {onCancelar && cancelable && (
          <div className="rc-actions">
            <button className="btn btn-danger btn-sm btn-block" onClick={() => onCancelar(reserva.id_reserva)}>
              Cancelar reserva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
