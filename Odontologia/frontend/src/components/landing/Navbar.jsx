/**
 * frontend/src/components/landing/Navbar.jsx
 * Header fijo de la landing con menú, botón de agendar y WhatsApp.
 */
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/equipo', label: 'Equipo' },
  { to: '/galeria', label: 'Galería' },
  { to: '/blog', label: 'Blog' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar({ config }) {
  const [abierto, setAbierto] = useState(false);
  const whatsapp = (config?.whatsapp || '').replace(/[^\d]/g, '');

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-brand-700 text-lg">
          {config?.logo_url ? (
            <img src={config.logo_url} alt="logo" className="h-9 w-9 object-contain" />
          ) : (
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-brand-500 text-white">🦷</span>
          )}
          <span>{config?.nombre_clinica || 'OdontoAdmin Pro'}</span>
        </Link>

        {/* Menú desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-brand-600'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
              💬 WhatsApp
            </a>
          )}
          <Link to="/reservar-cita" className="btn-primary btn-sm">Agendar cita</Link>
        </div>

        {/* Botón móvil */}
        <button className="md:hidden text-2xl text-slate-700" onClick={() => setAbierto(!abierto)}>
          ☰
        </button>
      </div>

      {/* Menú móvil */}
      {abierto && (
        <nav className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setAbierto(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-600'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/reservar-cita" onClick={() => setAbierto(false)} className="btn-primary w-full mt-2">
            Agendar cita
          </Link>
        </nav>
      )}
    </header>
  );
}
