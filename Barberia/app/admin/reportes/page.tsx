"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, Users, Scissors, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { EstadoReserva } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rep = Record<string, any>;

export default function ReportesPage() {
  const [rep, setRep] = useState<Rep | null>(null);
  const [desde, setDesde] = useState(new Date(new Date().setDate(1)).toISOString().slice(0, 10));
  const [hasta, setHasta] = useState(new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    const res = await fetch(`/api/reportes?desde=${desde}&hasta=${hasta}`);
    const json = await res.json();
    setRep(json.data);
  }, [desde, hasta]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="Reportes" description="Análisis del periodo seleccionado.">
        <div className="flex gap-2">
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="max-w-[150px]" />
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="max-w-[150px]" />
        </div>
      </PageHeader>

      {rep && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-brand" /> Citas por estado</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(rep.citasPorEstado ?? {}).map(([e, n]) => (
                <div key={e} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <StatusBadge estado={e as EstadoReserva} />
                  <span className="font-semibold">{n as number}</span>
                </div>
              ))}
              {Object.keys(rep.citasPorEstado ?? {}).length === 0 && <p className="text-sm text-muted-foreground">Sin datos.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Scissors className="h-4 w-4 text-brand" /> Servicios más vendidos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(rep.serviciosTop ?? []).slice(0, 6).map((s: Rep, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{s.nombre}</span><Badge variant="brand">{s.cantidad}</Badge>
                </div>
              ))}
              {(rep.serviciosTop ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sin datos.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-brand" /> Barberos con más ingresos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(rep.barberosTop ?? []).map((b: Rep, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {b.nombre}</span><span className="font-medium text-brand">{formatCurrency(b.total)}</span>
                </div>
              ))}
              {(rep.barberosTop ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sin datos.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-brand" /> Clientes con más gasto</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(rep.clientesTop ?? []).slice(0, 6).map((c: Rep, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{c.nombre} <span className="text-muted-foreground">({c.numero_visitas} visitas)</span></span>
                  <span className="font-medium">{formatCurrency(c.total_gastado)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Productos con bajo stock</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(rep.stockBajo ?? []).map((p: Rep, i: number) => (
                <Badge key={i} variant="destructive">{p.nombre}: {p.stock_actual}/{p.stock_minimo}</Badge>
              ))}
              {(rep.stockBajo ?? []).length === 0 && <p className="text-sm text-muted-foreground">Todo en orden ✅</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
