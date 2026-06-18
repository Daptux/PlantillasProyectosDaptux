import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getApiError } from "@/lib/apiError";
import type { Usuario, Rol } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Usuario | null;
  roles: Rol[];
  onSave: (payload: Record<string, unknown>, id?: number) => Promise<unknown>;
}

export default function UserModal({ open, onClose, editing, roles, onSave }: Props) {
  const [form, setForm] = useState({ nombres: "", apellidos: "", email: "", telefono: "", password: "", rol_id: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm({
      nombres: editing?.nombres ?? "",
      apellidos: editing?.apellidos ?? "",
      email: editing?.email ?? "",
      telefono: editing?.telefono ?? "",
      password: "",
      rol_id: editing ? String(editing.rol_id) : "",
    });
  }, [open, editing]);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (form.nombres.length < 2 || form.apellidos.length < 2) { setError("Nombres y apellidos requeridos"); return; }
    if (!form.email) { setError("Email requerido"); return; }
    if (!form.rol_id) { setError("Selecciona un rol"); return; }
    if (!editing && form.password.length < 6) { setError("La contrasena debe tener al menos 6 caracteres"); return; }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        telefono: form.telefono || undefined,
        rol_id: Number(form.rol_id),
      };
      // La contrasena solo se envia si se escribio (obligatoria al crear).
      if (form.password) payload.password = form.password;
      await onSave(payload, editing?.id);
      onClose();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar usuario" : "Nuevo usuario"}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nombres</Label>
            <Input value={form.nombres} onChange={(e) => set("nombres", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Apellidos</Label>
            <Input value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Telefono</Label>
            <Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Select value={form.rol_id} onChange={(e) => set("rol_id", e.target.value)}>
              <option value="">Selecciona un rol</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{editing ? "Nueva contrasena (opcional)" : "Contrasena"}</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder={editing ? "Dejar vacio para no cambiar" : "Minimo 6 caracteres"}
          />
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </div>
      </div>
    </Modal>
  );
}
