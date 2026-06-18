import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { getError } from '../utils/helpers';
import Alert from '../components/Alert';
import EyeIcon from '../components/EyeIcon';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', telefono: '', documento: '' });
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [cargando, setCargando] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    setCargando(true);
    try {
      await register(form);
      setOk('Cuenta creada correctamente. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1500);
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
          <h2>Crea tu cuenta y reserva en segundos</h2>
          <p>Regístrate para reservar habitaciones exclusivas y administrar tus estadías fácilmente.</p>
        </div>
        <div className="a-trust">
          <span><i>✓</i> Reserva rápida y sin complicaciones</span>
          <span><i>✓</i> Historial de tus reservas siempre a mano</span>
          <span><i>✓</i> Mejores tarifas garantizadas</span>
        </div>
      </aside>

      {/* Formulario */}
      <main className="auth-main">
        <form className="auth-card" onSubmit={onSubmit}>
          <Link to="/" className="auth-back">← Volver al inicio</Link>
          <div className="a-logo-m">🏨 Hotel <span>Paraíso</span></div>

          <h1>Crear cuenta</h1>
          <p className="sub">Regístrate como cliente</p>

          <Alert error={error} success={ok} />

          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input className="input" name="nombre" value={form.nombre} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input className="input" name="apellido" value={form.apellido} onChange={onChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label>Contraseña *</label>
            <div className="pw-wrap">
              <input
                className="input"
                type={verPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button type="button" className="pw-eye" title={verPass ? 'Ocultar' : 'Ver'} onClick={() => setVerPass(!verPass)}>
                <EyeIcon open={verPass} />
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input className="input" name="telefono" value={form.telefono} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>Documento</label>
              <input className="input" name="documento" value={form.documento} onChange={onChange} />
            </div>
          </div>

          <button className="btn btn-primary" disabled={cargando}>
            {cargando ? <><span className="spinner-sm" /> Creando...</> : 'Registrarme'}
          </button>

          <div className="auth-foot">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
