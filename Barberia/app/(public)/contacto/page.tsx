import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { SectionHeading } from "@/components/public/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";
import { getConfiguracion } from "@/lib/queries";
import { whatsappUrl } from "@/lib/utils";
import { DIAS_SEMANA } from "@/lib/constants";

export const metadata = { title: "Contacto" };

export default async function ContactoPage() {
  const config = await getConfiguracion();
  const horarios = (config?.horarios ?? {}) as Record<string, { abre: string; cierra: string; cerrado: boolean }>;

  return (
    <div className="py-16 sm:py-20">
      <div className="container">
        <SectionHeading eyebrow="Contacto" title="Hablemos"
          subtitle="¿Dudas o quieres agendar? Escríbenos y te respondemos rápido." />

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {/* Info */}
          <div className="space-y-6">
            {config?.direccion && (
              <InfoItem icon={MapPin} title="Dirección">
                {config.direccion}{config.ciudad ? `, ${config.ciudad}` : ""}
              </InfoItem>
            )}
            {config?.telefono && (
              <InfoItem icon={Phone} title="Teléfono">{config.telefono}</InfoItem>
            )}
            {config?.correo && (
              <InfoItem icon={Mail} title="Correo">{config.correo}</InfoItem>
            )}
            {config?.whatsapp && (
              <InfoItem icon={MessageCircle} title="WhatsApp">
                <a href={whatsappUrl(config.whatsapp, config.mensaje_whatsapp)} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                  Escríbenos por WhatsApp
                </a>
              </InfoItem>
            )}
            <div className="rounded-xl border border-white/10 bg-card p-5">
              <h4 className="mb-3 flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-brand" /> Horarios</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {DIAS_SEMANA.slice(1).concat(DIAS_SEMANA[0]).map((dia) => {
                  const h = horarios[dia];
                  return (
                    <li key={dia} className="flex justify-between capitalize">
                      <span>{dia}</span>
                      <span>{!h || h.cerrado ? "Cerrado" : `${h.abre} - ${h.cierra}`}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-white/10 bg-card p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold">Envíanos un mensaje</h3>
            <p className="mt-1 text-sm text-muted-foreground">Dejanos tus datos y te contactamos.</p>
            <div className="mt-6">
              <ContactForm whatsapp={config?.whatsapp} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
