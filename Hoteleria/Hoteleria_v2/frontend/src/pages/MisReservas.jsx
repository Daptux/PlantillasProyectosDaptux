import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { misReservas, cancelarReserva } from '../services/reservasService';
import { getError } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import ReservationCard from '../components/ReservationCard';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const FINALES = ['CANCELADA', 'FINALIZADA'];

export default function MisReservas() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [confCancel, setConfCancel] = useState(null);

  const cargar = () => {
    setCargando(true);
    misReservas()
      .then(setReservas)
      .catch((err) => toast.error(getError(err)))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  // Avisos que llegan tras el login (reserva pendiente recién creada)
  useEffect(() => {
    if (location.state?.aviso) toast.success(location.state.aviso);
    if (location.state?.error) toast.error(location.state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelar = async () => {
    const id = confCancel.id_reserva;
    setConfCancel(null);
    try {
      await cancelarReserva(id);
      toast.success('Reserva cancelada correctamente');
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const proximas = reservas.filter((r) => !FINALES.includes(r.estado));
  const historial = reservas.filter((r) => FINALES.includes(r.estado));

  return (
    <div>
      <div className="page-header">
        <h2>Mis reservas</h2>
        <button className="btn btn-gold" onClick={() => navigate('/')}>+ Nueva reserva</button>
      </div>

      {cargando ? <LoadingSpinner /> : (
        reservas.length === 0 ? (
          <EmptyState
            icon="🧳"
            title="Aún no tienes reservas"
            message="Explora nuestras habitaciones y reserva tu próxima estadía."
            action={<button className="btn btn-gold" onClick={() => navigate('/')}>Ver habitaciones</button>}
          />
        ) : (
          <>
            <div className="panel-section"><h3>Próximas y activas</h3></div>
            {proximas.length === 0 ? (
              <EmptyState icon="📅" title="Sin reservas activas" message="No tienes reservas próximas en este momento." />
            ) : (
              <div className="res-list">
                {proximas.map((r) => (
                  <ReservationCard key={r.id_reserva} reserva={r} onCancelar={() => setConfCancel(r)} />
                ))}
              </div>
            )}

            {historial.length > 0 && (
              <>
                <div className="panel-section" style={{ marginTop: 28 }}><h3>Historial</h3></div>
                <div className="res-list">
                  {historial.map((r) => (
                    <ReservationCard key={r.id_reserva} reserva={r} />
                  ))}
                </div>
              </>
            )}
          </>
        )
      )}

      {confCancel && (
        <ConfirmModal
          title="Cancelar reserva"
          message={`¿Seguro que deseas cancelar tu reserva de la habitación ${confCancel.numero}? Esta acción no se puede deshacer.`}
          confirmText="Sí, cancelar"
          cancelText="No, volver"
          onConfirm={cancelar}
          onClose={() => setConfCancel(null)}
        />
      )}
    </div>
  );
}
