"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PREGUNTAS = [
  { q: "¿Necesito reservar con anticipación?", a: "Recomendamos reservar para asegurar tu horario, aunque también atendemos por orden de llegada según disponibilidad." },
  { q: "¿Puedo elegir mi barbero?", a: "Sí. Al reservar puedes seleccionar el barbero de tu preferencia o dejar que asignemos al primero disponible." },
  { q: "¿Qué métodos de pago aceptan?", a: "Efectivo, Nequi, Daviplata, transferencia y tarjeta. También pagos por Wompi." },
  { q: "¿Puedo cancelar o reprogramar?", a: "Claro. Contáctanos por WhatsApp con anticipación y con gusto reprogramamos tu cita." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-xl border border-white/10 bg-card">
      {PREGUNTAS.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
          >
            <span className="font-medium">{item.q}</span>
            <ChevronDown className={cn("h-5 w-5 shrink-0 text-brand transition-transform", open === i && "rotate-180")} />
          </button>
          {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
