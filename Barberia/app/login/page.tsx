import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";
import { getConfiguracion } from "@/lib/queries";
import { Scissors } from "lucide-react";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const config = await getConfiguracion().catch(() => null);
  const nombre = config?.nombre_comercial ?? "BarberPro Studio";

  return (
    <div className="dark min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      {/* Panel visual */}
      <div className="relative hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              config?.hero_imagen_url ??
              "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1400&q=80"
            })`,
          }}
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <div className="flex items-center gap-2 text-brand">
            <Scissors className="h-7 w-7" />
            <span className="font-display text-2xl font-bold">{nombre}</span>
          </div>
          <p className="mt-4 max-w-md text-lg text-white/80">
            {config?.eslogan ?? "Estilo, precisión y actitud. Gestiona tu barbería como un profesional."}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Scissors className="h-6 w-6 text-brand" />
            <span className="font-display text-xl font-bold">{nombre}</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Bienvenido de nuevo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa a tu panel administrativo.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-40" />}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿Problemas para ingresar? Contacta al administrador de tu barbería.
          </p>
        </div>
      </div>
    </div>
  );
}
