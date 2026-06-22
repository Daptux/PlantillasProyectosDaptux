import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoBagHandleOutline, IoChevronForward } from 'react-icons/io5';
import { orderService } from '../../services/order.service.js';
import { formatPrice, formatDate, ORDER_STATUS, PAYMENT_STATUS } from '../../utils/format.js';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';

export default function MyOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService
      .myOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar tus pedidos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-max py-10">
      <div className="mb-8 flex items-center gap-3">
        <IoBagHandleOutline size={34} className="text-accent-dark" />
        <h1 className="font-display text-3xl font-bold">Mis pedidos</h1>
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      {loading ? (
        <Loader label="Cargando pedidos..." />
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <IoBagHandleOutline size={48} className="text-neutral-300" />
          <div>
            <p className="font-display text-lg font-semibold">Todavía no has hecho pedidos</p>
            <p className="mt-1 text-sm text-neutral-500">Cuando compres algo, aquí verás su estado.</p>
          </div>
          <Button as={Link} to="/tienda" variant="primary">
            Ir a la tienda
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const estado = ORDER_STATUS[o.estado] || { label: o.estado, color: 'bg-neutral-200 text-neutral-700' };
            const pago = PAYMENT_STATUS[o.estado_pago] || { label: o.estado_pago, color: 'bg-neutral-200 text-neutral-700' };
            return (
              <li key={o.id}>
                <Link
                  to={`/mis-pedidos/${o.id}`}
                  className="card flex flex-col gap-4 p-5 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-semibold text-ink">#{o.numero}</span>
                      <span className={`badge ${estado.color}`}>{estado.label}</span>
                      <span className={`badge ${pago.color}`}>{pago.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatDate(o.created_at)} · {o.total_items} {o.total_items === 1 ? 'artículo' : 'artículos'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="text-lg font-semibold text-ink">{formatPrice(o.total)}</span>
                    <IoChevronForward className="shrink-0 text-neutral-400" size={20} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
