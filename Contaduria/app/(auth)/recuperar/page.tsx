"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RecoverPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    setLoading(true);
    try {
      await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success("Si el correo existe, enviamos instrucciones");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {sent ? (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          Revisa tu correo. Si no llega, verifica la configuracion SMTP/Resend en
          el servidor.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar instrucciones
          </Button>
        </form>
      )}

      <p className="text-sm text-center text-muted-foreground">
        <Link href="/login" className="text-primary font-medium hover:underline">
          Volver a iniciar sesion
        </Link>
      </p>
    </div>
  );
}
