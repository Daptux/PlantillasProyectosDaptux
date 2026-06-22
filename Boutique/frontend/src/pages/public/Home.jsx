import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoRepeatOutline,
  IoLogoWhatsapp,
} from 'react-icons/io5';
import api from '../../services/api.js';
import { productService, categoryService } from '../../services/product.service.js';
import { useStore } from '../../context/StoreContext.jsx';
import HeroBanner from '../../components/product/HeroBanner.jsx';
import CategoryCard from '../../components/product/CategoryCard.jsx';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import Loader from '../../components/common/Loader.jsx';

function SectionTitle({ eyebrow, title, to, linkLabel = 'Ver todo' }) {
  return (
    <div className="mb-7 flex items-end justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-dark">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="shrink-0 text-sm font-medium text-ink hover:text-accent-dark hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

const BENEFITS = [
  { Icon: IoRocketOutline, title: 'Envíos a todo el país', text: 'Recibe tu pedido donde estés.' },
  { Icon: IoShieldCheckmarkOutline, title: 'Pagos seguros', text: 'Tus datos siempre protegidos.' },
  { Icon: IoRepeatOutline, title: 'Cambios fáciles', text: 'Cambia tu talla sin complicaciones.' },
  { Icon: IoLogoWhatsapp, title: 'Atención por WhatsApp', text: 'Te asesoramos en todo momento.' },
];

export default function Home() {
  const { settings } = useStore();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [nuevos, setNuevos] = useState([]);
  const [vendidos, setVendidos] = useState([]);
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [bn, cat, dest, nuev, vend, ofer] = await Promise.all([
          api.get('/banners').then((r) => r.data).catch(() => []),
          categoryService.list().catch(() => []),
          productService.list({ destacado: '1', limit: 8 }).catch(() => ({ data: [] })),
          productService.list({ nuevo: '1', limit: 4 }).catch(() => ({ data: [] })),
          productService.list({ sort: 'vendidos', limit: 4 }).catch(() => ({ data: [] })),
          productService.list({ oferta: '1', limit: 4 }).catch(() => ({ data: [] })),
        ]);
        if (!active) return;
        setBanners(bn || []);
        setCategories(cat || []);
        setDestacados(dest.data || []);
        setNuevos(nuev.data || []);
        setVendidos(vend.data || []);
        setOfertas(ofer.data || []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <Loader fullScreen label="Cargando tienda..." />;

  return (
    <div className="pb-20">
      <HeroBanner banners={banners} />

      {/* Beneficios */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="container-max grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon size={28} className="mt-0.5 shrink-0 text-accent-dark" />
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-xs text-neutral-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section className="container-max py-14">
          <SectionTitle eyebrow="Explora" title="Categorías" to="/tienda" linkLabel="Ver tienda" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      <section className="container-max py-8">
        <SectionTitle eyebrow="Selección" title="Productos destacados" to="/tienda?destacado=1" />
        <ProductGrid products={destacados} />
      </section>

      {/* Nueva colección */}
      {nuevos.length > 0 && (
        <section className="container-max py-8">
          <SectionTitle eyebrow="Recién llegado" title="Nueva colección" to="/tienda?nuevo=1" />
          <ProductGrid products={nuevos} />
        </section>
      )}

      {/* Más vendidos */}
      {vendidos.length > 0 && (
        <section className="container-max py-8">
          <SectionTitle eyebrow="Tendencia" title="Más vendidos" to="/tienda?sort=vendidos" />
          <ProductGrid products={vendidos} />
        </section>
      )}

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="container-max py-8">
          <SectionTitle eyebrow="Ahorra" title="Ofertas" to="/tienda?oferta=1" linkLabel="Ver ofertas" />
          <ProductGrid products={ofertas} />
        </section>
      )}

      {/* CTA WhatsApp */}
      {settings?.whatsapp && (
        <section className="container-max py-10">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-ink px-8 py-10 text-center text-white sm:flex-row sm:text-left">
            <div>
              <h3 className="font-display text-2xl font-bold">¿Necesitas ayuda con tu compra?</h3>
              <p className="mt-1 text-neutral-300">Escríbenos por WhatsApp y te asesoramos.</p>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-accent shrink-0"
            >
              <IoLogoWhatsapp size={20} /> Chatear ahora
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
