import Link from "next/link";
import { Scissors, Instagram, Facebook, MapPin, Phone, Mail, Clock } from "lucide-react";
import { PUBLIC_NAV, DIAS_SEMANA } from "@/lib/constants";
import type { ConfiguracionBarberia } from "@/types/database";

export function PublicFooter({ config }: { config: ConfiguracionBarberia | null }) {
  const nombre = config?.nombre_comercial ?? "BarberPro Studio";
  const horarios = config?.horarios ?? {};

  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-brand" />
            <span className="font-display text-lg font-bold">{nombre}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {config?.eslogan ?? "Estilo, precisión y actitud."}
          </p>
          <div className="mt-4 flex gap-3">
            {config?.instagram && (
              <a href={config.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {config?.facebook && (
              <a href={config.facebook} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand">
                <Facebook className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Navegación</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {config?.direccion && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{config.direccion}{config.ciudad ? `, ${config.ciudad}` : ""}</span>
              </li>
            )}
            {config?.telefono && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand" /> {config.telefono}
              </li>
            )}
            {config?.correo && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand" /> {config.correo}
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <Clock className="h-4 w-4 text-brand" /> Horarios
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {DIAS_SEMANA.slice(1).concat(DIAS_SEMANA[0]).map((dia) => {
              const h = (horarios as Record<string, { abre: string; cierra: string; cerrado: boolean }>)[dia];
              return (
                <li key={dia} className="flex justify-between gap-4 capitalize">
                  <span>{dia}</span>
                  <span>{!h || h.cerrado ? "Cerrado" : `${h.abre} - ${h.cierra}`}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {nombre}. Todos los derechos reservados.</span>
          <span>Powered by <span className="text-brand">BarberPro Studio</span></span>
        </div>
      </div>
    </footer>
  );
}
