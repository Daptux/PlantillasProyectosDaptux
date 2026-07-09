"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Shield } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function UsuariosPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([]);
  const [roles, setRoles] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", rol_id: "", celular: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [u, r] = await Promise.all([
      fetch("/api/usuarios").then((x) => x.json()),
      fetch("/api/roles").then((x) => x.json()),
    ]);
    setRows(u.data ?? []);
    setRoles(r.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function crear() {
    setSaving(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || "Error"); return; }
      toast.success("Usuario creado");
      setOpen(false);
      setForm({ nombre: "", correo: "", password: "", rol_id: "", celular: "" });
      load();
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader title="Usuarios" description="Cuentas de acceso y roles del equipo.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="brand"><Plus className="h-4 w-4" /> Nuevo usuario</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo usuario</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="mb-1.5 block">Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div><Label className="mb-1.5 block">Correo</Label><Input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></div>
              <div><Label className="mb-1.5 block">Contraseña</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div>
                <Label className="mb-1.5 block">Rol</Label>
                <Select value={form.rol_id} onValueChange={(v) => setForm({ ...form, rol_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona rol" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="mb-1.5 block">Celular</Label><Input value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} /></div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="brand" onClick={crear} disabled={saving || !form.correo || !form.password || !form.rol_id}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Shield} title="Sin usuarios" description="Crea el primer usuario del equipo." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último acceso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nombre}</TableCell>
                  <TableCell>{u.correo}</TableCell>
                  <TableCell><Badge variant="brand">{u.rol?.nombre ?? "—"}</Badge></TableCell>
                  <TableCell><Badge variant={u.estado === "activo" ? "secondary" : "destructive"}>{u.estado}</Badge></TableCell>
                  <TableCell>{u.ultimo_acceso ? formatDate(u.ultimo_acceso) : "Nunca"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
