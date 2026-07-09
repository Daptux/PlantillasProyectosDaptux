"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, Menu, X, CalendarPlus } from "lucide-react";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PublicNavbar({ nombre, logoUrl }: { nombre: string; logoUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nombre} className="h-9 w-auto" />
          ) : (
            <Scissors className="h-6 w-6 text-brand" />
          )}
          <span className="font-display text-lg font-bold tracking-tight">{nombre}</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-brand",
                pathname === item.href ? "text-brand" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="brand" size="sm">
            <Link href="/reservar">
              <CalendarPlus className="h-4 w-4" /> Reservar
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-white/10 bg-background md:hidden">
          <div className="container flex flex-col py-3">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  pathname === item.href ? "text-brand" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="brand" size="sm" className="mt-2">
              <Link href="/reservar" onClick={() => setOpen(false)}>
                <CalendarPlus className="h-4 w-4" /> Reservar cita
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
