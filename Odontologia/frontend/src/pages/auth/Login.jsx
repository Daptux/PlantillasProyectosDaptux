/**
 * frontend/src/pages/auth/Login.jsx
 * Pantalla de acceso al panel administrativo.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(form.correo, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado visual */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-brand-600 to-teal-600 text-white p-12">
        <div className="text-5xl mb-6">🦷</div>
        <h1 className="text-4xl font-extrabold mb-4">OdontoAdmin Pro</h1>
        <p className="text-brand-100 text-lg max-w-md">
          Panel administrativo para la gestión integral de tu clínica odontológica:
          citas, pacientes, historias clínicas, pagos e inventario.
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6 bg-slate-50">
        <form onSubmit={handleSubmit} className="card w-full max-w-md p-8">
          <Link to="/" className="text-sm text-brand-600 hover:underline">← Volver a la web</Link>
          <h2 className="text-2xl font-bold text-slate-800 mt-4 mb-1">Iniciar sesión</h2>
          <p className="text-slate-500 mb-6 text-sm">Ingresa tus credenciales para acceder.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="label">Correo electrónico</label>
            <input
              type="email"
              className="input"
              placeholder="admin@odontoadmin.com"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={cargando} className="btn-primary w-full">
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-xs text-slate-400 mt-6 text-center">
            Demo: admin@odontoadmin.com / Admin123*
          </p>
        </form>
      </div>
    </div>
  );
}
