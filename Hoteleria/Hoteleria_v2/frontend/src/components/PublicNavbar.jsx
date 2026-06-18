import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Barra superior del sitio público. Se adapta según haya o no sesión.
export default function PublicNavbar() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const esStaff = usuario && (usuario.rol === 'ADMIN' || usuario.rol === 'EMPLEADO');

  // Va a una sección de la landing; si no estamos en ella, navega primero.
  const irSeccion = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  };

  const salir = () => { logout(); navigate('/'); };

  return (
    <nav className="lnav">
      <Link to="/" className="lbrand">🏨 Hotel <span>Paraíso</span></Link>
      <div className="llinks">
        <a href="#inicio" onClick={irSeccion('inicio')}>Inicio</a>
        <a href="#habitaciones" onClick={irSeccion('habitaciones')}>Habitaciones</a>
        <a href="#servicios" onClick={irSeccion('servicios')}>Servicios</a>
        <a href="#contacto" onClick={irSeccion('contacto')}>Contacto</a>
      </div>
      <div className="lauth">
        {!usuario && (
          <>
            <button className="btn-ghost" onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button className="btn-gold" onClick={() => navigate('/register')}>Registrarse</button>
          </>
        )}
        {usuario && usuario.rol === 'CLIENTE' && (
          <>
            <span className="lhello">Hola, {usuario.nombre}</span>
            <button className="btn-ghost" onClick={() => navigate('/mis-reservas')}>Mis reservas</button>
            <button className="btn-ghost" onClick={salir}>Salir</button>
          </>
        )}
        {esStaff && (
          <>
            <span className="lhello">Hola, {usuario.nombre}</span>
            <button className="btn-gold" onClick={() => navigate('/dashboard')}>Ir al panel</button>
            <button className="btn-ghost" onClick={salir}>Salir</button>
          </>
        )}
      </div>
    </nav>
  );
}
