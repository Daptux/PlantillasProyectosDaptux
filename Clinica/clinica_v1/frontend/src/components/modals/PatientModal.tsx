import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getApiError } from "@/lib/apiError";
import type { Paciente } from "@/types";

const schema = z.object({
  tipo_documento: z.string().min(1).default("CC"),
  numero_documento: z.string().min(3, "Documento requerido"),
  nombres: z.string().min(2, "Nombres requeridos"),
  apellidos: z.string().min(2, "Apellidos requeridos"),
  fecha_nacimiento: z.string().optional(),
  sexo: z.enum(["M", "F", "OTRO"]).optional(),
  telefono: z.string().optional(),
  email: z.string().optional(),
  ciudad: z.string().optional(),
  eps: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Paciente | null;
  onSave: (payload: Record<string, unknown>, id?: number) => Promise<unknown>;
}

export default function PatientModal({ open, onClose, editing, onSave }: Props) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Carga los datos al abrir (crear vs editar).
  useEffect(() => {
    if (!open) return;
    setServerError("");
    reset({
      tipo_documento: editing?.tipo_documento ?? "CC",
      numero_documento: editing?.numero_documento ?? "",
      nombres: editing?.nombres ?? "",
      apellidos: editing?.apellidos ?? "",
      fecha_nacimiento: editing?.fecha_nacimiento ?? "",
      sexo: editing?.sexo ?? "OTRO",
      telefono: editing?.telefono ?? "",
      email: editing?.email ?? "",
      ciudad: editing?.ciudad ?? "",
      eps: editing?.eps ?? "",
    });
  }, [open, editing, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave({ ...values }, editing?.id);
      onClose();
    } catch (e) {
      setServerError(getApiError(e));
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar paciente" : "Nuevo paciente"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo doc.</Label>
            <Select {...register("tipo_documento")}>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
              <option value="PA">PA</option>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>N.º documento</Label>
            <Input {...register("numero_documento")} />
            {errors.numero_documento && <p className="text-xs text-destructive">{errors.numero_documento.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nombres</Label>
            <Input {...register("nombres")} />
            {errors.nombres && <p className="text-xs text-destructive">{errors.nombres.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Apellidos</Label>
            <Input {...register("apellidos")} />
            {errors.apellidos && <p className="text-xs text-destructive">{errors.apellidos.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Fecha nacimiento</Label>
            <Input type="date" {...register("fecha_nacimiento")} />
          </div>
          <div className="space-y-1.5">
            <Label>Sexo</Label>
            <Select {...register("sexo")}>
              <option value="OTRO">Otro</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Telefono</Label>
            <Input {...register("telefono")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Ciudad</Label>
            <Input {...register("ciudad")} />
          </div>
          <div className="space-y-1.5">
            <Label>EPS</Label>
            <Input {...register("eps")} />
          </div>
        </div>

        {serverError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar"}</Button>
        </div>
      </form>
    </Modal>
  );
}
