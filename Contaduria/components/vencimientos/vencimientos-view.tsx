"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, CalendarClock, Check } from "lucide-react";
import { deadlineSchema, type DeadlineInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { DEADLINE_STATUS, TASK_PRIORITY, pick } from "@/lib/labels";
import { formatDate, daysUntil } from "@/lib/utils";

type Deadline = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  dueDate: string;
  status: string;
  priority: string;
  clientName: string | null;
};

type Option = { id: string; name: string };

const TYPE_LABEL: Record<string, string> = {
  obligacion: "Obligacion",
  tarea: "Tarea",
  solicitud: "Solicitud",
  cierre_mensual: "Cierre mensual",
  reporte: "Reporte",
  otro: "Otro",
};

export function VencimientosView({ clients }: { clients: Option[] }) {
  const [rows, setRows] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/vencimientos");
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markDone(id: string) {
    await fetch(`/api/vencimientos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cumplido" }),
    });
    toast.success("Marcado como cumplido");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuevo vencimiento</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Sin vencimientos" description="Registra obligaciones, cierres y entregas para no perder ninguna fecha." />
      ) : (
        <div className="space-y-2">
          {rows.map((d) => {
            const days = daysUntil(d.dueDate);
            const overdue = d.status === "pendiente" && days !== null && days < 0;
            return (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${overdue ? "bg-destructive/15 text-destructive" : "bg-secondary text-primary"}`}>
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {TYPE_LABEL[d.type] ?? d.type}
                      {d.clientName && ` · ${d.clientName}`}
                      {" · "}{formatDate(d.dueDate)}
                      {d.status === "pendiente" && days !== null && (
                        <> · {overdue ? `vencido hace ${Math.abs(days)}d` : `en ${days}d`}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={pick(TASK_PRIORITY, d.priority).variant}>{pick(TASK_PRIORITY, d.priority).label}</Badge>
                  <Badge variant={overdue ? "destructive" : pick(DEADLINE_STATUS, d.status).variant}>
                    {overdue ? "Vencido" : pick(DEADLINE_STATUS, d.status).label}
                  </Badge>
                  {d.status === "pendiente" && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={() => markDone(d.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeadlineDialog open={open} onOpenChange={setOpen} onSaved={load} clients={clients} />
    </div>
  );
}

function DeadlineDialog({
  open, onOpenChange, onSaved, clients,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void; clients: Option[];
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<DeadlineInput>({ resolver: zodResolver(deadlineSchema), defaultValues: { type: "otro", priority: "media" } });

  async function onSubmit(data: DeadlineInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/vencimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast.error("No se pudo crear"); return; }
      toast.success("Vencimiento creado");
      reset();
      onOpenChange(false);
      onSaved();
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo vencimiento</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titulo</Label>
            <Input {...register("title")} placeholder="Ej: Declaracion de IVA bimestre 4" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue="otro" onChange={(e) => setValue("type", e.target.value as never)}>
                {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                onChange={(e) => setValue("clientId", e.target.value || null)} defaultValue="">
                <option value="">General (sin cliente)</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha limite</Label>
              <Input type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-xs text-destructive">Fecha requerida</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue="media" onChange={(e) => setValue("priority", e.target.value as never)}>
                {Object.entries(TASK_PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripcion</Label>
            <Textarea {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
