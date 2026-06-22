/**
 * frontend/src/pages/public/Home.jsx
 * Landing principal con todas las secciones de captación de pacientes.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLandingConfig } from '../../layouts/PublicLayout';
import { serviciosService } from '../../services/serviciosService';
import { odontologosService } from '../../services/odontologosService';
import { contenidoService } from '../../services/contenidoService';
import { formatoMoneda } from '../../utils/format';

const confianza = [
  { icono: '🔬', titulo: 'Tecnología moderna', texto: 'Equipos de última generación para diagnósticos precisos.' },
  { icono: '💙', titulo: 'Atención humanizada', texto: 'Te acompañamos en cada paso de tu tratamiento.' },
  { icono: '🎓', titulo: 'Profesionales certificados', texto: 'Odontólogos especializados y con experiencia.' },
  { icono: '💳', titulo: 'Planes de pago', texto: 'Financiación flexible adaptada a ti.' },
  { icono: '🏥', titulo: 'Instalaciones cómodas', texto: 'Un espacio diseñado para tu bienestar.' },
  { icono: '🧼', titulo: 'Bioseguridad', texto: 'Protocolos estrictos de esterilización.' },
];

const proceso = [
  { paso: '1', titulo: 'Agenda tu cita', texto: 'En línea, por WhatsApp o por teléfono.' },
  { paso: '2', titulo: 'Asiste a valoración', texto: 'Evaluamos tu salud bucal a fondo.' },
  { paso: '3', titulo: 'Recibe diagnóstico', texto: 'Te explicamos tu situación con claridad.' },
  { paso: '4', titulo: 'Aprueba tu plan', texto: 'Presupuesto transparente y a tu medida.' },
  { paso: '5', titulo: 'Inicia tratamiento', texto: 'Atención profesional y cómoda.' },
  { paso: '6', titulo: 'Recibe seguimiento', texto: 'Cuidamos tu sonrisa a largo plazo.' },
];

export default function Home() {
  const { config } = useLandingConfig() || {};
  const [servicios, setServicios] = useState([]);
  const [equipo, setEquipo] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqAbierta, setFaqAbierta] = useState(null);

  useEffect(() => {
    serviciosService.listarPublicos().then((r) => setServicios(r.data)).catch(() => {});
    odontologosService.listarPublicos().then((r) => setEquipo(r.data)).catch(() => {});
    contenidoService.testimonios(true).then((r) => setTestimonios(r.data)).catch(() => {});
    contenidoService.faqs(true).then((r) => setFaqs(r.data)).catch(() => {});
  }, []);

  const stats = [
    { valor: config?.stat_pacientes || '5.000+', label: 'Pacientes atendidos' },
    { valor: config?.stat_experiencia || '12 años', label: 'De experiencia' },
    { valor: config?.stat_tratamientos || '15.000+', label: 'Tratamientos' },
    { valor: config?.stat_calificacion || '4.9/5', label: 'Calificación' },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeUp">
            <span className="badge bg-teal-100 text-teal-700 mb-4">Clínica odontológica moderna</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight">
              {config?.hero_titulo || 'Sonrisas saludables, tratamientos confiables y atención personalizada'}
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              {config?.hero_subtitulo ||
                'Agenda tu valoración odontológica y recibe atención profesional en un espacio moderno, cómodo y seguro.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/reservar-cita" className="btn-primary">Agendar cita</Link>
              {config?.whatsapp && (
                <a href={`https://wa.me/${config.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="btn-outline">
                  💬 Escribir por WhatsApp
                </a>
              )}
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-brand-600">{s.valor}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fadeUp">
            <img
              src={config?.hero_imagen_url || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80'}
              alt="Odontología profesional"
              className="rounded-3xl shadow-soft object-cover w-full h-[420px]"
            />
          </div>
        </div>
      </section>

      {/* SERVICIOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800">Nuestros servicios</h2>
          <p className="text-slate-500 mt-3">Tratamientos integrales para cuidar y transformar tu sonrisa.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((s) => (
            <div key={s.id} className="card p-6 hover:shadow-soft hover:-translate-y-1 transition">
              <div className="h-12 w-12 grid place-items-center rounded-xl bg-brand-50 text-2xl mb-4">🦷</div>
              <h3 className="font-bold text-slate-800 text-lg">{s.nombre}</h3>
              <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{s.descripcion_corta}</p>
              {s.precio_base > 0 && (
                <p className="text-brand-600 font-semibold mt-3 text-sm">Desde {formatoMoneda(s.precio_base)}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Link to={`/servicios/${s.id}`} className="btn-ghost btn-sm">Ver más</Link>
                <Link to="/reservar-cita" className="btn-primary btn-sm">Agendar</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIANZA */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800">¿Por qué elegirnos?</h2>
            <p className="text-slate-500 mt-3">Tu confianza es nuestra prioridad.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {confianza.map((c) => (
              <div key={c.titulo} className="card p-6 flex gap-4">
                <div className="text-3xl">{c.icono}</div>
                <div>
                  <h3 className="font-bold text-slate-800">{c.titulo}</h3>
                  <p className="text-sm text-slate-500 mt-1">{c.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      {equipo.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800">Nuestro equipo</h2>
            <p className="text-slate-500 mt-3">Profesionales comprometidos con tu sonrisa.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipo.map((o) => (
              <div key={o.id} className="card overflow-hidden text-center hover:shadow-soft transition">
                <img
                  src={o.foto_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80'}
                  alt={o.nombre}
                  className="h-56 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-bold text-slate-800">{o.nombre}</h3>
                  <p className="text-sm text-brand-600">{o.especialidad}</p>
                  <Link to="/reservar-cita" className="btn-outline btn-sm mt-4">Agendar</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROCESO */}
      <section className="bg-brand-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold">Proceso de atención</h2>
            <p className="text-brand-200 mt-3">Así de fácil es comenzar tu tratamiento.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proceso.map((p) => (
              <div key={p.paso} className="bg-brand-800/50 rounded-2xl p-6 border border-brand-700">
                <div className="h-10 w-10 grid place-items-center rounded-full bg-teal-500 font-bold mb-4">{p.paso}</div>
                <h3 className="font-bold">{p.titulo}</h3>
                <p className="text-sm text-brand-200 mt-1">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      {testimonios.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800">Lo que dicen nuestros pacientes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonios.map((t) => (
              <div key={t.id} className="card p-6">
                <div className="text-amber-400 mb-3">{'★'.repeat(t.calificacion)}{'☆'.repeat(5 - t.calificacion)}</div>
                <p className="text-slate-600 italic">"{t.comentario}"</p>
                <div className="mt-4">
                  <p className="font-bold text-slate-800">{t.nombre}</p>
                  {t.servicio && <p className="text-xs text-brand-600">{t.servicio}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-800">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="card overflow-hidden">
                  <button
                    onClick={() => setFaqAbierta(faqAbierta === f.id ? null : f.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-slate-800"
                  >
                    {f.pregunta}
                    <span className="text-brand-500">{faqAbierta === f.id ? '−' : '+'}</span>
                  </button>
                  {faqAbierta === f.id && <div className="px-5 pb-4 text-slate-600 text-sm">{f.respuesta}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-brand-600 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold">¿Listo para transformar tu sonrisa?</h2>
          <p className="mt-3 text-brand-100">Agenda tu valoración hoy mismo y da el primer paso.</p>
          <Link to="/reservar-cita" className="inline-block mt-8 bg-white text-brand-700 font-bold rounded-xl px-8 py-3 hover:bg-brand-50 transition">
            Agendar mi cita
          </Link>
        </div>
      </section>
    </div>
  );
}
