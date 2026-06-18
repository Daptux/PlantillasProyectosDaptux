import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { registerSchema, type RegisterForm } from "@/validations/auth.schema";
import { homeByRole } from "@/utils/redirectByRole";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    setServerError(null);
    try {
      const auth = await authService.registerPatient({ ...values, clinica_id: 1 });
      setSession(auth);
      navigate(homeByRole(auth.user.rol), { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? "No fue posible registrarte");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <Link to="/" className="mb-2 flex items-center gap-2 text-primary">
            <HeartPulse className="h-8 w-8" />
            <span className="text-xl font-extrabold">Salud Vital</span>
          </Link>
          <CardTitle>Crear cuenta de paciente</CardTitle>
          <CardDescription>Registrate para agendar citas y ver tus resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombres</label>
                <Input placeholder="Laura" {...register("nombres")} />
                {errors.nombres && <p className="mt-1 text-xs text-destructive">{errors.nombres.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Apellidos</label>
                <Input placeholder="Gomez" {...register("apellidos")} />
                {errors.apellidos && <p className="mt-1 text-xs text-destructive">{errors.apellidos.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">No. documento</label>
                <Input placeholder="1010101010" {...register("numero_documento")} />
                {errors.numero_documento && <p className="mt-1 text-xs text-destructive">{errors.numero_documento.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Telefono</label>
                <Input placeholder="+57 300..." {...register("telefono")} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input type="email" placeholder="tu@email.com" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contrasena</label>
              <Input type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {serverError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Inicia sesion
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
