"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, CalendarDays, Users, Scissors, UserCog,
  Wallet, Banknote, Package, ShoppingCart, Tag, Image as ImageIcon, Quote,
  BarChart3, Settings, Shield, X,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/constants";
import { navPermitida } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, CalendarCheck, CalendarDays, Users, Scissors, UserCog,
  Wallet, Banknote, Package, ShoppingCart, Tag, Image: ImageIcon, Quote,
  BarChart3, Settings, Shield,
};

export function Sidebar({
  rol,
  nombre,
  open,
  onClose,
}: {
  rol: string | null;
  nombre: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = navPermitida(rol, ADMIN_NAV);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Scissors className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold">{nombre}</span>
          </Link>
          <button className="lg:hidden" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <ImageIcon className="h-4 w-4" /> Ver sitio público
          </Link>
        </div>
      </aside>
    </>
  );
}
