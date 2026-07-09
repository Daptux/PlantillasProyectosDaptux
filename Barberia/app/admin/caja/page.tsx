"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Lock, Unlock, Loader2, Banknote } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CajaData = { caja: any; movimientos?: any[]; ingresos?: number; gastos?: number; balance?: number };

export default function CajaPage() {
  const [data, setData] = useState<CajaData | null>(null);
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/caja/actual");
    const json = await res.json();
    setData(json.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function abrir() {
    setLoading(true);
    try {
      const res = await fetch("/api/caja/abrir", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto_inicial: Number(monto || 0) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || "Error"); return; }
      toast.success("Caja abierta");
      setMonto("");
      load();
    } finally { setLoading(false); }
  }

  async function cerrar() {
    setLoading(true);
    try {
      const res = await fetch("/api/caja/cerrar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto_final: data?.balance ?? 0 }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || "Error"); return; }
      toast.success("Caja cerrada");
      load();
    } finally { setLoading(false); }
  }

  const caja = data?.caja;

  return (
    <div>
      <PageHeader title="Caja" description="Apertura y cierre de caja diaria." />

      {!caja ? (
        <Card className="max-w-md">
          <CardHeader><CardTitle className="flex items-center gap-2"><Unlock className="h-5 w-5 text-brand" /> Abrir caja</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Monto inicial (base)</Label>
              <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" />
            </div>
            <Button variant="brand" onClick={abrir} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Abrir caja
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard title="Base inicial" value={formatCurrency(caja.monto_inicial)} icon={Banknote} accent="blue" />
            <StatCard title="Ingresos" value={formatCurrency(data?.ingresos ?? 0)} icon={Banknote} accent="emerald" />
            <StatCard title="Gastos" value={formatCurrency(data?.gastos ?? 0)} icon={Banknote} accent="rose" />
            <StatCard title="Balance" value={formatCurrency(data?.balance ?? 0)} icon={Banknote} accent="brand" />
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Caja abierta desde {formatDateTime(caja.abierta_at)}</CardTitle>
              <Button variant="destructive" onClick={cerrar} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Cerrar caja
              </Button>
            </CardHeader>
            <CardContent>
              {(data?.movimientos ?? []).length === 0 ? (
                <EmptyState title="Sin movimientos" description="Aún no hay movimientos en esta caja." />
              ) : (
                <ul className="divide-y">
                  {data!.movimientos!.map((m, i) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span>{m.concepto}</span>
                      <span className={m.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"}>
                        {m.tipo === "ingreso" ? "+" : "-"}{formatCurrency(m.monto)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
