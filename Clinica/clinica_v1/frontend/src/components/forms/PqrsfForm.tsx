import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pqrsfService } from "@/services/pqrsfService";
import { TIPO_PQRSF_LABEL, TIPOS_PQRSF } from "@/lib/pqrsf";
import { getApiError } from "@/lib/apiError";
import type { TipoPqrsf } from "@/types";

interface Props {
  /** Si es true (landing anonima) pide datos de contacto del remitente. */
  requireContact?: boolean;
}

/** Formulario de PQRSF reutilizable (landing publica y portal del paciente). */
export default function PqrsfForm({ requireContact = false }: Props) {
  const qc = useQueryClient();
  const [tipo, setTipo] = useState<TipoPqrsf>("PETICION");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      pqrsfService.create({
        tipo,
        asunto,
        mensaje,
        ...(requireContact ? { nombre_remitente: nombre, email_remitente: email, telefono_remitente: telefono } : {}),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pqrsf"] }),
    onError: (e) => setError(getApiError(e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (asunto.trim().length < 3) { setError("El asunto es requerido"); return; }
    if (mensaje.trim().length < 5) { setError("El mensaje es muy corto"); return; }
    if (requireContact && nombre.trim().length < 2) { setError("Tu nombre es requerido"); return; }
    mut.mutate();
  };

  if (mut.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h3 className="text-lg font-bold">¡Gracias por contactarnos!</h3>
        <p className="text-sm text-muted-foreground">Hemos recibido tu solicitud. Te responderemos pronto.</p>
        <Button variant="outline" onClick={() => mut.reset()}>Enviar otra</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoPqrsf)}>
            {TIPOS_PQRSF.map((t) => <option key={t} value={t}>{TIPO_PQRSF_LABEL[t]}</option>)}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Asunto</Label>
          <Input value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Resumen de tu solicitud" />
        </div>
      </div>

      {requireContact && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefono</Label>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Mensaje</Label>
        <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="min-h-[120px]" placeholder="Cuentanos en detalle..." />
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={mut.isPending}>
        <Send className="h-4 w-4" /> {mut.isPending ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
