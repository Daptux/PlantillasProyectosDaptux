import { NavLink } from 'react-router-dom';
import {
  IoGridOutline, IoShirtOutline, IoListOutline, IoPricetagsOutline, IoCubeOutline,
  IoReceiptOutline, IoPeopleOutline, IoIdCardOutline, IoTicketOutline, IoImagesOutline,
  IoBarChartOutline, IoSettingsOutline, IoStorefrontOutline,
} from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext.jsx';

// roles: 'ADMIN' | 'EMPLOYEE' (si no se indica, ambos)
const LINKS = [
  { to: '/admin', label: 'Dashboard', Icon: IoGridOutline, end: true },
  { to: '/admin/productos', label: 'Productos', Icon: IoShirtOutline },
  { to: '/admin/categorias', label: 'Categorías', Icon: IoListOutline, roles: ['ADMIN'] },
  { to: '/admin/marcas', label: 'Marcas', Icon: IoPricetagsOutline, roles: ['ADMIN'] },
  { to: '/admin/inventario', label: 'Inventario', Icon: IoCubeOutline },
  { to: '/admin/pedidos', label: 'Pedidos', Icon: IoReceiptOutline },
  { to: '/admin/clientes', label: 'Clientes', Icon: IoPeopleOutline },
  { to: '/admin/empleados', label: 'Empleados', Icon: IoIdCardOutline, roles: ['ADMIN'] },
  { to: '/admin/cupones', label: 'Cupones', Icon: IoTicketOutline, roles: ['ADMIN'] },
  { to: '/admin/banners', label: 'Banners', Icon: IoImagesOutline, roles: ['ADMIN'] },
  { to: '/admin/reportes', label: 'Reportes', Icon: IoBarChartOutline },
  { to: '/admin/configuracion', label: 'Configuración', Icon: IoSettingsOutline, roles: ['ADMIN'] },
];

export default function AdminSidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = LINKS.filter((l) => !l.roles || l.roles.includes(user?.rol));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-neutral-300 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
          <IoStorefrontOutline className="text-accent" size={24} />
          <span className="font-display text-lg font-bold text-white">Boutique Admin</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-accent text-ink' : 'hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 px-6 py-4 text-xs text-neutral-500">
          © {new Date().getFullYear()} Boutique
        </div>
      </aside>
    </>
  );
}
