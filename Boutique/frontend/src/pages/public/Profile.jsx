import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoBagHandleOutline, IoHeartOutline, IoLocationOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { authService } from '../../services/auth.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate } from '../../utils/format.js';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';
import Input from '../../components/forms/Input.jsx';

export default function Profile() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    authService
      .profile()
      .then(({ user, addresses }) => {
        setProfile(user);
        setAddresses(addresses || []);
        setForm({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          telefono: user.telefono || '',
          password: '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el perfil'))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
      };
      if (form.password) payload.password = form.password;
      const { user } = await authService.updateProfile(payload);
      setProfile((prev) => ({ ...prev, ...user }));
      setUser(user);
      setForm((f) => ({ ...f, password: '' }));
      setSuccess('Tus datos se actualizaron correctamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Cargando tu perfil..." />;

  return (
    <div className="container-max py-10">
      <div className="mb-8 flex items-center gap-3">
        <IoPersonCircleOutline size={40} className="text-accent-dark" />
        <div>
          <h1 className="font-display text-3xl font-bold">Mi perfil</h1>
          <p className="text-sm text-neutral-500">Administra tus datos personales</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="card p-6 sm:p-8">
            {success && <Alert type="success" className="mb-4">{success}</Alert>}
            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
                <Input
                  label="Apellido"
                  required
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                />
              </div>

              <Input
                label="Teléfono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="3001234567"
              />

              <Input
                label="Nueva contraseña (opcional)"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Déjalo vacío para no cambiarla"
              />

              <div>
                <label className="label">Email</label>
                <input className="input bg-neutral-50 text-neutral-500" value={profile?.email || ''} disabled readOnly />
              </div>

              <p className="text-xs text-neutral-400">
                Cliente desde {formatDate(profile?.fecha_creacion)}
              </p>

              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </form>
          </div>
        </div>

        {/* Lateral */}
        <div className="space-y-6">
          {/* Direcciones */}
          <div className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
              <IoLocationOutline className="text-accent-dark" /> Direcciones guardadas
            </h2>
            {addresses.length === 0 ? (
              <p className="text-sm text-neutral-500">Aún no tienes direcciones guardadas.</p>
            ) : (
              <ul className="space-y-3">
                {addresses.map((a) => (
                  <li key={a.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-ink">{a.direccion}</span>
                      {a.es_principal ? (
                        <span className="badge bg-accent/20 text-accent-dark">Principal</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-neutral-500">
                      {a.ciudad}{a.departamento ? `, ${a.departamento}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Enlaces rápidos */}
          <div className="card p-6">
            <h2 className="mb-3 font-display text-lg font-semibold">Accesos rápidos</h2>
            <div className="space-y-2">
              <Link
                to="/mis-pedidos"
                className="flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-neutral-50"
              >
                <IoBagHandleOutline size={20} className="text-accent-dark" />
                Mis pedidos
              </Link>
              <Link
                to="/favoritos"
                className="flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-neutral-50"
              >
                <IoHeartOutline size={20} className="text-accent-dark" />
                Favoritos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
