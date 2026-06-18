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
import { loginSchema, type LoginForm } from "@/validations/auth.schema";
import { homeByRole } from "@/utils/redirectByRole";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    setServerError(null);
    try {
      const auth = await authService.login(values);
      setSession(auth);
      navigate(homeByRole(auth.user.rol), { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? "No fue posible iniciar sesion");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Link to="/" className="mb-2 flex items-center gap-2 text-primary">
            <HeartPulse className="h-8 w-8" />
            <span className="text-xl font-extrabold">Salud Vital</span>
          </Link>
          <CardTitle>Iniciar sesion</CardTitle>
          <CardDescription>Accede a tu portal de salud</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold text-primary hover:underline">
              Registrate
            </Link>
          </p>

          <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <strong>Demo:</strong> admin@clinica.com / Admin123* · paciente@clinica.com / Paciente123*
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
