import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Input from '../../components/forms/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      // Empleados/admin van al panel; clientes a donde venían
      navigate(['ADMIN', 'EMPLOYEE'].includes(user.rol) ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-max flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-center font-display text-3xl font-bold">Iniciar sesión</h1>
        <p className="mt-2 text-center text-sm text-neutral-500">Bienvenido de vuelta a tu boutique</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && <Alert type="error">{error}</Alert>}
          <Input label="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tucorreo@email.com" />
          <Input label="Contraseña" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-accent-dark hover:underline">Regístrate</Link>
        </p>

        <div className="mt-6 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
          <p className="font-medium">Usuarios de prueba:</p>
          <p>admin@boutique.com / Admin12345</p>
          <p>empleado@boutique.com / Empleado12345</p>
          <p>cliente@boutique.com / Cliente12345</p>
        </div>
      </div>
    </div>
  );
}
