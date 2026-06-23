// frontend/src/components/admin/Topbar.jsx
// Barra superior del panel: botón menú (móvil), usuario logueado y cerrar sesión.

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onAbrirMenu }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <button className="text-2xl text-ink lg:hidden" onClick={onAbrirMenu} aria-label="Abrir menú">
        ☰
      </button>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{usuario?.nombre}</p>
          <p className="text-xs text-slate-500">{usuario?.rol}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
          {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
        </div>
        <button onClick={cerrarSesion} className="btn-ghost text-red-500 hover:bg-red-50">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
