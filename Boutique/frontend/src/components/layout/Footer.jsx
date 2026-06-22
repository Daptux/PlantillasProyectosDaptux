import { Link } from 'react-router-dom';
import { IoLogoInstagram, IoLogoFacebook, IoLogoTiktok, IoCallOutline, IoMailOutline, IoLocationOutline } from 'react-icons/io5';
import { useStore } from '../../context/StoreContext.jsx';

export default function Footer() {
  const { settings } = useStore();
  const s = settings || {};
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-ink text-neutral-300">
      <div className="container-max grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">{s.nombre_tienda || 'Boutique'}</h3>
          <p className="mt-3 text-sm text-neutral-400">Moda y estilo para cada ocasión. Calidad premium con la mejor experiencia de compra.</p>
          <div className="mt-4 flex gap-3">
            {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-accent hover:text-ink"><IoLogoInstagram size={18} /></a>}
            {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-accent hover:text-ink"><IoLogoFacebook size={18} /></a>}
            {s.tiktok && <a href={s.tiktok} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-accent hover:text-ink"><IoLogoTiktok size={18} /></a>}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Tienda</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tienda" className="hover:text-accent">Todos los productos</Link></li>
            <li><Link to="/tienda?categoria=ropa" className="hover:text-accent">Ropa</Link></li>
            <li><Link to="/tienda?categoria=zapatos" className="hover:text-accent">Zapatos</Link></li>
            <li><Link to="/tienda?oferta=1" className="hover:text-accent">Ofertas</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Mi cuenta</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-accent">Iniciar sesión</Link></li>
            <li><Link to="/registro" className="hover:text-accent">Crear cuenta</Link></li>
            <li><Link to="/mis-pedidos" className="hover:text-accent">Mis pedidos</Link></li>
            <li><Link to="/favoritos" className="hover:text-accent">Favoritos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Contacto</h4>
          <ul className="space-y-3 text-sm">
            {s.telefono && <li className="flex items-center gap-2"><IoCallOutline /> {s.telefono}</li>}
            {s.email && <li className="flex items-center gap-2"><IoMailOutline /> {s.email}</li>}
            {(s.direccion || s.ciudad) && <li className="flex items-center gap-2"><IoLocationOutline /> {[s.direccion, s.ciudad].filter(Boolean).join(', ')}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {s.nombre_tienda || 'Boutique'}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
