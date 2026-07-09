"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Wallet, Plus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { METODOS_PAGO, METODOS_PAGO_LISTA } from "@/lib/constants";

export default function FinanzasPage() {
  const [resumen, setResumen] = useState<{ ingresos: number; gastos: number; utilidad: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [movs, setMovs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tipo: "ingreso", concepto: "", monto: "", metodo_pago: "efectivo" });

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch("/api/finanzas/resumen").then((r) => r.json()),
      fetch("/api/finanzas/movimientos").then((r) => r.json()),
    ]);
    setResumen(r1.data);
    setMovs(r2.data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function guardar() {
    setSaving(true);
    try {
      const res = await fetch("/api/finanzas/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, monto: Number(form.monto) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || "Error"); return; }
      toast.success("Movimiento registrado");
      setOpen(false);
      setForm({ tipo: "ingreso", concepto: "", monto: "", metodo_pago: "efectivo" });
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Finanzas" description="Ingresos, gastos y utilidad del mes.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="brand"><Plus className="h-4 w-4" /> Movimiento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo movimiento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="gasto">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Concepto</Label>
                <Input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Ej: Compra de insumos" />
              </div>
              <div>
                <Label className="mb-1.5 block">Monto</Label>
                <Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label className="mb-1.5 block">Método de pago</Label>
                <Select value={form.metodo_pago} onValueChange={(v) => setForm({ ...form, metodo_pago: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METODOS_PAGO_LISTA.map((m) => <SelectItem key={m} value={m}>{METODOS_PAGO[m]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="brand" onClick={guardar} disabled={saving || !form.concepto || !form.monto}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Ingresos (mes)" value={formatCurrency(resumen?.ingresos ?? 0)} icon={TrendingUp} accent="emerald" />
        <StatCard title="Gastos (mes)" value={formatCurrency(resumen?.gastos ?? 0)} icon={TrendingDown} accent="rose" />
        <StatCard title="Utilidad (mes)" value={formatCurrency(resumen?.utilidad ?? 0)} icon={Wallet}
          accent={(resumen?.utilidad ?? 0) >= 0 ? "brand" : "rose"} />
      </div>

      <Card>
        <CardHeader><CardTitle>Movimientos recientes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{formatDate(m.fecha)}</TableCell>
                  <TableCell>{m.concepto}</TableCell>
                  <TableCell>
                    <Badge variant={m.tipo === "ingreso" ? "brand" : "destructive"}>{m.tipo}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{METODOS_PAGO[m.metodo_pago as keyof typeof METODOS_PAGO] ?? m.metodo_pago}</TableCell>
                  <TableCell className={`text-right font-medium ${m.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"}`}>
                    {m.tipo === "ingreso" ? "+" : "-"}{formatCurrency(m.monto)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {movs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sin movimientos.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
