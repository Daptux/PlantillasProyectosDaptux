import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENU = {
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard', ico: '📊' },
    { to: '/empleados', label: 'Empleados', ico: '👔' },
    { to: '/clientes', label: 'Clientes', ico: '🧑‍🤝‍🧑' },
    { to: '/habitaciones', label: 'Habitaciones', ico: '🛏️' },
    { to: '/reservas', label: 'Reservas', ico: '📅' },
    { to: '/pagos', label: 'Pagos', ico: '💳' },
    { to: '/perfil', label: 'Mi perfil', ico: '👤' }
  ],
  EMPLEADO: [
    { to: '/dashboard', label: 'Dashboard', ico: '📊' },
    { to: '/clientes', label: 'Clientes', ico: '🧑‍🤝‍🧑' },
    { to: '/habitaciones', label: 'Habitaciones', ico: '🛏️' },
    { to: '/reservas', label: 'Reservas', ico: '📅' },
    { to: '/pagos', label: 'Pagos', ico: '💳' },
    { to: '/perfil', label: 'Mi perfil', ico: '👤' }
  ]
};

export default function MainLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = MENU[usuario.rol] || [];

  const cerrarSesion = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">🏨 Hotel Paraíso</div>
        <nav>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mi-ico">{item.ico}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-box">
          <div>{usuario.nombre} {usuario.apellido || ''}</div>
          <span className="rol">{usuario.rol}</span>
          <button className="btn btn-light btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="topbar">
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">☰</button>
          <button className="btn btn-light btn-sm" onClick={() => navigate('/')}>← Volver al inicio</button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
