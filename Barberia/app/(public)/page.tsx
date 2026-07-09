import Link from "next/link";
import {
  CalendarPlus, Scissors, MessageCircle, MapPin, ArrowRight,
  Award, Sparkles, Clock, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/public/ServiceCard";
import { BarberCard } from "@/components/public/BarberCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { PromoCard } from "@/components/public/PromoCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { Faq } from "@/components/public/Faq";
import {
  getConfiguracion, getServicios, getBarberos,
  getTestimonios, getPromociones, getGaleria,
} from "@/lib/queries";
import { whatsappUrl } from "@/lib/utils";

const VENTAJAS = [
  { icon: Award, title: "Barberos expertos", desc: "Profesionales certificados con años de experiencia." },
  { icon: Sparkles, title: "Productos premium", desc: "Trabajamos con las mejores marcas del mercado." },
  { icon: Clock, title: "Sin esperas", desc: "Reserva online y respetamos tu horario." },
  { icon: ShieldCheck, title: "Ambiente top", desc: "Un espacio pensado para tu comodidad y estilo." },
];

export default async function HomePage() {
  const [config, destacados, barberos, testimonios, promos, galeria] = await Promise.all([
    getConfiguracion(),
    getServicios(true),
    getBarberos(true),
    getTestimonios(),
    getPromociones(true),
    getGaleria(),
  ]);

  const nombre = config?.nombre_comercial ?? "BarberPro Studio";
  const heroImg = config?.hero_imagen_url ??
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80";

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] w-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="container relative z-10 flex min-h-[92vh] flex-col justify-center py-20">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
              <Scissors className="h-4 w-4" /> {nombre}
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl md:text-7xl">
              {config?.landing_titulo ?? "Donde tu estilo cobra vida"}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              {config?.landing_subtitulo ?? config?.eslogan ?? "Reserva tu cita en segundos y vive la experiencia de una barbería premium."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="lg">
                <Link href="/reservar"><CalendarPlus className="h-5 w-5" /> Reservar cita</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Link href="/servicios">Ver servicios</Link>
              </Button>
              {config?.whatsapp && (
                <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  <a href={whatsappUrl(config.whatsapp, config.mensaje_whatsapp)} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-5 w-5" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="border-b border-white/10 py-16">
        <div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VENTAJAS.map((v) => (
            <div key={v.title} className="flex flex-col items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICIOS DESTACADOS */}
      {destacados.length > 0 && (
        <section className="py-20">
          <div className="container">
            <SectionHeading eyebrow="Nuestros servicios" title="Cortes y servicios destacados"
              subtitle="Elige entre nuestra carta de servicios premium." />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destacados.slice(0, 6).map((s) => <ServiceCard key={s.id} servicio={s} />)}
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/servicios">Ver todos los servicios <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* POR QUE ELEGIRNOS */}
      <section className="border-y border-white/10 bg-card/30 py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={galeria[0]?.imagen_url ?? heroImg} alt="Barbería" className="h-full w-full object-cover" />
          </div>
          <div>
            <SectionHeading center={false} eyebrow="Por qué elegirnos"
              title={`Más que un corte, una experiencia`} />
            <p className="mt-4 text-muted-foreground">
              {config?.landing_por_que_texto ?? "Barberos certificados, productos de alta gama y un ambiente pensado para que salgas renovado."}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {VENTAJAS.map((v) => (
                <div key={v.title} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{v.title}</span>
                </div>
              ))}
            </div>
            <Button asChild variant="brand" size="lg" className="mt-8">
              <Link href="/reservar">Reserva ahora <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* BARBEROS */}
      {barberos.length > 0 && (
        <section className="py-20">
          <div className="container">
            <SectionHeading eyebrow="El equipo" title="Nuestros barberos"
              subtitle="Manos expertas para el estilo que buscas." />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {barberos.map((b) => <BarberCard key={b.id} barbero={b} />)}
            </div>
          </div>
        </section>
      )}

      {/* GALERIA */}
      {galeria.length > 0 && (
        <section className="border-y border-white/10 py-20">
          <div className="container">
            <SectionHeading eyebrow="Galería" title="Nuestros trabajos" subtitle="Estilos que hablan por sí solos." />
            <div className="mt-12 columns-2 gap-4 md:columns-3 lg:columns-4 [&>div]:mb-4">
              {galeria.slice(0, 8).map((g) => (
                <div key={g.id} className="overflow-hidden rounded-xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imagen_url} alt={g.titulo ?? "Trabajo"} className="w-full object-cover transition-transform hover:scale-105" />
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline"><Link href="/galeria">Ver galería completa</Link></Button>
            </div>
          </div>
        </section>
      )}

      {/* PROMOCIONES */}
      {promos.length > 0 && (
        <section className="py-20">
          <div className="container">
            <SectionHeading eyebrow="Ofertas" title="Promociones activas" subtitle="Aprovecha nuestros precios especiales." />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((p) => <PromoCard key={p.id} promo={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIOS */}
      {testimonios.length > 0 && (
        <section className="border-y border-white/10 bg-card/30 py-20">
          <div className="container">
            <SectionHeading eyebrow="Testimonios" title="Lo que dicen nuestros clientes" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonios.slice(0, 6).map((t) => <TestimonialCard key={t.id} testimonio={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20">
        <div className="container">
          <SectionHeading eyebrow="FAQ" title="Preguntas frecuentes" />
          <div className="mt-12"><Faq /></div>
        </div>
      </section>

      {/* UBICACION / CTA */}
      <section className="border-t border-white/10 py-20">
        <div className="container">
          <div className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-card to-background p-8 sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold">¿Listo para tu próximo corte?</h2>
                <p className="mt-3 text-muted-foreground">
                  Reserva tu cita ahora y déjate atender por los mejores.
                </p>
                {config?.direccion && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-brand" /> {config.direccion}{config.ciudad ? `, ${config.ciudad}` : ""}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="brand" size="lg">
                    <Link href="/reservar"><CalendarPlus className="h-5 w-5" /> Reservar cita</Link>
                  </Button>
                  {config?.google_maps_url && (
                    <Button asChild variant="outline" size="lg">
                      <a href={config.google_maps_url} target="_blank" rel="noreferrer">
                        <MapPin className="h-4 w-4" /> Cómo llegar
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="aspect-video overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImg} alt="Ubicación" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
