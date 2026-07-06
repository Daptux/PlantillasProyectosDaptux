import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel izquierdo (branding) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            C
          </span>
          ContaHub
        </Link>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Deja de perseguir documentos. Automatiza el control mensual de tus
            clientes.
          </h2>
          <ul className="space-y-3 text-primary-foreground/90">
            {[
              "Sabes al instante que cliente esta atrasado",
              "Solicitas documentos con un link seguro",
              "Checklist mensual automatico por cliente",
              "Reportes profesionales en PDF y Excel",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/70">
          ContaHub · Gestion contable-administrativa
        </p>
      </div>

      {/* Panel derecho (formulario) */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
