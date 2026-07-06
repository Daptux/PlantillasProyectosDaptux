"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, CheckCircle2, Clock } from "lucide-react";
import { taskSchema, type TaskInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { TASK_PRIORITY, TASK_STATUS, pick } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  clientName: string | null;
  assignedName: string | null;
};

type Option = { id: string; name: string };

const COLUMNS = [
  { key: "pendiente", label: "Pendiente" },
  { key: "en_proceso", label: "En proceso" },
  { key: "completada", label: "Completada" },
  { key: "vencida", label: "Vencida" },
];

export function TareasView({ clients, users }: { clients: Option[]; users: Option[] }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/tareas");
    const data = await res.json();
    setTasks(data.rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/tareas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Tarea actualizada");
    load();
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nueva tarea</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-xl border bg-muted/30 p-3">
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="muted">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div key={t.id} className="rounded-lg border bg-card p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{t.title}</p>
                      <Badge variant={pick(TASK_PRIORITY, t.priority).variant}>
                        {pick(TASK_PRIORITY, t.priority).label}
                      </Badge>
                    </div>
                    {t.clientName && (
                      <p className="mt-1 text-xs text-muted-foreground">{t.clientName}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(t.dueDate)}
                      </span>
                      <span>{t.assignedName ?? "Sin asignar"}</span>
                    </div>
                    {t.status !== "completada" && (
                      <div className="mt-2 flex gap-1">
                        {t.status !== "en_proceso" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => changeStatus(t.id, "en_proceso")}>
                            En proceso
                          </Button>
                        )}
                        <Button size="sm" variant="success" className="h-7 text-xs" onClick={() => changeStatus(t.id, "completada")}>
                          <CheckCircle2 className="h-3 w-3" /> Completar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">Sin tareas</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog open={open} onOpenChange={setOpen} onSaved={load} clients={clients} users={users} />
    </div>
  );
}

function TaskDialog({
  open, onOpenChange, onSaved, clients, users,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void;
  clients: Option[]; users: Option[];
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<TaskInput>({
      resolver: zodResolver(taskSchema),
      defaultValues: { priority: "media", status: "pendiente", taskType: "otra" },
    });

  async function onSubmit(data: TaskInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast.error("No se pudo crear la tarea"); return; }
      toast.success("Tarea creada");
      reset();
      onOpenChange(false);
      onSaved();
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titulo</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Descripcion</Label>
            <Textarea {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select onValueChange={(v) => setValue("clientId", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Sin cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Responsable</Label>
              <Select onValueChange={(v) => setValue("assignedTo", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select defaultValue="media" onValueChange={(v) => setValue("priority", v as never)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha limite</Label>
              <Input type="date" {...register("dueDate")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Crear tarea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
