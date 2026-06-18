import { Link } from "react-router-dom";
import {
  CalendarPlus,
  FileSearch,
  ClipboardList,
  CreditCard,
  FileHeart,
  MessageCircle,
  HeartPulse,
  Baby,
  ScanFace,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import DoctorsDirectory from "@/components/landing/DoctorsDirectory";
import PqrsfForm from "@/components/forms/PqrsfForm";
import { landingService } from "@/services/landingService";

const accesos = [
  { icon: CalendarPlus, title: "Agendar cita", desc: "Reserva en linea en minutos", to: "/registro" },
  { icon: FileSearch, title: "Consultar resultados", desc: "Accede a tus examenes", to: "/login" },
  { icon: ClipboardList, title: "Preparar examen", desc: "Indicaciones previas", to: "/login" },
  { icon: CreditCard, title: "Pagar factura", desc: "Paga en linea facil", to: "/login" },
  { icon: FileHeart, title: "Historia clinica", desc: "Solicita tu historia", to: "/login" },
  { icon: MessageCircle, title: "WhatsApp", desc: "Hablemos ahora", to: "/login" },
];

const especialidades = [
  { icon: Stethoscope, name: "Medicina General" },
  { icon: HeartPulse, name: "Cardiologia" },
  { icon: Baby, name: "Pediatria" },
  { icon: ScanFace, name: "Dermatologia" },
];

const sedes = [
  { nombre: "Sede Norte", direccion: "Calle 100 #15-20, Bogota", tel: "+57 601 7000001" },
  { nombre: "Sede Centro", direccion: "Carrera 7 #45-10, Bogota", tel: "+57 601 7000002" },
];

export default function LandingPage() {
  // Contenido editable desde el panel admin (con valores por defecto si falla).
  const { data: secciones } = useQuery({
    queryKey: ["landing", "public"],
    queryFn: () => landingService.get(),
  });
  const bloque = (s: string) =>
    (secciones?.find((x) => x.seccion === s)?.contenido ?? {}) as Record<string, string>;
  const hero = bloque("hero");
  const contacto = bloque("contacto");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
              <HeartPulse className="h-4 w-4" /> Tu salud es primero
            </span>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              {hero.titulo ?? "Tu salud en las mejores manos"}
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/90">
              {hero.subtitulo ??
                "Agenda tu cita en linea, consulta resultados y cuida de ti y de tu familia con un equipo medico de confianza."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/registro">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  {hero.cta ?? "Agendar cita"} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  Consultar resultados
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="flex h-72 w-72 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <HeartPulse className="h-40 w-40 text-white/90" strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </section>

      {/* ACCESOS RAPIDOS */}
      <section className="container -mt-12 relative z-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {accesos.map((a) => (
            <Link key={a.title} to={a.to}>
              <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <a.icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.desc}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICIOS / ESPECIALIDADES */}
      <section id="especialidades" className="container py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Nuestras especialidades</h2>
          <p className="mt-2 text-muted-foreground">Atencion integral con profesionales certificados.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {especialidades.map((e) => (
            <Card key={e.name} className="text-center transition-all hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-3 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                  <e.icon className="h-7 w-7" />
                </div>
                <div className="font-semibold">{e.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* DIRECTORIO MEDICO (publico) */}
      <DoctorsDirectory />

      {/* SEDES */}
      <section id="sedes" className="py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Nuestras sedes</h2>
            <p className="mt-2 text-muted-foreground">Encuentranos cerca de ti.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {sedes.map((s) => (
              <Card key={s.nombre}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{s.nombre}</div>
                    <div className="text-sm text-muted-foreground">{s.direccion}</div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-primary">
                      <Phone className="h-4 w-4" /> {s.tel}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PQRSF */}
      <section id="pqrsf" className="bg-clinic-soft py-20">
        <div className="container max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">PQRSF</h2>
            <p className="mt-2 text-muted-foreground">
              Peticiones, quejas, reclamos, sugerencias y felicitaciones. Tu opinion nos ayuda a mejorar.
            </p>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <PqrsfForm requireContact />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="container py-20">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-primary to-secondary p-10 text-white">
              <h3 className="text-2xl font-bold">Hablemos</h3>
              <p className="mt-2 text-white/90">Estamos para ayudarte. Contactanos por cualquier medio.</p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3"><Phone className="h-5 w-5" /> {contacto.telefono ?? "+57 601 7000000"}</div>
                <div className="flex items-center gap-3"><Mail className="h-5 w-5" /> {contacto.email ?? "contacto@saludvital.com"}</div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5" /> {contacto.direccion ?? "Av. Principal 123, Bogota"}</div>
              </div>
            </div>
            <CardContent className="p-10">
              <h3 className="text-xl font-bold">Agenda o escribenos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Registrate para agendar tu cita o envia una PQRSF desde tu portal.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link to="/registro"><Button className="w-full">Crear cuenta y agendar</Button></Link>
                <Link to="/login"><Button variant="outline" className="w-full">Ya tengo cuenta</Button></Link>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>
    </div>
  );
}
