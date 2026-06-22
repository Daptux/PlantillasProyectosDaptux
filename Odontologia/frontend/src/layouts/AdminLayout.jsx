/**
 * frontend/src/layouts/AdminLayout.jsx
 * Layout del panel: sidebar con módulos según rol + topbar con usuario.
 */
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Cada módulo declara los roles que pueden verlo (SUPERADMIN siempre ve todo)
const modulos = [
  { to: '/admin/dashboard', label: 'Dashboard', icono: '📊', roles: ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR', 'CAJA'] },
  { to: '/admin/citas', label: 'Citas', icono: '📅', roles: ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR'] },
  { to: '/admin/pacientes', label: 'Pacientes', icono: '🧑‍⚕️', roles: ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR'] },
  { to: '/admin/odontologos', label: 'Odontólogos', icono: '👨‍⚕️', roles: ['ADMIN'] },
  { to: '/admin/servicios', label: 'Servicios', icono: '🦷', roles: ['ADMIN'] },
  { to: '/admin/historias', label: 'Historias clínicas', icono: '📋', roles: ['ADMIN', 'ODONTOLOGO'] },
  { to: '/admin/planes-tratamiento', label: 'Planes de tratamiento', icono: '🗂️', roles: ['ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA', 'CAJA'] },
  { to: '/admin/pagos', label: 'Pagos', icono: '💳', roles: ['ADMIN', 'CAJA', 'RECEPCIONISTA'] },
  { to: '/admin/inventario', label: 'Inventario', icono: '📦', roles: ['ADMIN', 'AUXILIAR'] },
  { to: '/admin/contenido-web', label: 'Contenido web', icono: '🌐', roles: ['ADMIN'] },
  { to: '/admin/reportes', label: 'Reportes', icono: '📈', roles: ['ADMIN', 'CAJA'] },
  { to: '/admin/usuarios', label: 'Usuarios', icono: '👥', roles: ['ADMIN'] },
];

export default function AdminLayout() {
  const { usuario, cerrarSesion, tieneRol } = useAuth();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const visibles = modulos.filter((m) => tieneRol(...m.roles));

  function salir() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-brand-900 text-brand-100 flex flex-col transition-transform
          ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 flex items-center gap-2 px-5 font-extrabold text-white border-b border-brand-800">
          <span className="h-8 w-8 grid place-items-center rounded-lg bg-brand-500">🦷</span>
          OdontoAdmin
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibles.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={() => setSidebarAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-brand-500 text-white' : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{m.icono}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-800 text-xs text-brand-300">
          v1.0 · OdontoAdmin Pro
        </div>
      </aside>

      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarAbierto(false)} />
      )}

      {/* Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <button className="lg:hidden text-2xl text-slate-600" onClick={() => setSidebarAbierto(true)}>☰</button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{usuario?.nombre}</p>
              <span className="badge bg-brand-100 text-brand-700">{usuario?.rol}</span>
            </div>
            <div className="h-10 w-10 grid place-items-center rounded-full bg-brand-500 text-white font-bold">
              {usuario?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <button onClick={salir} className="btn-ghost btn-sm" title="Cerrar sesión">Salir</button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
