"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, Send, Copy, Lock, Inbox } from "lucide-react";
import { requestSchema, type RequestInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { REQUEST_STATUS, pick } from "@/lib/labels";
import { formatDate, MONTH_NAMES } from "@/lib/utils";

type Req = {
  id: string;
  title: string;
  status: string;
  clientName: string | null;
  typeName: string | null;
  month: number | null;
  year: number | null;
  dueDate: string | null;
  token: string;
  tokenActive: boolean;
};

type Option = { id: string; name: string };

export function SolicitudesView({
  clients, documentTypes, appUrl,
}: {
  clients: Option[]; documentTypes: Option[]; appUrl: string;
}) {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/solicitudes");
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function send(id: string) {
    const res = await fetch(`/api/solicitudes/${id}/enviar`, { method: "POST" });
    if (res.ok) { toast.success("Solicitud enviada"); load(); }
  }
  async function close(id: string) {
    const res = await fetch(`/api/solicitudes/${id}/cerrar`, { method: "POST" });
    if (res.ok) { toast.success("Solicitud cerrada"); load(); }
  }
  function copyLink(token: string) {
    navigator.clipboard.writeText(`${appUrl}/subir/${token}`);
    toast.success("Link copiado al portapapeles");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nueva solicitud</Button>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="Sin solicitudes" description="Crea una solicitud y comparte el link seguro con tu cliente para recibir documentos." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitud</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{r.title}</p>
                    {r.typeName && <p className="text-xs text-muted-foreground">{r.typeName}</p>}
                  </TableCell>
                  <TableCell className="text-sm">{r.clientName ?? "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.month ? `${MONTH_NAMES[r.month - 1]} ${r.year ?? ""}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={pick(REQUEST_STATUS, r.status).variant}>
                      {pick(REQUEST_STATUS, r.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Copiar link" onClick={() => copyLink(r.token)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      {(r.status === "borrador") && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" title="Enviar" onClick={() => send(r.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {r.status !== "cerrada" && r.status !== "cancelada" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" title="Cerrar" onClick={() => close(r.id)}>
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <RequestDialog open={open} onOpenChange={setOpen} onSaved={load} clients={clients} documentTypes={documentTypes} />
    </div>
  );
}

function RequestDialog({
  open, onOpenChange, onSaved, clients, documentTypes,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void;
  clients: Option[]; documentTypes: Option[];
}) {
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<RequestInput>({ resolver: zodResolver(requestSchema) });

  async function onSubmit(data: RequestInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast.error("No se pudo crear"); return; }
      toast.success("Solicitud creada");
      reset();
      onOpenChange(false);
      onSaved();
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva solicitud</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              onChange={(e) => setValue("clientId", e.target.value)} defaultValue="">
              <option value="" disabled>Selecciona...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.clientId && <p className="text-xs text-destructive">Selecciona un cliente</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Titulo</Label>
            <Input {...register("title")} placeholder="Ej: Subir extractos bancarios de Julio" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Descripcion</Label>
            <Textarea {...register("description")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-3">
              <Label>Tipo de documento esperado</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                onChange={(e) => setValue("documentTypeId", e.target.value || null)} defaultValue="">
                <option value="">Cualquiera</option>
                {documentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Mes</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={now.getMonth() + 1}
                onChange={(e) => setValue("month", Number(e.target.value))}>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Input type="number" defaultValue={now.getFullYear()}
                onChange={(e) => setValue("year", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha limite</Label>
              <Input type="date" {...register("dueDate")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Crear solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
