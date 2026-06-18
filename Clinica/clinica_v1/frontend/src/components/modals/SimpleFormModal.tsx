import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getApiError } from "@/lib/apiError";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea";
  required?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldDef[];
  initial: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<unknown>;
}

/** Modal de formulario simple y configurable (para catalogos). */
export default function SimpleFormModal({ open, onClose, title, fields, initial, onSave }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setValues(initial); setError(""); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async () => {
    const faltan = fields.filter((f) => f.required && !values[f.name]?.trim());
    if (faltan.length > 0) { setError(`Completa: ${faltan.map((f) => f.label).join(", ")}`); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(values);
      onClose();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <Label>{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea
                value={values[f.name] ?? ""}
                onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
              />
            ) : (
              <Input
                type={f.type ?? "text"}
                value={values[f.name] ?? ""}
                onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
              />
            )}
          </div>
        ))}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </div>
      </div>
    </Modal>
  );
}
