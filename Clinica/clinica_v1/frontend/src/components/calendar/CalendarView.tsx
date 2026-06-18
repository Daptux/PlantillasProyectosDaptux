import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ESTADO_LABEL,
  formatHora,
  formatMesAnio,
  formatDiaCorto,
  parseApiDate,
  addDays,
  startOfWeek,
  monthGridDays,
  isSameDay,
  isSameMonth,
} from "@/lib/appointments";
import type { Cita, EstadoCita } from "@/types";

type Vista = "month" | "week" | "day";

interface Props {
  citas: Cita[];
  onSelectCita: (cita: Cita) => void;
  /** Si se pasa, muestra el boton "Nueva cita" y al pulsar un dia vacio. */
  onCreateAt?: (fecha: Date) => void;
}

// Color del punto/borde segun estado.
const ESTADO_DOT: Record<EstadoCita, string> = {
  SOLICITADA: "bg-amber-500",
  PENDIENTE_DOCUMENTOS: "bg-amber-500",
  CONFIRMADA: "bg-primary",
  EN_ESPERA: "bg-secondary",
  EN_ATENCION: "bg-secondary",
  ATENDIDA: "bg-emerald-500",
  CANCELADA: "bg-destructive",
  NO_ASISTIO: "bg-destructive",
};

const DIAS_SEMANA = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

/** Calendario visual de citas con vistas mes/semana/dia. */
export default function CalendarView({ citas, onSelectCita, onCreateAt }: Props) {
  const [vista, setVista] = useState<Vista>("week");
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Agrupa las citas por dia (clave YYYY-M-D) para acceso rapido.
  const porDia = useMemo(() => {
    const map = new Map<string, Cita[]>();
    for (const c of citas) {
      const d = parseApiDate(c.fecha_inicio);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));
    }
    return map;
  }, [citas]);

  const citasDe = (d: Date): Cita[] =>
    porDia.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? [];

  const navegar = (dir: number) => {
    if (vista === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    else if (vista === "week") setCursor(addDays(cursor, dir * 7));
    else setCursor(addDays(cursor, dir));
  };

  const titulo =
    vista === "month"
      ? formatMesAnio(cursor)
      : vista === "week"
      ? `Semana del ${formatDiaCorto(startOfWeek(cursor))}`
      : cursor.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navegar(-1)} aria-label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navegar(1)} aria-label="Siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(new Date().setHours(0, 0, 0, 0)))}>
            Hoy
          </Button>
          <h2 className="ml-1 text-lg font-bold capitalize">{titulo}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            {(["month", "week", "day"] as Vista[]).map((v) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  vista === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v === "month" ? "Mes" : v === "week" ? "Semana" : "Dia"}
              </button>
            ))}
          </div>
          {onCreateAt && (
            <Button size="sm" onClick={() => onCreateAt(cursor)}>
              <Plus className="h-4 w-4" /> Nueva cita
            </Button>
          )}
        </div>
      </div>

      {vista === "month" && (
        <MonthView
          cursor={cursor}
          citasDe={citasDe}
          onSelectCita={onSelectCita}
          onSelectDay={(d) => {
            setCursor(d);
            setVista("day");
          }}
        />
      )}
      {vista === "week" && (
        <WeekView cursor={cursor} citasDe={citasDe} onSelectCita={onSelectCita} onCreateAt={onCreateAt} />
      )}
      {vista === "day" && (
        <DayView cursor={cursor} citas={citasDe(cursor)} onSelectCita={onSelectCita} onCreateAt={onCreateAt} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function MonthView({
  cursor,
  citasDe,
  onSelectCita,
  onSelectDay,
}: {
  cursor: Date;
  citasDe: (d: Date) => Cita[];
  onSelectCita: (c: Cita) => void;
  onSelectDay: (d: Date) => void;
}) {
  const dias = monthGridDays(cursor);
  const hoy = new Date();

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-xs font-semibold text-muted-foreground">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((d, i) => {
          const cs = citasDe(d);
          const fueraMes = !isSameMonth(d, cursor);
          return (
            <button
              key={i}
              onClick={() => onSelectDay(d)}
              className={cn(
                "min-h-[92px] border-b border-r p-1.5 text-left align-top transition-colors hover:bg-muted/40",
                fueraMes && "bg-muted/20 text-muted-foreground",
                (i + 1) % 7 === 0 && "border-r-0"
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isSameDay(d, hoy) && "bg-primary text-primary-foreground"
                )}
              >
                {d.getDate()}
              </div>
              <div className="space-y-0.5">
                {cs.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCita(c);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onSelectCita(c))}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] hover:bg-primary/10"
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ESTADO_DOT[c.estado])} />
                    <span className="truncate">
                      {formatHora(c.fecha_inicio)} {c.paciente_apellidos}
                    </span>
                  </div>
                ))}
                {cs.length > 3 && (
                  <div className="px-1 text-[11px] text-muted-foreground">+{cs.length - 3} mas</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  cursor,
  citasDe,
  onSelectCita,
  onCreateAt,
}: {
  cursor: Date;
  citasDe: (d: Date) => Cita[];
  onSelectCita: (c: Cita) => void;
  onCreateAt?: (d: Date) => void;
}) {
  const inicio = startOfWeek(cursor);
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
  const hoy = new Date();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {dias.map((d, i) => {
        const cs = citasDe(d);
        return (
          <div key={i} className="rounded-xl border bg-card">
            <div
              className={cn(
                "flex items-center justify-between border-b px-2 py-1.5 text-xs font-semibold",
                isSameDay(d, hoy) ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              <span>{formatDiaCorto(d)}</span>
              {onCreateAt && (
                <button
                  onClick={() => onCreateAt(d)}
                  className="rounded p-0.5 hover:bg-primary/10"
                  aria-label="Nueva cita"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 p-1.5">
              {cs.length === 0 && <p className="px-1 py-2 text-[11px] text-muted-foreground">Sin citas</p>}
              {cs.map((c) => (
                <CitaCard key={c.id} cita={c} onClick={() => onSelectCita(c)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  cursor,
  citas,
  onSelectCita,
  onCreateAt,
}: {
  cursor: Date;
  citas: Cita[];
  onSelectCita: (c: Cita) => void;
  onCreateAt?: (d: Date) => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      {citas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">No hay citas para este dia.</p>
          {onCreateAt && (
            <Button size="sm" onClick={() => onCreateAt(cursor)}>
              <Plus className="h-4 w-4" /> Agendar cita
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {citas.map((c) => (
            <CitaCard key={c.id} cita={c} expanded onClick={() => onSelectCita(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CitaCard({
  cita,
  onClick,
  expanded,
}: {
  cita: Cita;
  onClick: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-2 rounded-lg border-l-4 bg-muted/30 p-2 text-left transition-colors hover:bg-muted"
      style={{ borderLeftColor: "transparent" }}
    >
      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", ESTADO_DOT[cita.estado])} />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold">
          {formatHora(cita.fecha_inicio)} – {formatHora(cita.fecha_fin)}
        </div>
        <div className="truncate text-sm font-medium">
          {cita.paciente_nombres} {cita.paciente_apellidos}
        </div>
        {expanded && (
          <div className="truncate text-xs text-muted-foreground">
            Dr(a). {cita.medico_apellidos}
            {cita.servicio_nombre ? ` · ${cita.servicio_nombre}` : ""}
          </div>
        )}
        <div className="mt-0.5 text-[11px] text-muted-foreground">{ESTADO_LABEL[cita.estado]}</div>
      </div>
    </button>
  );
}
