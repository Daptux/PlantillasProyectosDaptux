"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Check, ChevronLeft, ChevronRight, Loader2, Clock, Scissors,
  User, CalendarDays, CheckCircle2, Users,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Servicio, Barbero } from "@/types/database";

interface Slot { hora: string; barbero_id: string; barbero_nombre: string }

const PASOS = ["Servicio", "Barbero", "Fecha y hora", "Tus datos", "Confirmar"];

export function BookingForm({ servicios, barberos }: { servicios: Servicio[]; barberos: Barbero[] }) {
  const params = useSearchParams();
  const [paso, setPaso] = useState(0);
  const [servicioId, setServicioId] = useState<string | null>(params.get("servicio"));
  const [barberoId, setBarberoId] = useState<string | null>(params.get("barbero"));
  const [fecha, setFecha] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotSel, setSlotSel] = useState<Slot | null>(null);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [cliente, setCliente] = useState({ nombre: "", celular: "", correo: "", observaciones: "" });
  const [enviando, setEnviando] = useState(false);
  const [confirmada, setConfirmada] = useState<{ estado: string; mensaje?: string } | null>(null);

  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  const barbero = barberos.find((b) => b.id === barberoId) ?? null;

  // Barberos que pueden hacer el servicio se muestran todos (filtro fino en backend)
  const barberosDisponibles = barberos;

  const cargarSlots = useCallback(async () => {
    if (!servicioId || !fecha) return;
    setCargandoSlots(true);
    setSlots([]);
    setSlotSel(null);
    try {
      const url = new URL("/api/disponibilidad", window.location.origin);
      url.searchParams.set("servicio_id", servicioId);
      url.searchParams.set("fecha", fecha);
      if (barberoId) url.searchParams.set("barbero_id", barberoId);
      const res = await fetch(url.toString());
      const json = await res.json();
      setSlots(json.data?.slots ?? []);
    } catch {
      toast.error("No se pudieron cargar los horarios");
    } finally {
      setCargandoSlots(false);
    }
  }, [servicioId, fecha, barberoId]);

  useEffect(() => {
    if (paso === 2 && fecha) cargarSlots();
  }, [paso, fecha, cargarSlots]);

  function puedeAvanzar() {
    if (paso === 0) return !!servicioId;
    if (paso === 1) return true; // barbero opcional
    if (paso === 2) return !!slotSel;
    if (paso === 3) return cliente.nombre.length >= 2 && cliente.celular.length >= 7;
    return true;
  }

  async function confirmar() {
    if (!servicio || !slotSel) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicio_id: servicio.id,
          barbero_id: slotSel.barbero_id,
          hora_inicio: slotSel.hora,
          cliente_nombre: cliente.nombre,
          cliente_celular: cliente.celular,
          cliente_correo: cliente.correo || undefined,
          observaciones: cliente.observaciones || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "No se pudo crear la reserva");
        return;
      }
      setConfirmada({ estado: json.data?.reserva?.estado, mensaje: json.data?.mensaje });
    } catch {
      toast.error("Error al enviar la reserva");
    } finally {
      setEnviando(false);
    }
  }

  // ── Pantalla final ─────────────────────────────────────────────
  if (confirmada) {
    return (
      <div className="rounded-2xl border border-brand/30 bg-card p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold">
          {confirmada.estado === "confirmada" ? "¡Reserva confirmada!" : "¡Reserva registrada!"}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {confirmada.mensaje ??
            (confirmada.estado === "confirmada"
              ? "Te esperamos. Recibirás la confirmación por WhatsApp."
              : "Tu reserva quedó pendiente de confirmación. Te contactaremos pronto.")}
        </p>
        <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-white/10 bg-background/50 p-4 text-left text-sm">
          <Resumen label="Servicio" value={servicio?.nombre} />
          <Resumen label="Barbero" value={slotSel?.barbero_nombre} />
          <Resumen label="Fecha" value={slotSel && `${formatDate(slotSel.hora)} · ${formatTime(slotSel.hora)}`} />
          <Resumen label="Precio" value={servicio && formatCurrency(servicio.precio)} />
        </div>
        <Button variant="brand" className="mt-8" onClick={() => window.location.assign("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6 sm:p-8">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {PASOS.map((p, i) => (
          <div key={p} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                i < paso ? "border-brand bg-brand text-brand-foreground"
                  : i === paso ? "border-brand text-brand"
                  : "border-white/20 text-muted-foreground"
              )}>
                {i < paso ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-xs sm:block", i === paso ? "text-brand" : "text-muted-foreground")}>{p}</span>
            </div>
            {i < PASOS.length - 1 && <div className={cn("mx-2 h-0.5 flex-1", i < paso ? "bg-brand" : "bg-white/10")} />}
          </div>
        ))}
      </div>

      {/* Paso 0: Servicio */}
      {paso === 0 && (
        <Step icon={Scissors} title="¿Qué servicio deseas?">
          <div className="grid gap-3 sm:grid-cols-2">
            {servicios.map((s) => (
              <button key={s.id} onClick={() => setServicioId(s.id)}
                className={cn("flex items-center justify-between rounded-xl border p-4 text-left transition-colors",
                  servicioId === s.id ? "border-brand bg-brand/5" : "border-white/10 hover:border-brand/40")}>
                <div>
                  <p className="font-medium">{s.nombre}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {s.duracion_min} min</p>
                </div>
                <span className="font-display font-bold text-brand">{formatCurrency(s.precio)}</span>
              </button>
            ))}
          </div>
        </Step>
      )}

      {/* Paso 1: Barbero */}
      {paso === 1 && (
        <Step icon={Users} title="¿Con qué barbero?">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button onClick={() => setBarberoId(null)}
              className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                barberoId === null ? "border-brand bg-brand/5" : "border-white/10 hover:border-brand/40")}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Cualquiera disponible</span>
            </button>
            {barberosDisponibles.map((b) => (
              <button key={b.id} onClick={() => setBarberoId(b.id)}
                className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                  barberoId === b.id ? "border-brand bg-brand/5" : "border-white/10 hover:border-brand/40")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.foto_url ?? ""} alt={b.nombre}
                  className="h-14 w-14 rounded-full object-cover" />
                <span className="text-sm font-medium">{b.nombre}</span>
                {b.especialidad && <span className="text-xs text-muted-foreground">{b.especialidad}</span>}
              </button>
            ))}
          </div>
        </Step>
      )}

      {/* Paso 2: Fecha y hora */}
      {paso === 2 && (
        <Step icon={CalendarDays} title="Elige fecha y hora">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" value={fecha}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setFecha(e.target.value)} className="max-w-xs" />
          </div>
          {fecha && (
            <div className="mt-6">
              <Label>Horarios disponibles</Label>
              {cargandoSlots ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando disponibilidad...
                </div>
              ) : slots.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No hay horarios disponibles para esta fecha. Prueba con otro día.</p>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {slots.map((s) => (
                    <button key={`${s.hora}-${s.barbero_id}`} onClick={() => setSlotSel(s)}
                      className={cn("rounded-lg border py-2 text-sm font-medium transition-colors",
                        slotSel?.hora === s.hora && slotSel.barbero_id === s.barbero_id
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-white/10 hover:border-brand/40")}>
                      {formatTime(s.hora)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Step>
      )}

      {/* Paso 3: Datos */}
      {paso === 3 && (
        <Step icon={User} title="Tus datos">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input id="nombre" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} placeholder="Tu nombre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular">Celular / WhatsApp *</Label>
              <Input id="celular" value={cliente.celular} onChange={(e) => setCliente({ ...cliente, celular: e.target.value })} placeholder="300 000 0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo (opcional)</Label>
              <Input id="correo" type="email" value={cliente.correo} onChange={(e) => setCliente({ ...cliente, correo: e.target.value })} placeholder="tu@correo.com" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="obs">Observaciones (opcional)</Label>
              <Textarea id="obs" rows={3} value={cliente.observaciones} onChange={(e) => setCliente({ ...cliente, observaciones: e.target.value })} placeholder="Algo que debamos saber..." />
            </div>
          </div>
        </Step>
      )}

      {/* Paso 4: Confirmar */}
      {paso === 4 && (
        <Step icon={CheckCircle2} title="Confirma tu reserva">
          <div className="space-y-2 rounded-xl border border-white/10 bg-background/50 p-5 text-sm">
            <Resumen label="Servicio" value={servicio?.nombre} />
            <Resumen label="Duración" value={servicio && `${servicio.duracion_min} min`} />
            <Resumen label="Barbero" value={slotSel?.barbero_nombre ?? barbero?.nombre ?? "Cualquiera"} />
            <Resumen label="Fecha" value={slotSel && formatDate(slotSel.hora)} />
            <Resumen label="Hora" value={slotSel && formatTime(slotSel.hora)} />
            <Resumen label="Cliente" value={cliente.nombre} />
            <Resumen label="Celular" value={cliente.celular} />
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-medium">Total</span>
              <span className="font-display text-xl font-bold text-brand">{servicio && formatCurrency(servicio.precio)}</span>
            </div>
          </div>
        </Step>
      )}

      {/* Navegacion */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setPaso((p) => Math.max(0, p - 1))} disabled={paso === 0 || enviando}>
          <ChevronLeft className="h-4 w-4" /> Atrás
        </Button>
        {paso < PASOS.length - 1 ? (
          <Button variant="brand" onClick={() => setPaso((p) => p + 1)} disabled={!puedeAvanzar()}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="brand" onClick={confirmar} disabled={enviando}>
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />} Confirmar reserva
          </Button>
        )}
      </div>
    </div>
  );
}

function Step({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand" />
        <h3 className="font-display text-xl font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Resumen({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
