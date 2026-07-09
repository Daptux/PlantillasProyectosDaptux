"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "switch" | "select" | "email" | "date" | "image";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  colSpan?: 1 | 2;
};

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function ResourceManager<T extends Row>({
  endpoint,
  singular,
  columns,
  fields,
  searchable = true,
  canCreate = true,
}: {
  endpoint: string;
  singular: string;
  columns: Column<T>[];
  fields: Field[];
  searchable?: boolean;
  canCreate?: boolean;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Row>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<T | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      setRows(json.data ?? []);
    } catch {
      toast.error("No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const lower = q.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(lower))
    );
  }, [rows, q]);

  function openCreate() {
    setEditing(null);
    const initial: Row = {};
    fields.forEach((f) => (initial[f.name] = f.type === "switch" ? false : ""));
    setForm(initial);
    setDialogOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    const initial: Row = {};
    fields.forEach((f) => (initial[f.name] = row[f.name] ?? (f.type === "switch" ? false : "")));
    setForm(initial);
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const id = editing?.id;
      const res = await fetch(id ? `${endpoint}/${id}` : endpoint, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "No se pudo guardar");
        return;
      }
      toast.success(id ? "Actualizado" : "Creado");
      setDialogOpen(false);
      load();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    const res = await fetch(`${endpoint}/${row.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "No se pudo eliminar");
      return;
    }
    toast.success("Eliminado");
    load();
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchable ? (
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-9" />
          </div>
        ) : <div />}
        {canCreate && (
          <Button variant="brand" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo {singular}
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title={`Sin ${singular}s`} description="Crea el primero para comenzar." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? "—")}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setToDelete(row)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Editar ${singular}` : `Nuevo ${singular}`}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.colSpan === 1 ? "col-span-1" : "col-span-2"}>
                <Label className="mb-1.5 block">{f.label}{f.required && " *"}</Label>
                {f.type === "textarea" ? (
                  <Textarea value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} />
                ) : f.type === "switch" ? (
                  <Switch checked={!!form[f.name]} onCheckedChange={(v) => setForm({ ...form, [f.name]: v })} />
                ) : f.type === "select" ? (
                  <Select value={form[f.name] ?? ""} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "date" ? "date" : "text"}
                    value={form[f.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="brand" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`¿Eliminar ${singular}?`}
        description="Esta acción marcará el registro como eliminado."
        onConfirm={async () => { if (toDelete) await remove(toDelete); setToDelete(null); }}
      />
    </>
  );
}
