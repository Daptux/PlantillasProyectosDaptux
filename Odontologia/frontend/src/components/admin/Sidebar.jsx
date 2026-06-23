// frontend/src/components/admin/Sidebar.jsx
// Sidebar del panel. Los módulos se muestran según el rol del usuario.

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Cada módulo declara qué roles pueden verlo (SUPERADMIN ve todo).
const MODULOS = [
  { to: '/admin/dashboard', label: 'Dashboard', icono: '📊', roles: ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR', 'CAJA'] },
  { to: '/admin/citas', label: 'Citas', icono: '📅', roles: ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR'] },
  { to: '/admin/pacientes', label: 'Pacientes', icono: '🧑‍🦱', roles: ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR', 'CAJA'] },
  { to: '/admin/odontologos', label: 'Odontólogos', icono: '🦷', roles: ['ADMIN', 'RECEPCIONISTA', 'AUXILIAR'] },
  { to: '/admin/servicios', label: 'Servicios', icono: '🧾', roles: ['ADMIN'] },
  { to: '/admin/historias', label: 'Historias clínicas', icono: '📋', roles: ['ADMIN', 'ODONTOLOGO', 'AUXILIAR'] },
  { to: '/admin/planes-tratamiento', label: 'Planes de tratamiento', icono: '🗂️', roles: ['ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA', 'CAJA'] },
  { to: '/admin/pagos', label: 'Pagos', icono: '💳', roles: ['ADMIN', 'CAJA', 'RECEPCIONISTA'] },
  { to: '/admin/inventario', label: 'Inventario', icono: '📦', roles: ['ADMIN', 'AUXILIAR', 'RECEPCIONISTA'] },
  { to: '/admin/reportes', label: 'Reportes', icono: '📈', roles: ['ADMIN', 'CAJA'] },
  { to: '/admin/contenido-web', label: 'Contenido web', icono: '🌐', roles: ['ADMIN'] },
  { to: '/admin/usuarios', label: 'Usuarios', icono: '👤', roles: ['ADMIN'] },
];

export default function Sidebar({ abierto, onCerrar }) {
  const { usuario, tieneRol } = useAuth();
  const visibles = MODULOS.filter((m) => tieneRol(...m.roles));

  return (
    <>
      {/* Overlay móvil */}
      {abierto && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onCerrar} />}

      <aside
        className={`fixed z-40 h-full w-64 transform bg-ink text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg">🦷</span>
          <span className="font-extrabold">OdontoAdmin</span>
        </div>

        <nav className="space-y-1 px-3 py-2">
          {visibles.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={onCerrar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              <span>{m.icono}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 px-5 py-4 text-xs text-slate-500">
          {usuario?.rol}
        </div>
      </aside>
    </>
  );
}
