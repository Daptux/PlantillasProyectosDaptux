import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Input from '../../components/forms/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm({ ...form, [k]: v }); }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-max flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-center font-display text-3xl font-bold">Crear cuenta</h1>
        <p className="mt-2 text-center text-sm text-neutral-500">Únete y disfruta de beneficios exclusivos</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && <Alert type="error">{error}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
            <Input label="Apellido" value={form.apellido} onChange={(e) => set('apellido', e.target.value)} />
          </div>
          <Input label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
          <Input label="Contraseña" type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-accent-dark hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
