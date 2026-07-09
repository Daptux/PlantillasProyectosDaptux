"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Play, Check, UserX, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { ESTADOS_RESERVA_LISTA, ESTADOS_RESERVA } from "@/lib/constants";
import type { EstadoReserva } from "@/types/database";

interface ReservaRow {
  id: string; cliente_nombre: string; cliente_celular: string | null;
  fecha: string; hora_inicio: string; precio: number; estado: EstadoReserva;
  servicio: { nombre: string } | null; barbero: { nombre: string } | null;
}

const ACCIONES: { estado: EstadoReserva; label: string; icon: React.ElementType }[] = [
  { estado: "confirmada", label: "Confirmar", icon: CheckCircle2 },
  { estado: "en_proceso", label: "En proceso", icon: Play },
  { estado: "completada", label: "Completar", icon: Check },
  { estado: "cancelada", label: "Cancelar", icon: XCircle },
  { estado: "no_asistio", label: "No asistió", icon: UserX },
];

export default function ReservasPage() {
  const [rows, setRows] = useState<ReservaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/reservas", window.location.origin);
      if (fecha) url.searchParams.set("fecha", fecha);
      if (estado) url.searchParams.set("estado", estado);
      const res = await fetch(url.toString());
      const json = await res.json();
      setRows(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [fecha, estado]);

  useEffect(() => { load(); }, [load]);

  async function cambiarEstado(id: string, nuevo: EstadoReserva) {
    const res = await fetch(`/api/reservas/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevo }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "No se pudo actualizar");
      return;
    }
    toast.success(`Reserva marcada como ${ESTADOS_RESERVA[nuevo].label.toLowerCase()}`);
    load();
  }

  return (
    <div>
      <PageHeader title="Reservas" description="Gestiona las citas de tu barbería." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="max-w-[180px]" />
        <Select value={estado || "all"} onValueChange={(v) => setEstado(v === "all" ? "" : v)}>
          <SelectTrigger className="max-w-[180px]"><Filter className="mr-1 h-4 w-4" /><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {ESTADOS_RESERVA_LISTA.map((e) => <SelectItem key={e} value={e}>{ESTADOS_RESERVA[e].label}</SelectItem>)}
          </SelectContent>
        </Select>
        {(fecha || estado) && (
          <Button variant="ghost" size="sm" onClick={() => { setFecha(""); setEstado(""); }}>Limpiar</Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="Sin reservas" description="No hay reservas con estos filtros." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Barbero</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.cliente_nombre}</div>
                    <div className="text-xs text-muted-foreground">{r.cliente_celular}</div>
                  </TableCell>
                  <TableCell>{r.servicio?.nombre ?? "—"}</TableCell>
                  <TableCell>{r.barbero?.nombre ?? "—"}</TableCell>
                  <TableCell>{formatDate(r.fecha)}</TableCell>
                  <TableCell>{formatTime(r.hora_inicio)}</TableCell>
                  <TableCell>{formatCurrency(r.precio)}</TableCell>
                  <TableCell><StatusBadge estado={r.estado} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Cambiar</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ACCIONES.map((a) => (
                          <DropdownMenuItem key={a.estado} onClick={() => cambiarEstado(r.id, a.estado)}>
                            <a.icon className="h-4 w-4" /> {a.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
