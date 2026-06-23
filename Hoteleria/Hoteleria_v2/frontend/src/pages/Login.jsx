import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getError } from '../utils/helpers';
import Alert from '../components/Alert';
import EyeIcon from '../components/EyeIcon';
import '../styles/auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const usuario = await login(email, password);

      // Si venía de "Reservar" sin sesión, lo devolvemos a la habitación para
      // que complete el PAGO. NO se crea ninguna reserva hasta pagar: la
      // reserva sólo nace cuando el pago en Wompi queda aprobado.
      const pendienteRaw = localStorage.getItem('reservaPendiente');
      if (usuario.rol === 'CLIENTE' && pendienteRaw) {
        try {
          const pend = JSON.parse(pendienteRaw);
          if (pend?.id_habitacion) {
            navigate(`/habitacion/${pend.id_habitacion}`, { replace: true });
            return;
          }
        } catch {
          localStorage.removeItem('reservaPendiente');
        }
      }

      if (usuario.rol === 'CLIENTE') navigate(from || '/', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Panel visual */}
      <aside className="auth-aside">
        <div className="a-brand">🏨 Hotel <span>Paraíso</span></div>
        <div className="a-hero">
          <h2>Bienvenido de nuevo a tu próxima escapada</h2>
          <p>Inicia sesión para gestionar tus reservas y disfrutar de una estadía inolvidable.</p>
        </div>
        <div className="a-trust">
          <span><i>✓</i> Confirmación inmediata de tus reservas</span>
          <span><i>✓</i> Pago seguro y sin cargos ocultos</span>
          <span><i>✓</i> Atención directa del hotel 24/7</span>
        </div>
      </aside>

      {/* Formulario */}
      <main className="auth-main">
        <form className="auth-card" onSubmit={onSubmit}>
          <Link to="/" className="auth-back">← Volver al inicio</Link>
          <div className="a-logo-m">🏨 Hotel <span>Paraíso</span></div>

          <h1>Iniciar sesión</h1>
          <p className="sub">Ingresa a tu cuenta para continuar</p>

          <Alert error={error} />

          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="pw-wrap">
              <input
                className="input"
                type={verPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className="pw-eye" title={verPass ? 'Ocultar' : 'Ver'} onClick={() => setVerPass(!verPass)}>
                <EyeIcon open={verPass} />
              </button>
            </div>
          </div>

          <button className="btn btn-primary" disabled={cargando}>
            {cargando ? <><span className="spinner-sm" /> Ingresando...</> : 'Iniciar sesión'}
          </button>

          <div className="auth-foot">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
