"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UploadCloud, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MONTH_NAMES, formatDate } from "@/lib/utils";

type PublicRequest = {
  id: string;
  clientName: string | null;
  title: string;
  description: string | null;
  typeName: string | null;
  month: number | null;
  year: number | null;
  dueDate: string | null;
  invalid?: string;
};

export default function SubirPage() {
  const { token } = useParams<{ token: string }>();
  const [req, setReq] = useState<PublicRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/solicitudes/public/${token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setReq(d))
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!(fd.get("file") as File)?.size) { toast.error("Selecciona un archivo"); return; }
    setSending(true);
    try {
      const res = await fetch(`/api/solicitudes/public/${token}/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) { toast.error("No se pudo subir el archivo"); return; }
      setDone(true);
    } finally { setSending(false); }
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center font-bold text-xl mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">C</span>
          ContaHub
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : !req || req.invalid ? (
            <div className="text-center py-8">
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="mt-3 font-medium">Enlace no disponible</p>
              <p className="text-sm text-muted-foreground mt-1">
                {req?.invalid ?? "El enlace no existe o fue desactivado."}
              </p>
            </div>
          ) : done ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
              <p className="mt-3 font-medium">Documento recibido</p>
              <p className="text-sm text-muted-foreground mt-1">
                Gracias. Tu contador ha sido notificado. Puedes cerrar esta ventana
                o subir otro documento.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => setDone(false)}>
                Subir otro documento
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Solicitud para {req.clientName}
                </p>
                <h1 className="text-lg font-semibold mt-1">{req.title}</h1>
                {req.description && (
                  <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-3">
                  {req.typeName && <span>Tipo: {req.typeName}</span>}
                  {req.month && <span>Periodo: {MONTH_NAMES[req.month - 1]} {req.year}</span>}
                  {req.dueDate && <span>Vence: {formatDate(req.dueDate)}</span>}
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <input type="hidden" name="month" value={req.month ?? ""} />
                <input type="hidden" name="year" value={req.year ?? ""} />
                <div className="space-y-1.5">
                  <Label>Archivo</Label>
                  <Input name="file" type="file" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Comentario (opcional)</Label>
                  <Textarea name="comment" placeholder="Ej: Extracto de la cuenta de ahorros" />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Enviar documento
                </Button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Enlace seguro · No compartas informacion confidencial fuera de este canal.
        </p>
      </div>
    </div>
  );
}
