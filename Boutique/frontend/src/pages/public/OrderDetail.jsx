import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack, IoLocationOutline, IoReceiptOutline } from 'react-icons/io5';
import { orderService } from '../../services/order.service.js';
import { goToWompiCheckout } from '../../services/payment.service.js';
import { resolveImage } from '../../services/api.js';
import { formatPrice, formatDateTime, ORDER_STATUS, PAYMENT_STATUS } from '../../utils/format.js';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  async function pagarAhora() {
    setPaying(true);
    setError('');
    try {
      await goToWompiCheckout(order.id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo iniciar el pago');
      setPaying(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    orderService
      .get(id)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.response?.data?.message || 'No se encontró el pedido'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Cargando pedido..." />;

  if (error || !order) {
    return (
      <div className="container-max py-10">
        <Alert type="error" className="mb-6">{error || 'Pedido no encontrado.'}</Alert>
        <Button as={Link} to="/mis-pedidos" variant="outline">
          <IoArrowBack className="mr-1 inline" /> Volver a mis pedidos
        </Button>
      </div>
    );
  }

  const estado = ORDER_STATUS[order.estado] || { label: order.estado, color: 'bg-neutral-200 text-neutral-700' };
  const pago = PAYMENT_STATUS[order.estado_pago] || { label: order.estado_pago, color: 'bg-neutral-200 text-neutral-700' };
  const items = order.items || [];

  return (
    <div className="container-max py-10">
      <Link to="/mis-pedidos" className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-ink">
        <IoArrowBack size={18} /> Volver a mis pedidos
      </Link>

      {/* Cabecera */}
      <div className="card mb-6 flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pedido #{order.numero}</h1>
          <p className="mt-1 text-sm text-neutral-500">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${estado.color}`}>{estado.label}</span>
          <span className={`badge ${pago.color}`}>Pago: {pago.label}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Artículos</h2>
            <ul className="divide-y divide-neutral-100">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={resolveImage(it.imagen)}
                    alt={it.nombre_producto}
                    className="h-20 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-medium text-ink">{it.nombre_producto}</p>
                      {(it.talla || it.color) && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {[it.talla && `Talla: ${it.talla}`, it.color && `Color: ${it.color}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">
                      {it.cantidad} × {formatPrice(it.precio_unitario)}
                    </p>
                  </div>
                  <div className="text-right font-semibold text-ink">{formatPrice(it.subtotal)}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Envío */}
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <IoLocationOutline className="text-accent-dark" /> Datos de envío
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Nombre</dt>
                <dd className="text-right text-ink">{order.nombre_cliente}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Teléfono</dt>
                <dd className="text-right text-ink">{order.telefono}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Dirección</dt>
                <dd className="text-right text-ink">{order.direccion}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Ciudad</dt>
                <dd className="text-right text-ink">
                  {order.ciudad}{order.departamento ? `, ${order.departamento}` : ''}
                </dd>
              </div>
              {order.observaciones && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Observaciones</dt>
                  <dd className="text-right text-ink">{order.observaciones}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Resumen */}
        <div>
          <div className="card p-6 lg:sticky lg:top-24">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <IoReceiptOutline className="text-accent-dark" /> Resumen
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="text-ink">{formatPrice(order.subtotal)}</dd>
              </div>
              {Number(order.descuento) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Descuento{order.cupon_codigo ? ` (${order.cupon_codigo})` : ''}</dt>
                  <dd>-{formatPrice(order.descuento)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-neutral-500">Envío</dt>
                <dd className="text-ink">
                  {Number(order.costo_envio) > 0 ? formatPrice(order.costo_envio) : 'Gratis'}
                </dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-neutral-100 pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="text-ink">{formatPrice(order.total)}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Método de pago</span>
                <span className="text-ink">{order.metodo_pago === 'CONTRA_ENTREGA' ? 'Contra entrega' : 'Pago en línea'}</span>
              </div>
            </div>

            {/* Reintentar pago en línea si quedó pendiente/rechazado */}
            {order.estado_pago !== 'PAGADO' && order.estado !== 'CANCELADO' && order.metodo_pago !== 'CONTRA_ENTREGA' && (
              <Button variant="primary" className="mt-4 w-full" onClick={pagarAhora} disabled={paying}>
                {paying ? 'Redirigiendo...' : `Pagar ahora ${formatPrice(order.total)}`}
              </Button>
            )}
            {error && <Alert type="error" className="mt-3">{error}</Alert>}
          </div>
        </div>
      </div>
    </div>
  );
}
