"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { clientSchema, type ClientInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type FirmUser = { id: string; name: string; role: string };

export function ClientFormDialog({
  open,
  onOpenChange,
  onSaved,
  onDeleted,
  users,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  onDeleted?: () => void;
  users: FirmUser[];
  initial?: Partial<ClientInput> & { id?: string };
}) {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editing = Boolean(initial?.id);

  async function handleDelete() {
    if (!initial?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clientes/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        toast.error(p.error ?? "No se pudo eliminar el cliente");
        return;
      }
      toast.success("Cliente eliminado");
      setConfirmDelete(false);
      onOpenChange(false);
      (onDeleted ?? onSaved)();
    } finally {
      setDeleting(false);
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initial?.name ?? "",
      businessName: initial?.businessName ?? "",
      documentType: initial?.documentType ?? "NIT",
      documentNumber: initial?.documentNumber ?? "",
      personType: initial?.personType ?? "juridica",
      taxRegime: initial?.taxRegime ?? "",
      isVatResponsible: initial?.isVatResponsible ?? false,
      economicActivity: initial?.economicActivity ?? "",
      address: initial?.address ?? "",
      city: initial?.city ?? "",
      department: initial?.department ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      legalRepresentative: initial?.legalRepresentative ?? "",
      assignedUserId: initial?.assignedUserId ?? null,
      status: initial?.status ?? "active",
    },
  });

  async function onSubmit(data: ClientInput) {
    setLoading(true);
    try {
      const res = await fetch(
        editing ? `/api/clientes/${initial!.id}` : "/api/clientes",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const p = await res.json();
        toast.error(p.error ?? "No se pudo guardar");
        return;
      }
      toast.success(editing ? "Cliente actualizado" : "Cliente creado");
      onOpenChange(false);
      onSaved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre comercial" error={errors.name?.message} className="sm:col-span-2">
            <Input {...register("name")} />
          </Field>
          <Field label="Razon social">
            <Input {...register("businessName")} />
          </Field>
          <Field label="Tipo de documento">
            <Select
              defaultValue={watch("documentType")}
              onValueChange={(v) => setValue("documentType", v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NIT">NIT</SelectItem>
                <SelectItem value="CC">Cedula</SelectItem>
                <SelectItem value="CE">Cedula extranjeria</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Numero de documento" error={errors.documentNumber?.message}>
            <Input {...register("documentNumber")} />
          </Field>
          <Field label="Tipo de persona">
            <Select
              defaultValue={watch("personType")}
              onValueChange={(v) => setValue("personType", v as "natural" | "juridica")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="juridica">Juridica</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Regimen tributario">
            <Input {...register("taxRegime")} placeholder="Ej: Comun, Simple" />
          </Field>
          <Field label="Actividad economica">
            <Input {...register("economicActivity")} />
          </Field>
          <Field label="Telefono">
            <Input {...register("phone")} />
          </Field>
          <Field label="Correo" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Ciudad">
            <Input {...register("city")} />
          </Field>
          <Field label="Departamento">
            <Input {...register("department")} />
          </Field>
          <Field label="Direccion" className="sm:col-span-2">
            <Input {...register("address")} />
          </Field>
          <Field label="Representante legal">
            <Input {...register("legalRepresentative")} />
          </Field>
          <Field label="Auxiliar asignado">
            <Select
              defaultValue={watch("assignedUserId") ?? "none"}
              onValueChange={(v) => setValue("assignedUserId", v === "none" ? null : v)}
            >
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" {...register("isVatResponsible")} className="h-4 w-4 rounded border-input" />
            Responsable de IVA
          </label>

          <div className="sm:col-span-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
            <div>
              {editing && !confirmDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" /> Eliminar cliente
                </Button>
              )}
              {editing && confirmDelete && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2">
                  <span className="text-xs text-destructive">
                    Se eliminaran documentos, tareas y checklists. ¿Confirmar?
                  </span>
                  <Button type="button" size="sm" variant="destructive" disabled={deleting} onClick={handleDelete}>
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Si, eliminar"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                    No
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Guardar cambios" : "Crear cliente"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
