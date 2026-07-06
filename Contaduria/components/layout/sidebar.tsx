"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Send,
  CalendarClock,
  BarChart3,
  UserCog,
  Settings,
  ListChecks,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/permissions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/solicitudes", label: "Solicitudes", icon: Send },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/checklists", label: "Checklists", icon: ListChecks },
  { href: "/vencimientos", label: "Vencimientos", icon: CalendarClock },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  {
    href: "/usuarios",
    label: "Usuarios",
    icon: UserCog,
    roles: ["contador", "superadmin"],
  },
  {
    href: "/configuracion",
    label: "Configuracion",
    icon: Settings,
    roles: ["contador", "superadmin"],
  },
];

export function Sidebar({
  role,
  firmName,
  open,
  onClose,
}: {
  role: Role;
  firmName: string;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r bg-card flex flex-col transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              C
            </span>
            ContaHub
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">Firma contable</p>
          <p className="text-sm font-medium truncate">{firmName}</p>
        </div>
      </aside>
    </>
  );
}
