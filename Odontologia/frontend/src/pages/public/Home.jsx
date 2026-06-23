// frontend/src/pages/public/Home.jsx
// Landing principal: hero, servicios, confianza, equipo, galería, testimonios, proceso y FAQ.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviciosService } from '../../services/serviciosService';
import { odontologosService } from '../../services/odontologosService';
import { contenidoService } from '../../services/contenidoService';
import { useConfiguracion } from '../../hooks/useConfiguracion';

const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const RAZONES = [
  { icono: '🔬', titulo: 'Tecnología moderna', texto: 'Equipos de última generación para diagnósticos precisos.' },
  { icono: '💙', titulo: 'Atención humanizada', texto: 'Te escuchamos y acompañamos en cada paso.' },
  { icono: '🎓', titulo: 'Profesionales certificados', texto: 'Odontólogos con amplia experiencia y especialización.' },
  { icono: '💳', titulo: 'Planes de pago', texto: 'Financiación flexible para tu tratamiento.' },
  { icono: '🛋️', titulo: 'Instalaciones cómodas', texto: 'Un espacio diseñado para tu tranquilidad.' },
  { icono: '🧼', titulo: 'Bioseguridad', texto: 'Protocolos estrictos de esterilización y limpieza.' },
];

const PROCESO = [
  { n: 1, t: 'Agenda tu cita', d: 'En línea o por WhatsApp.' },
  { n: 2, t: 'Valoración', d: 'Evaluamos tu salud bucal.' },
  { n: 3, t: 'Diagnóstico', d: 'Te explicamos tu estado.' },
  { n: 4, t: 'Aprueba tu plan', d: 'Conoce costos y opciones.' },
  { n: 5, t: 'Inicia tratamiento', d: 'Comenzamos a cuidarte.' },
  { n: 6, t: 'Seguimiento', d: 'Controles y mantenimiento.' },
];

export default function Home() {
  const { config } = useConfiguracion();
  const [servicios, setServicios] = useState([]);
  const [equipo, setEquipo] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqAbierta, setFaqAbierta] = useState(null);

  useEffect(() => {
    serviciosService.listarPublicos().then(({ data }) => setServicios(data.datos || [])).catch(() => {});
    odontologosService.listarPublicos().then(({ data }) => setEquipo(data.datos || [])).catch(() => {});
    contenidoService.listarGaleria().then(({ data }) => setGaleria(data.datos || [])).catch(() => {});
    contenidoService.listarTestimonios().then(({ data }) => setTestimonios(data.datos || [])).catch(() => {});
    contenidoService.listarFaqs().then(({ data }) => setFaqs(data.datos || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-teal-600 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div className="animate-fadeUp">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
              🦷 Clínica odontológica de confianza
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              {config.eslogan}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/90">
              Agenda tu valoración odontológica y recibe atención profesional en un espacio moderno, cómodo y seguro.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/reservar-cita" className="btn bg-white text-brand-600 hover:bg-slate-100 shadow-lg">
                Agendar cita
              </Link>
              <a
                href={`https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-white/60 text-white hover:bg-white/10"
              >
                Escribir por WhatsApp
              </a>
            </div>

            {/* Indicadores de confianza */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ['+5.000', 'Pacientes'],
                ['+10', 'Años de experiencia'],
                ['+12.000', 'Tratamientos'],
                ['4.9★', 'Calificación'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-extrabold">{v}</p>
                  <p className="text-xs text-white/80">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="flex h-80 w-80 items-center justify-center rounded-[2.5rem] bg-white/10 text-[10rem] backdrop-blur">
              🦷
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SERVICIOS ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-ink">Nuestros servicios</h2>
          <p className="mt-2 text-slate-500">Soluciones integrales para tu salud y estética dental.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <div key={s.id} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-2xl">🦷</div>
              <h3 className="text-lg font-bold text-ink">{s.nombre}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.descripcion_corta}</p>
              {s.precio_base > 0 && (
                <p className="mt-3 text-sm font-semibold text-brand-600">Desde {peso(s.precio_base)}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Link to={`/servicios/${s.id}`} className="btn-outline text-xs">Ver más</Link>
                <Link to="/reservar-cita" className="btn-primary text-xs">Agendar</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CONFIANZA ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-ink">¿Por qué elegirnos?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RAZONES.map((r) => (
              <div key={r.titulo} className="flex gap-4 rounded-2xl border border-slate-100 p-5">
                <span className="text-3xl">{r.icono}</span>
                <div>
                  <h3 className="font-semibold text-ink">{r.titulo}</h3>
                  <p className="text-sm text-slate-500">{r.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- EQUIPO ---------------- */}
      {equipo.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-ink">Nuestro equipo</h2>
            <p className="mt-2 text-slate-500">Profesionales comprometidos con tu sonrisa.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {equipo.map((o) => (
              <div key={o.id} className="card overflow-hidden text-center">
                <div className="flex h-40 items-center justify-center bg-brand-50 text-6xl">
                  {o.foto_url ? <img src={o.foto_url} alt={o.nombre} className="h-full w-full object-cover" /> : '👨‍⚕️'}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-ink">{o.nombre}</h3>
                  <p className="text-sm text-brand-600">{o.especialidad || 'Odontología'}</p>
                  <Link to="/reservar-cita" className="btn-outline mt-3 w-full text-xs">Agendar</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- GALERÍA ---------------- */}
      {galeria.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-ink">Galería</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {galeria.slice(0, 8).map((g) => (
                <div key={g.id} className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                  <img src={g.imagen_url} alt={g.titulo || 'Galería'} className="h-full w-full object-cover transition hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- TESTIMONIOS ---------------- */}
      {testimonios.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-ink">Lo que dicen nuestros pacientes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonios.slice(0, 6).map((t) => (
              <div key={t.id} className="card p-6">
                <p className="text-amber-400">{'★'.repeat(t.calificacion)}{'☆'.repeat(5 - t.calificacion)}</p>
                <p className="mt-3 text-sm italic text-slate-600">“{t.comentario}”</p>
                <p className="mt-4 font-semibold text-ink">{t.nombre}</p>
                {t.servicio && <p className="text-xs text-slate-400">{t.servicio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- PROCESO ---------------- */}
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">¿Cómo es el proceso?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESO.map((p) => (
              <div key={p.n} className="flex gap-4 rounded-2xl bg-white/5 p-5">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-semibold">{p.t}</h3>
                  <p className="text-sm text-slate-400">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      {faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-ink">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="card overflow-hidden">
                <button
                  onClick={() => setFaqAbierta(faqAbierta === f.id ? null : f.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-ink"
                >
                  {f.pregunta}
                  <span className="text-brand-500">{faqAbierta === f.id ? '−' : '+'}</span>
                </button>
                {faqAbierta === f.id && <p className="px-5 pb-4 text-sm text-slate-600">{f.respuesta}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- CTA FINAL ---------------- */}
      <section className="bg-gradient-to-r from-brand-500 to-teal-600 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-bold">¿Listo para tu mejor sonrisa?</h2>
          <p className="mt-3 text-white/90">Agenda hoy tu valoración y da el primer paso.</p>
          <Link to="/reservar-cita" className="btn mt-6 bg-white text-brand-600 hover:bg-slate-100">
            Agendar cita ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
