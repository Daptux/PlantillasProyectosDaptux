import { imgHab } from '../utils/roomImages';
import { formatMoney } from '../utils/helpers';

// Tarjeta de habitación premium reutilizable.
// props: room, tag {kind,label}, noches, onReservar(id), onDetalle(id)
export default function RoomCard({ room, tag, noches = 0, onReservar, onDetalle }) {
  const total = noches > 0 ? noches * Number(room.precio_noche) : 0;

  return (
    <article className="proom">
      <div
        className="proom-img"
        style={{ backgroundImage: `url(${imgHab(room)})` }}
        onClick={() => onDetalle(room.id_habitacion)}
        role="button"
        aria-label={`Ver habitación ${room.numero}`}
      >
        <span className="proom-type">{room.tipo}</span>
        {tag && <span className={`proom-tag tag-${tag.kind}`}>{tag.label}</span>}
      </div>

      <div className="proom-body">
        <h3>Habitación {room.numero}</h3>
        <div className="proom-meta">👥 Hasta {room.capacidad} huésped(es)</div>
        <p className="proom-desc">
          {room.descripcion || 'Cómoda habitación equipada con todas las comodidades para una estancia perfecta.'}
        </p>
        <div className="proom-amen">📶 WiFi · ❄️ A/C · 🛁 Baño privado · 📺 TV</div>

        <div className="proom-foot">
          <div className="proom-price">
            {formatMoney(room.precio_noche)} <small>/ noche</small>
          </div>
          {noches > 0 && (
            <div className="proom-total">{noches} noche(s): <b>{formatMoney(total)}</b></div>
          )}
        </div>

        <div className="proom-actions">
          <button className="btn btn-gold btn-sm" onClick={() => onReservar(room.id_habitacion)}>Reservar</button>
        </div>
      </div>
    </article>
  );
}
