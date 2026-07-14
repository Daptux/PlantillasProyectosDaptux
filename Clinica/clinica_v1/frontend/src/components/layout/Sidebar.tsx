import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Briefcase,
  Tags,
  FileText,
  FlaskConical,
  CreditCard,
  MessageSquareWarning,
  UserCog,
  Globe,
  LogOut,
  HeartPulse,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { RoleCode } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: RoleCode[];
  /** Encabezado de grupo opcional para ordenar el menu. */
  group?: string;
}

const ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION", "FACTURACION", "LABORATORIO"] },
  { to: "/medico", label: "Inicio", icon: LayoutDashboard, roles: ["MEDICO"] },
  { to: "/medico/agenda", label: "Mi agenda", icon: CalendarDays, roles: ["MEDICO"] },
  { to: "/paciente", label: "Mi panel", icon: LayoutDashboard, roles: ["PACIENTE"] },
  { to: "/paciente/citas", label: "Mis citas", icon: CalendarDays, roles: ["PACIENTE"] },
  { to: "/paciente/documentos", label: "Mis documentos", icon: FileText, roles: ["PACIENTE"] },
  { to: "/paciente/resultados", label: "Mis resultados", icon: FlaskConical, roles: ["PACIENTE"] },
  { to: "/paciente/pagos", label: "Mis pagos", icon: CreditCard, roles: ["PACIENTE"] },
  { to: "/paciente/pqrsf", label: "PQRSF", icon: MessageSquareWarning, roles: ["PACIENTE"] },
  { to: "/admin/pacientes", label: "Pacientes", icon: Users, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION"], group: "Gestion" },
  { to: "/admin/citas", label: "Citas", icon: CalendarDays, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION"], group: "Gestion" },
  { to: "/admin/medicos", label: "Medicos", icon: Stethoscope, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"], group: "Gestion" },
  { to: "/admin/servicios", label: "Servicios", icon: Briefcase, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"], group: "Gestion" },
  { to: "/admin/catalogos", label: "Catalogos", icon: Tags, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"], group: "Gestion" },
  { to: "/admin/resultados", label: "Resultados", icon: FileText, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "LABORATORIO"], group: "Operacion" },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "FACTURACION"], group: "Operacion" },
  { to: "/admin/pqrsf", label: "PQRSF", icon: MessageSquareWarning, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION"], group: "Operacion" },
  { to: "/admin/usuarios", label: "Usuarios", icon: UserCog, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"], group: "Configuracion" },
  { to: "/admin/landing", label: "Landing", icon: Globe, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"], group: "Configuracion" },
];

interface SidebarProps {
  /** Estado del drawer en movil. */
  open: boolean;
  onClose: () => void;
}

/** Sidebar del panel privado, filtrado por rol. Drawer en movil, fijo en escritorio. */
export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const rol = user?.rol;

  const items = ITEMS.filter((i) => (rol ? i.roles.includes(rol) : false));

  // Agrupa respetando el orden de aparicion. Los items sin grupo van primero (sin titulo).
  const groups: { title: string | null; items: NavItem[] }[] = [];
  for (const item of items) {
    const title = item.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.items.push(item);
    else groups.push({ title, items: [item] });
  }

  return (
    <>
      {/* Velo oscuro detras del drawer en movil */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-r bg-card transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2 font-extrabold text-primary">
            <HeartPulse className="h-6 w-6" />
            <span>Salud Vital</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {groups.map((g, gi) => (
            <div key={gi} className="space-y-1">
              {g.title && (
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {g.title}
                </div>
              )}
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  end={item.to === "/admin" || item.to === "/medico" || item.to === "/paciente"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t p-3">
          <div className="mb-2 px-3 text-xs text-muted-foreground">
            {user?.nombres} {user?.apellidos}
            <div className="font-semibold text-foreground">{user?.rol}</div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
}
