import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationsService } from "@/services/notificationsService";

/** Campana de notificaciones con contador y panel desplegable. */
export default function NotificationBell() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Contador (refresca cada 30s); la lista solo cuando se abre el panel.
  const { data: count = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationsService.unreadCount(),
    refetchInterval: 30000,
  });
  const { data: items = [] } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsService.list(),
    enabled: open,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });
  const readMut = useMutation({ mutationFn: notificationsService.markRead, onSuccess: invalidate });
  const readAllMut = useMutation({ mutationFn: notificationsService.markAllRead, onSuccess: invalidate });

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onItem = (id: number, leida: number, url: string | null) => {
    if (!leida) readMut.mutate(id);
    if (url) { setOpen(false); navigate(url); }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold text-destructive-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-sm font-semibold">Notificaciones</span>
            {count > 0 && (
              <button
                onClick={() => readAllMut.mutate()}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Sin notificaciones</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onItem(n.id, n.leida, n.url_destino)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 last:border-0",
                    !n.leida && "bg-primary/5"
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    {!n.leida && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <span className="text-sm font-medium">{n.titulo}</span>
                  </div>
                  {n.mensaje && <span className="text-xs text-muted-foreground">{n.mensaje}</span>}
                  <span className="text-[11px] text-muted-foreground">{n.created_at.slice(0, 16).replace("T", " ")}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
