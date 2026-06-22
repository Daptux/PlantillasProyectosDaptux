import { Link } from 'react-router-dom';
import { IoMenu, IoStorefrontOutline, IoLogOutOutline } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminHeader({ onMenu }) {
  const { user, logout } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <button className="lg:hidden" onClick={onMenu}><IoMenu size={26} /></button>
      <div className="hidden lg:block">
        <span className="text-sm text-neutral-500">Bienvenido,</span>{' '}
        <span className="font-medium">{user?.nombre} · {user?.rol === 'ADMIN' ? 'Dueño' : 'Empleado'}</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/" className="btn-ghost text-sm"><IoStorefrontOutline size={18} /> Ver tienda</Link>
        <button onClick={logout} className="btn-outline text-sm"><IoLogOutOutline size={18} /> Salir</button>
      </div>
    </header>
  );
}
