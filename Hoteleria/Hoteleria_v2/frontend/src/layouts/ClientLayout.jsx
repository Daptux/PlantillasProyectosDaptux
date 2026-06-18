import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/landing.css';

// Layout para CLIENTES: barra superior tipo sitio web (no panel de administración).
export default function ClientLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="client-shell">
      <nav className="cnav">
        <Link to="/" className="cbrand">🏨 Hotel <span>Paraíso</span></Link>
        <div className="clinks">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/mis-reservas">Mis reservas</NavLink>
          <NavLink to="/opiniones">Opiniones</NavLink>
          <NavLink to="/perfil">Mi perfil</NavLink>
        </div>
        <div className="cuser">
          <span>{usuario.nombre} {usuario.apellido || ''}</span>
          <button className="btn-ghost" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </nav>
      <main className="client-content">
        <Outlet />
      </main>
    </div>
  );
}
