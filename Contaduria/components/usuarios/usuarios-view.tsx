"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { userSchema, type UserInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CLIENT_STATUS, pick } from "@/lib/labels";
import { ROLE_LABELS } from "@/lib/permissions";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  status: string;
};

export function UsuariosView({ currentUserId }: { currentUserId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/usuarios");
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(undefined);
    setOpen(true);
  }
  function openEdit(u: Row) {
    setEditing(u);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo usuario</Button>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                    {u.id === currentUserId && (
                      <Badge variant="muted" className="ml-2 text-[10px]">Tu</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pick(CLIENT_STATUS, u.status).variant}>{pick(CLIENT_STATUS, u.status).label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
                      <Pencil className="h-4 w-4" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <UserDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={setOpen}
        onSaved={load}
        initial={editing}
        isSelf={editing?.id === currentUserId}
      />
    </div>
  );
}

function UserDialog({
  open, onOpenChange, onSaved, initial, isSelf,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  initial?: Row;
  isSelf?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editing = Boolean(initial?.id);

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<UserInput>({
      resolver: zodResolver(userSchema),
      defaultValues: {
        name: initial?.name ?? "",
        email: initial?.email ?? "",
        role: (initial?.role as never) ?? "auxiliar",
        phone: initial?.phone ?? "",
        status: (initial?.status as never) ?? "active",
      },
    });

  async function onSubmit(data: UserInput) {
    setLoading(true);
    try {
      const res = await fetch(
        editing ? `/api/usuarios/${initial!.id}` : "/api/usuarios",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) { const p = await res.json().catch(() => ({})); toast.error(p.error ?? "Error"); return; }
      toast.success(editing ? "Usuario actualizado" : "Usuario creado");
      reset();
      onOpenChange(false);
      onSaved();
    } finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/usuarios/${initial.id}`, { method: "DELETE" });
      if (!res.ok) { const p = await res.json().catch(() => ({})); toast.error(p.error ?? "No se pudo eliminar"); return; }
      toast.success("Usuario eliminado");
      setConfirmDelete(false);
      onOpenChange(false);
      onSaved();
    } finally { setDeleting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Correo</Label>
            <Input type="email" {...register("email")} disabled={editing} />
            {editing && <p className="text-[11px] text-muted-foreground">El correo de acceso no se puede cambiar.</p>}
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={initial?.role ?? "auxiliar"}
                onChange={(e) => setValue("role", e.target.value as never)}
              >
                <option value="auxiliar">Auxiliar contable</option>
                <option value="revisor">Revisor / Auditor</option>
                <option value="contador">Contador principal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={initial?.status ?? "active"}
                onChange={(e) => setValue("status", e.target.value as never)}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{editing ? "Nueva contraseña (opcional)" : "Contraseña temporal"}</Label>
            <Input type="text" placeholder={editing ? "Dejar vacio para no cambiar" : "contahub123"} {...register("password")} />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
            <div>
              {editing && !isSelf && !confirmDelete && (
                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Eliminar usuario
                </Button>
              )}
              {editing && isSelf && (
                <span className="text-xs text-muted-foreground">No puedes eliminar tu propio usuario.</span>
              )}
              {editing && confirmDelete && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2">
                  <span className="text-xs text-destructive">¿Eliminar definitivamente?</span>
                  <Button type="button" size="sm" variant="destructive" disabled={deleting} onClick={handleDelete}>
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Si, eliminar"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>No</Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Guardar" : "Crear usuario"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
