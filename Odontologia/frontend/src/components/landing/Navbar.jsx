// frontend/src/components/landing/Navbar.jsx
// Header fijo de la landing con menú responsive y CTA de agendar.

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useConfiguracion } from '../../hooks/useConfiguracion';

const enlaces = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/equipo', label: 'Equipo' },
  { to: '/galeria', label: 'Galería' },
  { to: '/blog', label: 'Blog' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const { config } = useConfiguracion();
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white text-lg">🦷</span>
          <span className="text-lg font-extrabold text-ink">{config.nombre_clinica}</span>
        </Link>

        {/* Menú escritorio */}
        <nav className="hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              end={e.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                }`
              }
            >
              {e.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA escritorio */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href={`https://wa.me/${config.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-green-600"
          >
            WhatsApp
          </a>
          <Link to="/reservar-cita" className="btn-primary">Agendar cita</Link>
        </div>

        {/* Botón móvil */}
        <button className="md:hidden text-2xl text-ink" onClick={() => setAbierto(!abierto)} aria-label="Menú">
          ☰
        </button>
      </div>

      {/* Menú móvil */}
      {abierto && (
        <nav className="md:hidden border-t border-slate-100 bg-white px-4 py-3">
          {enlaces.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              end={e.to === '/'}
              onClick={() => setAbierto(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {e.label}
            </NavLink>
          ))}
          <Link to="/reservar-cita" onClick={() => setAbierto(false)} className="btn-primary mt-2 w-full">
            Agendar cita
          </Link>
        </nav>
      )}
    </header>
  );
}
