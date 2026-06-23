// frontend/src/pages/auth/Login.jsx
// Inicio de sesión del panel administrativo.

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from?.pathname || '/admin/dashboard';

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(correo, password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-500 to-teal-600 p-4">
      <div className="card w-full max-w-md p-8 animate-fadeUp">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white">🦷</span>
          <h1 className="text-2xl font-bold text-ink">OdontoAdmin Pro</h1>
          <p className="text-sm text-slate-500">Panel administrativo</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Correo electrónico</label>
            <input
              type="email"
              className="input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@odontoadmin.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={cargando}>
            {cargando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-brand-600">← Volver al sitio</Link>
        </div>
      </div>
    </div>
  );
}
