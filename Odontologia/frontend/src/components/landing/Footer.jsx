// frontend/src/components/landing/Footer.jsx
import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../hooks/useConfiguracion';

export default function Footer() {
  const { config } = useConfiguracion();
  const anio = new Date().getFullYear();

  return (
    <footer className="bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg">🦷</span>
            <span className="text-lg font-extrabold">{config.nombre_clinica}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">{config.eslogan}</p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Navegación</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/servicios" className="hover:text-brand-300">Servicios</Link></li>
            <li><Link to="/equipo" className="hover:text-brand-300">Equipo</Link></li>
            <li><Link to="/galeria" className="hover:text-brand-300">Galería</Link></li>
            <li><Link to="/reservar-cita" className="hover:text-brand-300">Agendar cita</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Contacto</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>📞 {config.telefono}</li>
            <li>✉️ {config.correo}</li>
            <li>📍 {config.direccion}</li>
            <li>🕒 {config.horarios}</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Acceso</h4>
          <Link to="/login" className="text-sm hover:text-brand-300">Panel administrativo</Link>
          <div className="mt-4 flex gap-3">
            {config.facebook_url && <a href={config.facebook_url} className="hover:text-brand-300">Facebook</a>}
            {config.instagram_url && <a href={config.instagram_url} className="hover:text-brand-300">Instagram</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {anio} {config.nombre_clinica}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
