import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/forms/Input.jsx';

const emptyForm = {
  nombre_tienda: '',
  logo: '',
  telefono: '',
  whatsapp: '',
  email: '',
  direccion: '',
  ciudad: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  costo_envio: '',
  moneda: '',
};

export default function StoreSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    adminService
      .getSettings()
      .then((d) => setForm({ ...emptyForm, ...(d || {}) }))
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar la configuración'))
      .finally(() => setLoading(false));
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');
    try {
      await adminService.updateSettings({ ...form, costo_envio: Number(form.costo_envio) || 0 });
      setFeedback('Configuración guardada');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Cargando configuración..." />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Configuración de la tienda</h1>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      <form onSubmit={save} className="space-y-8">
        <section className="card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Datos generales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre de la tienda" value={form.nombre_tienda} onChange={(e) => set('nombre_tienda', e.target.value)} />
            <Input label="Logo (URL)" value={form.logo} onChange={(e) => set('logo', e.target.value)} />
            <Input label="Moneda" value={form.moneda} onChange={(e) => set('moneda', e.target.value)} placeholder="COP" />
            <Input label="Costo de envío" type="number" min="0" value={form.costo_envio} onChange={(e) => set('costo_envio', e.target.value)} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Contacto</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} />
            <Input label="Ciudad" value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Redes sociales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Instagram" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />
            <Input label="Facebook" value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
            <Input label="TikTok" value={form.tiktok} onChange={(e) => set('tiktok', e.target.value)} />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </div>
  );
}
