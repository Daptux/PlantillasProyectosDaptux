/**
 * frontend/src/pages/public/Contacto.jsx
 */
import { useLandingConfig } from '../../layouts/PublicLayout';

export default function Contacto() {
  const { config } = useLandingConfig() || {};
  const whatsapp = (config?.whatsapp || '').replace(/[^\d]/g, '');

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800">Contáctanos</h1>
        <p className="text-slate-500 mt-3">Estamos aquí para ayudarte. Escríbenos o visítanos.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {config?.telefono && <div className="card p-5 flex items-center gap-4"><span className="text-2xl">📞</span><div><p className="text-sm text-slate-400">Teléfono</p><p className="font-semibold text-slate-800">{config.telefono}</p></div></div>}
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="card p-5 flex items-center gap-4 hover:shadow-soft transition"><span className="text-2xl">💬</span><div><p className="text-sm text-slate-400">WhatsApp</p><p className="font-semibold text-slate-800">{config.whatsapp}</p></div></a>}
          {config?.correo && <div className="card p-5 flex items-center gap-4"><span className="text-2xl">✉️</span><div><p className="text-sm text-slate-400">Correo</p><p className="font-semibold text-slate-800">{config.correo}</p></div></div>}
          {config?.direccion && <div className="card p-5 flex items-center gap-4"><span className="text-2xl">📍</span><div><p className="text-sm text-slate-400">Dirección</p><p className="font-semibold text-slate-800">{config.direccion}</p></div></div>}
          {config?.horarios && <div className="card p-5 flex items-center gap-4"><span className="text-2xl">🕒</span><div><p className="text-sm text-slate-400">Horarios</p><p className="font-semibold text-slate-800">{config.horarios}</p></div></div>}
        </div>

        <div className="card overflow-hidden min-h-[300px]">
          {config?.mapa_embed ? (
            <div dangerouslySetInnerHTML={{ __html: config.mapa_embed }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[300px]" />
          ) : (
            <div className="h-full grid place-items-center text-slate-400 p-8 text-center">
              🗺️ El mapa de ubicación se mostrará aquí.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
