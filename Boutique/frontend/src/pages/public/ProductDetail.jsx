import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IoHeart, IoHeartOutline, IoAdd, IoRemove, IoChevronBack } from 'react-icons/io5';
import { productService } from '../../services/product.service.js';
import { resolveImage } from '../../services/api.js';
import { formatPrice } from '../../utils/format.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';
import ProductGrid from '../../components/product/ProductGrid.jsx';

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { isAuth } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [talla, setTalla] = useState(null);
  const [color, setColor] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    productService
      .get(idOrSlug)
      .then((p) => {
        setProduct(p);
        setActiveImg(0); setTalla(null); setColor(null); setCantidad(1); setMsg(null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) return <Loader fullScreen />;
  if (notFound || !product) {
    return (
      <div className="container-max py-20 text-center">
        <h2 className="font-display text-2xl font-bold">Producto no encontrado</h2>
        <Link to="/tienda" className="btn-primary mt-6">Volver a la tienda</Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const tallas = [...new Set(variants.filter((v) => v.talla).map((v) => v.talla))];
  const colores = variants.reduce((acc, v) => {
    if (v.color && !acc.find((c) => c.color === v.color)) acc.push({ color: v.color, color_hex: v.color_hex });
    return acc;
  }, []);

  // Variante seleccionada según talla/color elegidos
  const selectedVariant = variants.find(
    (v) => (!tallas.length || v.talla === talla) && (!colores.length || v.color === color)
  );
  const stockDisponible = selectedVariant ? selectedVariant.stock : product.stock_total;

  const images = product.images?.length ? product.images : (product.imagen ? [{ url: product.imagen }] : []);
  const fav = isFavorite(product.id);

  async function handleAdd() {
    setMsg(null);
    if (tallas.length && !talla) return setMsg({ type: 'warning', text: 'Selecciona una talla' });
    if (colores.length && !color) return setMsg({ type: 'warning', text: 'Selecciona un color' });
    if (!selectedVariant) return setMsg({ type: 'warning', text: 'Combinación no disponible' });
    if (selectedVariant.stock < cantidad) return setMsg({ type: 'error', text: 'Stock insuficiente' });
    if (!isAuth) return navigate('/login');
    try {
      await addToCart({ product_id: product.id, variant_id: selectedVariant.id, cantidad });
      setMsg({ type: 'success', text: '¡Agregado al carrito!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'No se pudo agregar' });
    }
  }

  async function handleFav() {
    if (!isAuth) return navigate('/login');
    await toggleFavorite(product.id);
  }

  return (
    <div className="container-max py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 text-sm"><IoChevronBack /> Volver</button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* galería */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            <img src={resolveImage(images[activeImg]?.url)} alt={product.nombre} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((im, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${i === activeImg ? 'border-ink' : 'border-transparent'}`}>
                  <img src={resolveImage(im.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div>
          {product.categoria && <p className="text-sm uppercase tracking-wide text-neutral-400">{product.categoria}{product.marca ? ` · ${product.marca}` : ''}</p>}
          <h1 className="mt-1 font-display text-3xl font-bold">{product.nombre}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.precio_final)}</span>
            {product.tiene_descuento && (
              <>
                <span className="text-lg text-neutral-400 line-through">{formatPrice(product.precio)}</span>
                <span className="badge bg-red-600 text-white">-{product.porcentaje_descuento}%</span>
              </>
            )}
          </div>

          {/* tallas */}
          {tallas.length > 0 && (
            <div className="mt-6">
              <p className="label">Talla</p>
              <div className="flex flex-wrap gap-2">
                {tallas.map((t) => (
                  <button key={t} onClick={() => setTalla(t)}
                    className={`min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium transition ${talla === t ? 'border-ink bg-ink text-white' : 'border-neutral-300 hover:border-ink'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* colores */}
          {colores.length > 0 && (
            <div className="mt-5">
              <p className="label">Color {color && <span className="text-neutral-400">· {color}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {colores.map((c) => (
                  <button key={c.color} onClick={() => setColor(c.color)} title={c.color}
                    className={`h-9 w-9 rounded-full border-2 transition ${color === c.color ? 'border-ink ring-2 ring-ink/20' : 'border-neutral-300'}`}
                    style={{ backgroundColor: c.color_hex || '#ccc' }} />
                ))}
              </div>
            </div>
          )}

          {/* stock */}
          <p className="mt-5 text-sm">
            {stockDisponible > 0
              ? <span className="text-emerald-600">{stockDisponible} disponibles</span>
              : <span className="text-red-600">Agotado</span>}
          </p>

          {/* cantidad */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-neutral-300">
              <button onClick={() => setCantidad((q) => Math.max(1, q - 1))} className="p-3"><IoRemove /></button>
              <span className="w-10 text-center font-medium">{cantidad}</span>
              <button onClick={() => setCantidad((q) => Math.min(stockDisponible || 99, q + 1))} className="p-3"><IoAdd /></button>
            </div>
          </div>

          {msg && <Alert type={msg.type} className="mt-5">{msg.text}</Alert>}

          <div className="mt-6 flex gap-3">
            <Button variant="primary" className="flex-1" onClick={handleAdd} disabled={stockDisponible <= 0}>
              Agregar al carrito
            </Button>
            <Button variant="outline" onClick={handleFav}>
              {fav ? <IoHeart className="text-red-500" size={20} /> : <IoHeartOutline size={20} />}
            </Button>
          </div>

          {product.descripcion && (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <h3 className="mb-2 text-lg font-semibold">Descripción</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">{product.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {product.related?.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">También te puede gustar</h2>
          <ProductGrid products={product.related} />
        </section>
      )}
    </div>
  );
}
