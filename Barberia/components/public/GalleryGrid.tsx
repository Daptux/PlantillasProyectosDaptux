"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIAS_GALERIA } from "@/lib/constants";
import type { Galeria } from "@/types/database";

export function GalleryGrid({ items }: { items: Galeria[] }) {
  const [filtro, setFiltro] = useState<string>("todos");

  const categoriasPresentes = useMemo(() => {
    const set = new Set(items.map((i) => i.categoria).filter(Boolean));
    return CATEGORIAS_GALERIA.filter((c) => set.has(c.value));
  }, [items]);

  const filtrados = filtro === "todos" ? items : items.filter((i) => i.categoria === filtro);

  return (
    <div>
      {categoriasPresentes.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <FilterBtn active={filtro === "todos"} onClick={() => setFiltro("todos")}>Todos</FilterBtn>
          {categoriasPresentes.map((c) => (
            <FilterBtn key={c.value} active={filtro === c.value} onClick={() => setFiltro(c.value)}>
              {c.label}
            </FilterBtn>
          ))}
        </div>
      )}
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>div]:mb-4">
        {filtrados.map((g) => (
          <div key={g.id} className="group relative overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.imagen_url} alt={g.titulo ?? "Trabajo"} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {g.titulo && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-medium text-white">{g.titulo}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-brand bg-brand text-brand-foreground" : "border-white/15 text-muted-foreground hover:border-brand/40"
      )}
    >
      {children}
    </button>
  );
}
