import { Link } from 'react-router-dom';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { resolveImage } from '../../services/api.js';
import { formatPrice } from '../../utils/format.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useCart();
  const { isAuth } = useAuth();
  const fav = isFavorite(product.id);

  const precioFinal = product.precio_final ?? (product.en_oferta && product.precio_descuento ? product.precio_descuento : product.precio);
  const tieneDesc = product.tiene_descuento ?? (product.en_oferta && product.precio_descuento);

  async function onFav(e) {
    e.preventDefault();
    if (!isAuth) { window.location.href = '/login'; return; }
    await toggleFavorite(product.id);
  }

  return (
    <Link to={`/producto/${product.slug || product.id}`} className="group block">
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <img
            src={resolveImage(product.imagen)}
            alt={product.nombre}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* etiquetas */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {tieneDesc && (
              <span className="badge bg-red-600 text-white">-{product.porcentaje_descuento || ''}% OFF</span>
            )}
            {product.es_nuevo ? <span className="badge bg-ink text-white">Nuevo</span> : null}
          </div>
          {/* favorito */}
          <button
            onClick={onFav}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-ink shadow transition hover:scale-110"
            title="Favorito"
          >
            {fav ? <IoHeart className="text-red-500" size={18} /> : <IoHeartOutline size={18} />}
          </button>
        </div>

        <div className="p-4">
          {product.categoria && <p className="mb-1 text-xs uppercase tracking-wide text-neutral-400">{product.categoria}</p>}
          <h3 className="line-clamp-1 font-sans text-sm font-medium text-ink">{product.nombre}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-semibold text-ink">{formatPrice(precioFinal)}</span>
            {tieneDesc && <span className="text-sm text-neutral-400 line-through">{formatPrice(product.precio)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
