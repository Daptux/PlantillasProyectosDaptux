import type {
  EstadoReserva, MetodoPago, TipoMovimientoFinanciero, TipoMovimientoInventario,
} from "@/types/database";

/** ID de la barberia activa para esta instancia (fallback al demo). */
export const BARBERIA_ID =
  process.env.NEXT_PUBLIC_BARBERIA_ID ?? "00000000-0000-0000-0000-000000000001";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ── Roles ──────────────────────────────────────────────────────────────────
export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  BARBERO: "barbero",
  RECEPCIONISTA: "recepcionista",
  CLIENTE: "cliente",
} as const;

export type RolClave = (typeof ROLES)[keyof typeof ROLES];

// ── Estados de reserva (con metadata visual) ────────────────────────────────
export const ESTADOS_RESERVA: Record<
  EstadoReserva,
  { label: string; color: string; badge: string }
> = {
  pendiente:  { label: "Pendiente",   color: "amber",   badge: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  confirmada: { label: "Confirmada",  color: "blue",    badge: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  en_proceso: { label: "En proceso",  color: "violet",  badge: "bg-violet-500/15 text-violet-600 border-violet-500/30" },
  completada: { label: "Completada",  color: "emerald", badge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  cancelada:  { label: "Cancelada",   color: "rose",    badge: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  no_asistio: { label: "No asistió",  color: "zinc",    badge: "bg-zinc-500/15 text-zinc-600 border-zinc-500/30" },
};

export const ESTADOS_RESERVA_LISTA = Object.keys(ESTADOS_RESERVA) as EstadoReserva[];

// ── Metodos de pago ─────────────────────────────────────────────────────────
export const METODOS_PAGO: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  nequi: "Nequi",
  daviplata: "Daviplata",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  wompi: "Wompi",
  mercado_pago: "Mercado Pago",
  otro: "Otro",
};

export const METODOS_PAGO_LISTA = Object.keys(METODOS_PAGO) as MetodoPago[];

// ── Finanzas ────────────────────────────────────────────────────────────────
export const TIPOS_MOVIMIENTO: Record<TipoMovimientoFinanciero, string> = {
  ingreso: "Ingreso",
  gasto: "Gasto",
};

export const CATEGORIAS_GASTO = [
  "Arriendo", "Servicios publicos", "Insumos", "Nomina",
  "Publicidad", "Mantenimiento", "Compras", "Otros",
];

// ── Inventario ──────────────────────────────────────────────────────────────
export const TIPOS_MOVIMIENTO_INVENTARIO: Record<TipoMovimientoInventario, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

export const CATEGORIAS_GALERIA = [
  { value: "cortes", label: "Cortes" },
  { value: "barbas", label: "Barbas" },
  { value: "antes_despues", label: "Antes y después" },
  { value: "promociones", label: "Promociones" },
  { value: "estilo", label: "Estilo de la barbería" },
  { value: "destacados", label: "Trabajos destacados" },
];

export const DIAS_SEMANA = [
  "domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado",
];

// ── Storage buckets ─────────────────────────────────────────────────────────
export const BUCKETS = {
  LOGOS: "logos",
  GALERIA: "galeria",
  SERVICIOS: "servicios",
  BARBEROS: "barberos",
  PROMOCIONES: "promociones",
  COMPROBANTES: "comprobantes",
} as const;

// ── Navegacion admin ────────────────────────────────────────────────────────
export const ADMIN_NAV = [
  { href: "/admin/dashboard",     label: "Dashboard",     icon: "LayoutDashboard", permiso: "dashboard.ver" },
  { href: "/admin/reservas",      label: "Reservas",      icon: "CalendarCheck",   permiso: "reservas.ver" },
  { href: "/admin/agenda",        label: "Agenda",        icon: "CalendarDays",    permiso: "agenda.ver" },
  { href: "/admin/clientes",      label: "Clientes",      icon: "Users",           permiso: "clientes.ver" },
  { href: "/admin/servicios",     label: "Servicios",     icon: "Scissors",        permiso: "servicios.gestionar" },
  { href: "/admin/barberos",      label: "Barberos",      icon: "UserCog",         permiso: "barberos.gestionar" },
  { href: "/admin/finanzas",      label: "Finanzas",      icon: "Wallet",          permiso: "finanzas.ver" },
  { href: "/admin/caja",          label: "Caja",          icon: "Banknote",        permiso: "caja.gestionar" },
  { href: "/admin/inventario",    label: "Inventario",    icon: "Package",         permiso: "inventario.gestionar" },
  { href: "/admin/ventas",        label: "Ventas",        icon: "ShoppingCart",    permiso: "ventas.gestionar" },
  { href: "/admin/promociones",   label: "Promociones",   icon: "Tag",             permiso: "promociones.gestionar" },
  { href: "/admin/galeria",       label: "Galería",       icon: "Image",           permiso: "galeria.gestionar" },
  { href: "/admin/testimonios",   label: "Testimonios",   icon: "Quote",           permiso: "testimonios.gestionar" },
  { href: "/admin/reportes",      label: "Reportes",      icon: "BarChart3",       permiso: "reportes.ver" },
  { href: "/admin/configuracion", label: "Configuración", icon: "Settings",        permiso: "configuracion.gestionar" },
  { href: "/admin/usuarios",      label: "Usuarios",      icon: "Shield",          permiso: "usuarios.gestionar" },
] as const;

// ── Navegacion publica ──────────────────────────────────────────────────────
export const PUBLIC_NAV = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/barberos", label: "Barberos" },
  { href: "/promociones", label: "Promociones" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];
