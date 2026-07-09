"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { contactoSchema } from "@/lib/validations";
import { whatsappUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormData = z.infer<typeof contactoSchema>;

export function ContactForm({ whatsapp }: { whatsapp?: string | null }) {
  const [loading, setLoading] = useState(false);
  const {
    register, handleSubmit, getValues, reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(contactoSchema) });

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("¡Mensaje enviado! Te contactaremos pronto.");
      reset();
    } catch {
      toast.error("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function enviarWhatsapp() {
    const v = getValues();
    const msg = `Hola! Soy ${v.nombre || ""}. ${v.mensaje || ""}`;
    window.open(whatsappUrl(whatsapp, msg), "_blank");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" {...register("nombre")} placeholder="Tu nombre" />
        {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="celular">Celular</Label>
          <Input id="celular" {...register("celular")} placeholder="300 000 0000" />
          {errors.celular && <p className="text-xs text-destructive">{errors.celular.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="correo">Correo (opcional)</Label>
          <Input id="correo" type="email" {...register("correo")} placeholder="tu@correo.com" />
          {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mensaje">Mensaje</Label>
        <Textarea id="mensaje" rows={4} {...register("mensaje")} placeholder="¿En qué te ayudamos?" />
        {errors.mensaje && <p className="text-xs text-destructive">{errors.mensaje.message}</p>}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" variant="brand" className="flex-1" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar mensaje
        </Button>
        {whatsapp && (
          <Button type="button" variant="outline" onClick={enviarWhatsapp}>
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        )}
      </div>
    </form>
  );
}
