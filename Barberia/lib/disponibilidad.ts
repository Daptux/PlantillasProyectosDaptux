import { createAdminClient } from "@/lib/supabase/admin";
import { BARBERIA_ID } from "@/lib/constants";

/**
 * Motor de disponibilidad de agenda.
 *
 * Zona horaria: la barberia opera en Colombia (UTC-5, sin horario de verano).
 * Los `time` de horarios se interpretan en hora local y se convierten a ISO
 * con offset -05:00 para comparar contra los timestamptz de reservas/bloqueos.
 */
const TZ_OFFSET = "-05:00";
const SLOT_STEP_MIN = 15; // granularidad de inicio de citas

export interface Slot {
  hora: string;        // ISO con offset
  barbero_id: string;
  barbero_nombre: string;
}

function toISO(fecha: string, hhmm: string): string {
  // fecha: YYYY-MM-DD ; hhmm: HH:MM
  return new Date(`${fecha}T${hhmm}:00${TZ_OFFSET}`).toISOString();
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export async function calcularDisponibilidad(params: {
  servicioId: string;
  barberoId?: string | null;
  fecha: string; // YYYY-MM-DD
}): Promise<{ slots: Slot[]; duracion: number }> {
  const { servicioId, barberoId, fecha } = params;
  const supabase = createAdminClient();

  // 1. Duracion del servicio
  const { data: servicio } = await supabase
    .from("servicios")
    .select("id, duracion_min, barberia_id")
    .eq("id", servicioId)
    .eq("estado", "activo")
    .maybeSingle();
  if (!servicio) return { slots: [], duracion: 0 };
  const duracion = servicio.duracion_min;

  // 2. Anticipacion minima
  const { data: config } = await supabase
    .from("configuracion_barberia")
    .select("anticipacion_minima_min")
    .eq("barberia_id", BARBERIA_ID)
    .maybeSingle();
  const anticipacion = config?.anticipacion_minima_min ?? 0;
  const minInicio = Date.now() + anticipacion * 60_000;

  // 3. Barberos candidatos (los que pueden hacer el servicio)
  let barberoQuery = supabase
    .from("barberos")
    .select("id, nombre, barbero_servicios!inner(servicio_id)")
    .eq("barberia_id", BARBERIA_ID)
    .eq("estado", "activo")
    .eq("barbero_servicios.servicio_id", servicioId);
  if (barberoId) barberoQuery = barberoQuery.eq("id", barberoId);
  const { data: barberos } = await barberoQuery;
  if (!barberos || barberos.length === 0) return { slots: [], duracion };

  const diaSemana = new Date(`${fecha}T12:00:00${TZ_OFFSET}`).getDay(); // 0=domingo

  // 4. Reservas ocupadas del dia
  const inicioDia = toISO(fecha, "00:00");
  const finDia = toISO(fecha, "23:59");
  const barberoIds = barberos.map((b) => b.id);

  const { data: reservas } = await supabase
    .from("reservas")
    .select("barbero_id, hora_inicio, hora_fin, estado")
    .in("barbero_id", barberoIds)
    .gte("hora_inicio", inicioDia)
    .lte("hora_inicio", finDia)
    .in("estado", ["pendiente", "confirmada", "en_proceso"]);

  const { data: bloqueos } = await supabase
    .from("bloqueos_agenda")
    .select("barbero_id, inicio, fin")
    .lte("inicio", finDia)
    .gte("fin", inicioDia);

  // 5. Generar slots por barbero
  const slots: Slot[] = [];
  for (const barbero of barberos) {
    const { data: horarios } = await supabase
      .from("horarios_barberos")
      .select("hora_inicio, hora_fin")
      .eq("barbero_id", barbero.id)
      .eq("dia_semana", diaSemana)
      .eq("activo", true);

    if (!horarios || horarios.length === 0) continue;

    const ocupadas = (reservas ?? [])
      .filter((r) => r.barbero_id === barbero.id)
      .map((r) => [new Date(r.hora_inicio).getTime(), new Date(r.hora_fin).getTime()] as const);

    const bloqueosB = (bloqueos ?? [])
      .filter((b) => b.barbero_id === barbero.id || b.barbero_id === null)
      .map((b) => [new Date(b.inicio).getTime(), new Date(b.fin).getTime()] as const);

    for (const h of horarios) {
      const [ih, im] = h.hora_inicio.split(":").map(Number);
      const [fh, fm] = h.hora_fin.split(":").map(Number);
      const jornadaInicio = new Date(`${fecha}T00:00:00${TZ_OFFSET}`).getTime() + (ih * 60 + im) * 60_000;
      const jornadaFin = new Date(`${fecha}T00:00:00${TZ_OFFSET}`).getTime() + (fh * 60 + fm) * 60_000;

      for (let t = jornadaInicio; t + duracion * 60_000 <= jornadaFin; t += SLOT_STEP_MIN * 60_000) {
        const slotStart = t;
        const slotEnd = t + duracion * 60_000;
        if (slotStart < minInicio) continue;
        const chocaReserva = ocupadas.some(([s, e]) => overlaps(slotStart, slotEnd, s, e));
        const chocaBloqueo = bloqueosB.some(([s, e]) => overlaps(slotStart, slotEnd, s, e));
        if (chocaReserva || chocaBloqueo) continue;
        slots.push({
          hora: new Date(slotStart).toISOString(),
          barbero_id: barbero.id,
          barbero_nombre: barbero.nombre,
        });
      }
    }
  }

  // 6. Si es "cualquier barbero", dejar un slot por hora (el primero disponible)
  slots.sort((a, b) => a.hora.localeCompare(b.hora));
  if (!barberoId) {
    const vistas = new Set<string>();
    return {
      duracion,
      slots: slots.filter((s) => {
        if (vistas.has(s.hora)) return false;
        vistas.add(s.hora);
        return true;
      }),
    };
  }

  return { slots, duracion };
}
