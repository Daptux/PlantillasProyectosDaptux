"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatTime } from "@/lib/utils";
import type { EstadoReserva } from "@/types/database";

interface Cita {
  id: string; cliente_nombre: string; hora_inicio: string; hora_fin: string;
  estado: EstadoReserva; servicio: { nombre: string } | null; barbero: { nombre: string } | null;
}

export default function AgendaPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [citas, setCitas] = useState<Cita[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/reservas?fecha=${fecha}`);
    const json = await res.json();
    setCitas((json.data ?? []).sort((a: Cita, b: Cita) => a.hora_inicio.localeCompare(b.hora_inicio)));
  }, [fecha]);

  useEffect(() => { load(); }, [load]);

  // Agrupar por barbero
  const porBarbero = new Map<string, Cita[]>();
  for (const c of citas) {
    const nom = c.barbero?.nombre ?? "Sin asignar";
    porBarbero.set(nom, [...(porBarbero.get(nom) ?? []), c]);
  }

  return (
    <div>
      <PageHeader title="Agenda" description="Vista diaria de citas por barbero.">
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="max-w-[180px]" />
      </PageHeader>

      {citas.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Sin citas" description="No hay citas para esta fecha." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...porBarbero.entries()].map(([barbero, lista]) => (
            <Card key={barbero}>
              <CardHeader><CardTitle className="text-base">{barbero}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {lista.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{formatTime(c.hora_inicio)} - {formatTime(c.hora_fin)}</p>
                      <p className="text-xs text-muted-foreground">{c.cliente_nombre} · {c.servicio?.nombre}</p>
                    </div>
                    <StatusBadge estado={c.estado} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
