/**
 * frontend/src/components/landing/Footer.jsx
 */
import { Link } from 'react-router-dom';

export default function Footer({ config }) {
  return (
    <footer className="bg-brand-900 text-brand-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-white text-lg mb-3">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-brand-500">🦷</span>
            {config?.nombre_clinica || 'OdontoAdmin Pro'}
          </div>
          <p className="text-sm text-brand-200">
            Sonrisas saludables, tratamientos confiables y atención personalizada en un espacio moderno y seguro.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Enlaces</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/servicios" className="hover:text-white">Servicios</Link></li>
            <li><Link to="/equipo" className="hover:text-white">Equipo</Link></li>
            <li><Link to="/galeria" className="hover:text-white">Galería</Link></li>
            <li><Link to="/reservar-cita" className="hover:text-white">Agendar cita</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm">
            {config?.telefono && <li>📞 {config.telefono}</li>}
            {config?.correo && <li>✉️ {config.correo}</li>}
            {config?.direccion && <li>📍 {config.direccion}</li>}
            {config?.horarios && <li>🕒 {config.horarios}</li>}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Síguenos</h4>
          <div className="flex gap-3">
            {config?.facebook && <a href={config.facebook} className="hover:text-white" target="_blank" rel="noreferrer">Facebook</a>}
            {config?.instagram && <a href={config.instagram} className="hover:text-white" target="_blank" rel="noreferrer">Instagram</a>}
            {config?.tiktok && <a href={config.tiktok} className="hover:text-white" target="_blank" rel="noreferrer">TikTok</a>}
          </div>
          <Link to="/login" className="inline-block mt-6 text-xs text-brand-300 hover:text-white">
            Acceso al panel administrativo →
          </Link>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-300">
        © {new Date().getFullYear()} {config?.nombre_clinica || 'OdontoAdmin Pro'}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
