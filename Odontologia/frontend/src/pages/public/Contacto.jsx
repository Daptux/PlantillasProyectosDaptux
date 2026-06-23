// frontend/src/pages/public/Contacto.jsx
import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../hooks/useConfiguracion';

export default function Contacto() {
  const { config } = useConfiguracion();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-ink">Contáctanos</h1>
        <p className="mt-2 text-slate-500">Estamos para ayudarte. Escríbenos o visítanos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          <div className="flex items-center gap-3"><span className="text-2xl">📞</span><div><p className="text-xs text-slate-400">Teléfono</p><p className="font-medium text-ink">{config.telefono}</p></div></div>
          <div className="flex items-center gap-3"><span className="text-2xl">💬</span><div><p className="text-xs text-slate-400">WhatsApp</p><a href={`https://wa.me/${config.whatsapp}`} className="font-medium text-green-600">Escríbenos</a></div></div>
          <div className="flex items-center gap-3"><span className="text-2xl">✉️</span><div><p className="text-xs text-slate-400">Correo</p><p className="font-medium text-ink">{config.correo}</p></div></div>
          <div className="flex items-center gap-3"><span className="text-2xl">📍</span><div><p className="text-xs text-slate-400">Dirección</p><p className="font-medium text-ink">{config.direccion}</p></div></div>
          <div className="flex items-center gap-3"><span className="text-2xl">🕒</span><div><p className="text-xs text-slate-400">Horarios</p><p className="font-medium text-ink">{config.horarios}</p></div></div>
          <Link to="/reservar-cita" className="btn-primary w-full">Agendar cita</Link>
        </div>

        <div className="card overflow-hidden">
          {config.mapa_embed ? (
            <iframe title="Mapa" src={config.mapa_embed} className="h-full min-h-[300px] w-full" loading="lazy" />
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center bg-slate-100 text-slate-400">
              🗺️ Mapa de ubicación
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
