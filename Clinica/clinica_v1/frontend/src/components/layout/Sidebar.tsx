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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { RoleCode } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: RoleCode[];
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
  { to: "/admin/pacientes", label: "Pacientes", icon: Users, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION"] },
  { to: "/admin/citas", label: "Citas", icon: CalendarDays, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION"] },
  { to: "/admin/medicos", label: "Medicos", icon: Stethoscope, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"] },
  { to: "/admin/servicios", label: "Servicios", icon: Briefcase, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"] },
  { to: "/admin/catalogos", label: "Catalogos", icon: Tags, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"] },
  { to: "/admin/resultados", label: "Resultados", icon: FileText, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "LABORATORIO"] },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "FACTURACION"] },
  { to: "/admin/pqrsf", label: "PQRSF", icon: MessageSquareWarning, roles: ["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION"] },
  { to: "/admin/usuarios", label: "Usuarios", icon: UserCog, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"] },
  { to: "/admin/landing", label: "Landing", icon: Globe, roles: ["SUPER_ADMIN", "ADMIN_CLINICA"] },
];

/** Sidebar del panel privado, filtrado por rol. */
export default function Sidebar() {
  const { user, logout } = useAuth();
  const rol = user?.rol;

  const items = ITEMS.filter((i) => (rol ? i.roles.includes(rol) : false));

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-5 font-extrabold text-primary">
        <HeartPulse className="h-6 w-6" />
        <span>Salud Vital</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin" || item.to === "/medico" || item.to === "/paciente"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
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
  );
}
