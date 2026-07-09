"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { METODOS_PAGO, METODOS_PAGO_LISTA } from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = Record<string, any>;

export default function VentasPage() {
  const [ventas, setVentas] = useState<Any[]>([]);
  const [productos, setProductos] = useState<Any[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<{ producto_id: string; cantidad: number }[]>([]);
  const [metodo, setMetodo] = useState("efectivo");

  const load = useCallback(async () => {
    const [v, p] = await Promise.all([
      fetch("/api/ventas").then((r) => r.json()),
      fetch("/api/inventario/productos").then((r) => r.json()),
    ]);
    setVentas(v.data ?? []);
    setProductos((p.data ?? []).filter((x: Any) => x.es_vendible));
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = items.reduce((acc, it) => {
    const p = productos.find((x) => x.id === it.producto_id);
    return acc + (Number(p?.precio_venta ?? 0) * it.cantidad);
  }, 0);

  async function registrar() {
    if (items.length === 0) { toast.error("Agrega productos"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/ventas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo_pago: metodo, items }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || "Error"); return; }
      toast.success("Venta registrada");
      setOpen(false); setItems([]);
      load();
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader title="Ventas de productos" description="Registra ventas y descuenta inventario.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="brand"><Plus className="h-4 w-4" /> Nueva venta</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva venta</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={it.producto_id} onValueChange={(v) => setItems(items.map((x, i) => i === idx ? { ...x, producto_id: v } : x))}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Producto" /></SelectTrigger>
                    <SelectContent>
                      {productos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre} · {formatCurrency(p.precio_venta)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} value={it.cantidad} className="w-20"
                    onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, cantidad: Number(e.target.value) } : x))} />
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setItems([...items, { producto_id: "", cantidad: 1 }])}>
                <Plus className="h-4 w-4" /> Agregar producto
              </Button>
              <div>
                <Label className="mb-1.5 block">Método de pago</Label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METODOS_PAGO_LISTA.map((m) => <SelectItem key={m} value={m}>{METODOS_PAGO[m]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between border-t pt-3 font-medium">
                <span>Total</span><span className="text-brand">{formatCurrency(total)}</span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="brand" onClick={registrar} disabled={saving || items.length === 0}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>Historial de ventas</CardTitle></CardHeader>
        <CardContent>
          {ventas.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Sin ventas" description="Registra la primera venta." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{formatDateTime(v.created_at)}</TableCell>
                    <TableCell>{(v.detalle ?? []).map((d: Any) => `${d.cantidad}× ${d.producto_nombre}`).join(", ")}</TableCell>
                    <TableCell className="capitalize">{METODOS_PAGO[v.metodo_pago as keyof typeof METODOS_PAGO] ?? v.metodo_pago}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(v.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
