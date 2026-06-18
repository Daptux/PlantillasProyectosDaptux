import { useEffect, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { fechasOcupadas } from '../services/habitacionesService';
import Modal from './Modal';
import '../styles/landing.css';

const parseYMD = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const hoy = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

// Modal de solo lectura con el calendario de ocupación de una habitación.
export default function RoomCalendarModal({ room, onClose }) {
  const [ocupadas, setOcupadas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fechasOcupadas(room.id_habitacion)
      .then(setOcupadas)
      .catch(() => setOcupadas([]))
      .finally(() => setCargando(false));
  }, [room.id_habitacion]);

  const rangos = useMemo(
    () => ocupadas.map((o) => ({ from: parseYMD(o.fecha_entrada), to: addDays(parseYMD(o.fecha_salida), -1) })),
    [ocupadas]
  );

  return (
    <Modal title={`Calendario · Habitación ${room.numero}`} onClose={onClose}>
      <div className="rd-legend">
        <span><i className="dot dot-ocupado" /> Ocupado</span>
      </div>

      <div className="rd-calendar">
        <DayPicker
          locale={es}
          disabled={[{ before: hoy() }, ...rangos]}
          modifiers={{ ocupado: rangos }}
          modifiersClassNames={{ ocupado: 'day-ocupado' }}
        />
      </div>

      {!cargando && ocupadas.length === 0 && (
        <p className="muted" style={{ textAlign: 'center' }}>Esta habitación no tiene reservas activas.</p>
      )}

      <div className="modal-actions">
        <button className="btn btn-light" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}
