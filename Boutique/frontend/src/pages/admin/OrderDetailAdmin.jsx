import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoArrowBackOutline, IoLocationOutline, IoPersonOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { resolveImage } from '../../services/api.js';
import { formatPrice, formatDateTime, ORDER_STATUS, PAYMENT_STATUS } from '../../utils/format.js';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Select from '../../components/forms/Select.jsx';

const ESTADO_OPTIONS = Object.entries(ORDER_STATUS).map(([value, { label }]) => ({ value, label }));
const PAGO_OPTIONS = Object.entries(PAYMENT_STATUS).map(([value, { label }]) => ({ value, label }));

export default function OrderDetailAdmin() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);

  function load() {
    setLoading(true);
    adminService
      .orderDetail(id)
      .then((o) => setOrder(o))
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el pedido'))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [id]);

  async function handleEstado(estado) {
    setUpdating(true);
    setError('');
    setFeedback('');
    try {
      await adminService.updateOrderStatus(id, estado);
      setFeedback('Estado del pedido actualizado');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el estado');
      setUpdating(false);
    }
  }

  async function handlePago(estado_pago) {
    setUpdating(true);
    setError('');
    setFeedback('');
    try {
      await adminService.updatePaymentStatus(id, estado_pago);
      setFeedback('Estado de pago actualizado');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el pago');
      setUpdating(false);
    }
  }

  if (loading) return <Loader label="Cargando pedido..." />;
  if (!order) return <Alert type="error">{error || 'Pedido no encontrado'}</Alert>;

  const estado = ORDER_STATUS[order.estado] || { label: order.estado, color: 'bg-neutral-200 text-neutral-700' };
  const pago = PAYMENT_STATUS[order.estado_pago] || { label: order.estado_pago, color: 'bg-neutral-200 text-neutral-700' };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/pedidos" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
          <IoArrowBackOutline size={22} />
        </Link>
        <h1 className="font-display text-3xl font-bold">Pedido #{order.numero}</h1>
        <span className={`badge ${estado.color}`}>{estado.label}</span>
        <span className={`badge ${pago.color}`}>{pago.label}</span>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Variante</th>
                    <th className="px-4 py-3">Cant.</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(order.items || []).map((it) => (
                    <tr key={it.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImage(it.imagen)}
                            alt={it.nombre_producto}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-ink">{it.nombre_producto}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {[it.talla, it.color].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="px-4 py-3">{it.cantidad}</td>
                      <td className="px-4 py-3">{formatPrice(it.precio_unitario)}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="card space-y-2 p-6">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {Number(order.descuento) > 0 && (
              <Row label={`Descuento${order.cupon_codigo ? ` (${order.cupon_codigo})` : ''}`} value={`- ${formatPrice(order.descuento)}`} />
            )}
            <Row label="Envío" value={formatPrice(order.costo_envio)} />
            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Gestión */}
          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Gestión</h2>
            <Select
              label="Estado del pedido"
              options={ESTADO_OPTIONS}
              value={order.estado}
              disabled={updating}
              onChange={(e) => handleEstado(e.target.value)}
            />
            <Select
              label="Estado de pago"
              options={PAGO_OPTIONS}
              value={order.estado_pago}
              disabled={updating}
              onChange={(e) => handlePago(e.target.value)}
            />
            <p className="text-xs text-neutral-400">Creado el {formatDateTime(order.created_at)}</p>
          </div>

          {/* Cliente */}
          <div className="card space-y-2 p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
              <IoPersonOutline size={18} /> Cliente
            </h2>
            <p className="text-sm font-medium text-ink">{order.nombre_cliente}</p>
            {order.email_cliente && <p className="text-sm text-neutral-500">{order.email_cliente}</p>}
            {order.telefono && <p className="text-sm text-neutral-500">{order.telefono}</p>}
          </div>

          {/* Envío */}
          <div className="card space-y-1 p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
              <IoLocationOutline size={18} /> Envío
            </h2>
            {order.direccion && <p className="text-sm text-neutral-600">{order.direccion}</p>}
            <p className="text-sm text-neutral-500">
              {[order.ciudad, order.departamento].filter(Boolean).join(', ')}
            </p>
            {order.metodo_pago && (
              <p className="mt-2 text-sm">
                <span className="text-neutral-400">Método de pago: </span>
                {order.metodo_pago}
              </p>
            )}
            {order.observaciones && (
              <p className="mt-2 text-sm">
                <span className="text-neutral-400">Observaciones: </span>
                {order.observaciones}
              </p>
            )}
          </div>

          {/* Pagos */}
          {(order.payments || []).length > 0 && (
            <div className="card space-y-2 p-6">
              <h2 className="mb-1 font-display text-lg font-semibold">Pagos</h2>
              {order.payments.map((p, i) => {
                const ps = PAYMENT_STATUS[p.estado] || { label: p.estado, color: 'bg-neutral-200 text-neutral-700' };
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">{p.metodo}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{formatPrice(p.monto)}</span>
                      <span className={`badge ${ps.color}`}>{ps.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
