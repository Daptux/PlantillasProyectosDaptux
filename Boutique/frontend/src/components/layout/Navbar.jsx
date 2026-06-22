import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoSearch, IoCartOutline, IoHeartOutline, IoPersonOutline, IoMenu, IoClose } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';

const NAV = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/tienda?categoria=ropa', label: 'Ropa' },
  { to: '/tienda?categoria=zapatos', label: 'Zapatos' },
  { to: '/tienda?categoria=accesorios', label: 'Accesorios' },
  { to: '/tienda?oferta=1', label: 'Ofertas' },
];

export default function Navbar() {
  const { isAuth, user, isStaff, logout } = useAuth();
  const { cart } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  function onSearch(e) {
    e.preventDefault();
    navigate(`/tienda?search=${encodeURIComponent(search)}`);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="container-max">
        {/* barra superior */}
        <div className="flex h-16 items-center justify-between gap-4">
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <IoClose size={26} /> : <IoMenu size={26} />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tight">{settings?.nombre_tienda || 'Boutique'}</span>
          </Link>

          {/* búsqueda desktop */}
          <form onSubmit={onSearch} className="hidden flex-1 max-w-md items-center lg:flex">
            <div className="relative w-full">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="input pl-10"
              />
            </div>
          </form>

          {/* iconos */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link to="/favoritos" className="rounded-full p-2 hover:bg-neutral-100" title="Favoritos">
              <IoHeartOutline size={22} />
            </Link>
            <Link to="/carrito" className="relative rounded-full p-2 hover:bg-neutral-100" title="Carrito">
              <IoCartOutline size={22} />
              {cart.total_items > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-ink">
                  {cart.total_items}
                </span>
              )}
            </Link>

            {isAuth ? (
              <div className="group relative">
                <button className="flex items-center gap-1.5 rounded-full p-2 hover:bg-neutral-100">
                  <IoPersonOutline size={22} />
                  <span className="hidden text-sm font-medium md:inline">{user.nombre}</span>
                </button>
                <div className="invisible absolute right-0 top-full w-48 rounded-xl border border-neutral-200 bg-white py-2 opacity-0 shadow-card transition-all group-hover:visible group-hover:opacity-100">
                  <Link to="/perfil" className="block px-4 py-2 text-sm hover:bg-neutral-50">Mi perfil</Link>
                  <Link to="/mis-pedidos" className="block px-4 py-2 text-sm hover:bg-neutral-50">Mis pedidos</Link>
                  {isStaff && (
                    <Link to="/admin" className="block px-4 py-2 text-sm font-medium text-accent-dark hover:bg-neutral-50">Panel admin</Link>
                  )}
                  <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-50">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary hidden sm:inline-flex">Ingresar</Link>
            )}
          </div>
        </div>

        {/* nav links desktop */}
        <nav className="hidden h-11 items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} className="text-sm font-medium text-neutral-700 transition hover:text-accent-dark">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* menú móvil */}
      {open && (
        <div className="border-t border-neutral-200 bg-white lg:hidden">
          <div className="container-max space-y-2 py-4">
            <form onSubmit={onSearch} className="relative mb-3">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="input pl-10" />
            </form>
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">
                {n.label}
              </Link>
            ))}
            {!isAuth && <Link to="/login" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">Ingresar</Link>}
          </div>
        </div>
      )}
    </header>
  );
}
