"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck, Clock, CheckCircle2, DollarSign, TrendingUp, Users,
  Package, AlertTriangle, Scissors, Trophy, ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FinanceChart } from "@/components/admin/FinanceChart";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTime } from "@/lib/utils";
import type { EstadoReserva } from "@/types/database";

interface Resumen {
  citas: { total: number; pendiente: number; confirmada: number; completada: number };
  ingresosHoy: number; ingresosMes: number; utilidadMes: number; clientesNuevos: number;
  serviciosTop: { nombre: string; cantidad: number }[];
  barberosTop: { nombre: string; total: number }[];
  proximas: { id: string; hora_inicio: string; cliente_nombre: string; estado: EstadoReserva; servicio: { nombre: string } | null; barbero: { nombre: string } | null }[];
  stockBajo: { id: string; nombre: string; stock_actual: number; stock_minimo: number }[];
  serieIngresos: { dia: string; ingresos: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/resumen")
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Resumen general de tu barbería" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">No se pudo cargar el resumen.</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Resumen general de tu barbería" />

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Citas de hoy" value={data.citas.total} icon={CalendarCheck} accent="brand"
          hint={`${data.citas.pendiente} pendientes · ${data.citas.confirmada} confirmadas`} />
        <StatCard title="Ingresos de hoy" value={formatCurrency(data.ingresosHoy)} icon={DollarSign} accent="emerald" />
        <StatCard title="Ingresos del mes" value={formatCurrency(data.ingresosMes)} icon={TrendingUp} accent="blue" />
        <StatCard title="Clientes nuevos" value={data.clientesNuevos} icon={Users} accent="amber" hint="Este mes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grafica ingresos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceChart data={data.serieIngresos} />
          </CardContent>
        </Card>

        {/* Utilidad + estados */}
        <div className="space-y-4">
          <StatCard title="Utilidad del mes" value={formatCurrency(data.utilidadMes)} icon={TrendingUp}
            accent={data.utilidadMes >= 0 ? "emerald" : "rose"} />
          <StatCard title="Completadas hoy" value={data.citas.completada} icon={CheckCircle2} accent="emerald" />
          <StatCard title="Pendientes hoy" value={data.citas.pendiente} icon={Clock} accent="amber" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Proximas citas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Próximas citas</CardTitle>
            <Link href="/admin/reservas" className="text-sm text-brand hover:underline">Ver todas</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.proximas.length === 0 && <p className="text-sm text-muted-foreground">No hay citas próximas.</p>}
            {data.proximas.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Scissors className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.cliente_nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.servicio?.nombre ?? "Servicio"} · {c.barbero?.nombre ?? "Sin asignar"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatTime(c.hora_inicio)}</p>
                  <StatusBadge estado={c.estado} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alertas + tops */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Stock bajo
              </CardTitle>
              <Link href="/admin/inventario" className="text-sm text-brand hover:underline">Ver</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.stockBajo.length === 0 && <p className="text-sm text-muted-foreground">Todo en orden ✅</p>}
              {data.stockBajo.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /> {p.nombre}</span>
                  <Badge variant="destructive">{p.stock_actual}/{p.stock_minimo}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-brand" /> Top barberos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.barberosTop.length === 0 && <p className="text-sm text-muted-foreground">Sin datos aún.</p>}
              {data.barberosTop.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {b.nombre}</span>
                  <span className="font-medium text-brand">{formatCurrency(b.total)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Servicios top */}
      <Card>
        <CardHeader><CardTitle>Servicios más vendidos (mes)</CardTitle></CardHeader>
        <CardContent>
          {data.serviciosTop.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos aún.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.serviciosTop.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{s.nombre}</span>
                  <Badge variant="brand">{s.cantidad} ventas</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
