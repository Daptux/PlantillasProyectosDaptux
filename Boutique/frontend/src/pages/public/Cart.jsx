import { Link, useNavigate } from 'react-router-dom';
import { IoAdd, IoRemove, IoTrashOutline, IoCartOutline } from 'react-icons/io5';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { resolveImage } from '../../services/api.js';
import { formatPrice } from '../../utils/format.js';
import Button from '../../components/common/Button.jsx';

export default function Cart() {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  if (!cart.items?.length) {
    return (
      <div className="container-max flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <IoCartOutline size={64} className="text-neutral-300" />
        <h2 className="mt-4 font-display text-2xl font-bold">Tu carrito está vacío</h2>
        <p className="mt-2 text-neutral-500">Descubre nuestros productos y encuentra tu estilo.</p>
        <Link to="/tienda" className="btn-primary mt-6">Ir a la tienda</Link>
      </div>
    );
  }

  function goCheckout() {
    navigate(isAuth ? '/checkout' : '/login');
  }

  return (
    <div className="container-max py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Carrito de compras</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((it) => (
            <div key={it.id} className="card flex gap-4 p-4">
              <Link to={`/producto/${it.slug || it.product_id}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                <img src={resolveImage(it.imagen)} alt={it.nombre} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <Link to={`/producto/${it.slug || it.product_id}`} className="font-medium hover:underline">{it.nombre}</Link>
                    <p className="text-sm text-neutral-500">
                      {[it.talla && `Talla ${it.talla}`, it.color].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button onClick={() => removeItem(it.id)} className="text-neutral-400 hover:text-red-500" title="Eliminar">
                    <IoTrashOutline size={20} />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center rounded-lg border border-neutral-300">
                    <button onClick={() => updateItem(it.id, Math.max(1, it.cantidad - 1))} className="p-2"><IoRemove size={16} /></button>
                    <span className="w-8 text-center text-sm font-medium">{it.cantidad}</span>
                    <button onClick={() => updateItem(it.id, it.cantidad + 1)} className="p-2"><IoAdd size={16} /></button>
                  </div>
                  <span className="font-semibold">{formatPrice(it.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-neutral-500 hover:text-red-500">Vaciar carrito</button>
        </div>

        {/* resumen */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h3 className="mb-4 text-lg font-semibold">Resumen</h3>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal ({cart.total_items} items)</span>
              <span className="font-medium">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-neutral-400">El envío se calcula en el checkout.</p>
            <Button variant="primary" className="mt-6 w-full" onClick={goCheckout}>Proceder al pago</Button>
            <Link to="/tienda" className="btn-ghost mt-2 w-full">Seguir comprando</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
