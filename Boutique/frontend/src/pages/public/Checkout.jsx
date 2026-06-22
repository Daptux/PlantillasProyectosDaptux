import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { orderService } from '../../services/order.service.js';
import { resolveImage } from '../../services/api.js';
import { formatPrice, PAYMENT_METHODS } from '../../utils/format.js';
import Input from '../../components/forms/Input.jsx';
import Select from '../../components/forms/Select.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';

export default function Checkout() {
  const { cart, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre_cliente: '', telefono: '', direccion: '', ciudad: '',
    departamento: '', observaciones: '', metodo_pago: 'CONTRA_ENTREGA',
  });
  const [cupon, setCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [cuponError, setCuponError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, nombre_cliente: `${user.nombre} ${user.apellido || ''}`.trim(), telefono: user.telefono || '' }));
  }, [user]);

  // Redirige si el carrito está vacío (y no acabamos de comprar)
  useEffect(() => {
    if (!success && cart.items && cart.items.length === 0) navigate('/carrito');
  }, [cart.items, success, navigate]);

  function set(k, v) { setForm({ ...form, [k]: v }); }

  const subtotal = cart.subtotal || 0;
  const descuento = cuponAplicado?.descuento || 0;
  const envio = Number(settings?.costo_envio || 0);
  const total = Math.max(0, subtotal - descuento) + envio;

  async function aplicarCupon() {
    setCuponError('');
    try {
      const res = await orderService.validateCoupon(cupon.trim(), subtotal);
      setCuponAplicado(res);
    } catch (err) {
      setCuponAplicado(null);
      setCuponError(err.response?.data?.message || 'Cupón inválido');
    }
  }

  async function confirmar(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, cupon_codigo: cuponAplicado?.codigo || undefined };
      const res = await orderService.create(payload);
      await clearCart();
      await refreshCart();
      setSuccess(res);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear el pedido');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="container-max flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <IoCheckmarkCircle size={72} className="text-emerald-500" />
        <h1 className="mt-4 font-display text-3xl font-bold">¡Pedido confirmado!</h1>
        <p className="mt-2 text-neutral-600">Tu pedido <strong>{success.numero}</strong> fue creado con éxito.</p>
        <p className="text-lg font-semibold">{formatPrice(success.total)}</p>
        <div className="mt-8 flex gap-3">
          <Link to="/mis-pedidos" className="btn-primary">Ver mis pedidos</Link>
          <Link to="/tienda" className="btn-outline">Seguir comprando</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-max py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Finalizar compra</h1>
      <form onSubmit={confirmar} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* datos */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h3 className="mb-4 text-lg font-semibold">Datos de envío</h3>
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Nombre completo" required value={form.nombre_cliente} onChange={(e) => set('nombre_cliente', e.target.value)} />
              <Input label="Teléfono" required value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
              <Input label="Dirección" required className="sm:col-span-2" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} />
              <Input label="Ciudad" required value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} />
              <Input label="Departamento" value={form.departamento} onChange={(e) => set('departamento', e.target.value)} />
            </div>
            <div className="mt-4">
              <label className="label">Observaciones (opcional)</label>
              <textarea className="input" rows={2} value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-lg font-semibold">Método de pago</h3>
            <Select value={form.metodo_pago} onChange={(e) => set('metodo_pago', e.target.value)} options={PAYMENT_METHODS} />
          </div>
        </div>

        {/* resumen */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h3 className="mb-4 text-lg font-semibold">Tu pedido</h3>
            <div className="max-h-56 space-y-3 overflow-y-auto">
              {cart.items?.map((it) => (
                <div key={it.id} className="flex gap-3">
                  <img src={resolveImage(it.imagen)} alt={it.nombre} className="h-14 w-12 rounded object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{it.nombre}</p>
                    <p className="text-neutral-500">x{it.cantidad} · {formatPrice(it.precio_unitario)}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(it.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* cupón */}
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <label className="label">Cupón de descuento</label>
              <div className="flex gap-2">
                <input className="input" value={cupon} onChange={(e) => setCupon(e.target.value)} placeholder="Ej: BIENVENIDA10" />
                <Button type="button" variant="outline" onClick={aplicarCupon}>Aplicar</Button>
              </div>
              {cuponError && <p className="mt-1 text-xs text-red-600">{cuponError}</p>}
              {cuponAplicado && <p className="mt-1 text-xs text-emerald-600">Cupón {cuponAplicado.codigo} aplicado</p>}
            </div>

            {/* totales */}
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {descuento > 0 && <div className="flex justify-between text-emerald-600"><span>Descuento</span><span>-{formatPrice(descuento)}</span></div>}
              <div className="flex justify-between"><span className="text-neutral-500">Envío</span><span>{envio ? formatPrice(envio) : 'Gratis'}</span></div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            <Button type="submit" variant="primary" className="mt-6 w-full" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
