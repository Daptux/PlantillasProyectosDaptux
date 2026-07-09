/**
 * Tipos de la base de datos BarberPro Studio.
 *
 * En un proyecto real conviene generar estos tipos con:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 *
 * Aqui se mantienen a mano, alineados con supabase/migrations/001_initial_schema.sql.
 */

// ── Enums ──────────────────────────────────────────────────────────────────
export type EstadoReserva =
  | "pendiente" | "confirmada" | "en_proceso"
  | "completada" | "cancelada" | "no_asistio";

export type TipoMovimientoFinanciero = "ingreso" | "gasto";

export type MetodoPago =
  | "efectivo" | "nequi" | "daviplata" | "transferencia"
  | "tarjeta" | "wompi" | "mercado_pago" | "otro";

export type TipoMovimientoInventario = "entrada" | "salida" | "ajuste";
export type EstadoGenerico = "activo" | "inactivo";
export type EstadoCaja = "abierta" | "cerrada";
export type SegmentoCliente = "activo" | "frecuente" | "inactivo";

// Utilidad para construir la config de cada tabla (Row/Insert/Update)
type Tbl<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type Base = { id: string; created_at: string; updated_at?: string };

// ── Filas ──────────────────────────────────────────────────────────────────
export interface Barberia extends Base {
  nombre: string; slug: string; nit: string | null;
  estado: EstadoGenerico; deleted_at: string | null;
}

export interface ConfiguracionBarberia extends Base {
  barberia_id: string; nombre_comercial: string;
  eslogan: string | null; descripcion: string | null;
  logo_url: string | null; favicon_url: string | null; hero_imagen_url: string | null;
  color_primario: string | null; color_secundario: string | null; color_acento: string | null;
  tipografia: string | null;
  direccion: string | null; ciudad: string | null;
  telefono: string | null; whatsapp: string | null; correo: string | null;
  instagram: string | null; facebook: string | null; tiktok: string | null;
  google_maps_url: string | null; google_maps_embed: string | null;
  landing_titulo: string | null; landing_subtitulo: string | null; landing_por_que_texto: string | null;
  reserva_automatica: boolean; anticipacion_minima_min: number; cancelacion_horas: number;
  mensaje_confirmacion: string | null; mensaje_whatsapp: string | null;
  horarios: Record<string, { abre: string; cierra: string; cerrado: boolean }>;
}

export interface Rol extends Base {
  barberia_id: string | null; clave: string; nombre: string;
  descripcion: string | null; es_sistema: boolean;
}

export interface PerfilUsuario extends Base {
  auth_user_id: string | null; barberia_id: string; rol_id: string | null;
  nombre: string; correo: string | null; celular: string | null;
  avatar_url: string | null; estado: EstadoGenerico;
  ultimo_acceso: string | null; deleted_at: string | null;
}

export interface Cliente extends Base {
  barberia_id: string; auth_user_id: string | null;
  nombre: string; celular: string | null; correo: string | null;
  fecha_nacimiento: string | null; observaciones: string | null;
  preferencias: string | null; notas_internas: string | null;
  barbero_favorito: string | null; segmento: SegmentoCliente;
  total_gastado: number; numero_visitas: number; ultima_visita: string | null;
  estado: EstadoGenerico; deleted_at: string | null;
}

export interface Barbero extends Base {
  barberia_id: string; perfil_usuario_id: string | null;
  nombre: string; foto_url: string | null; celular: string | null; correo: string | null;
  documento: string | null; especialidad: string | null; descripcion: string | null;
  experiencia: string | null; instagram: string | null;
  porcentaje_comision: number; salario_base: number | null; fecha_ingreso: string | null;
  valoracion: number | null; destacado: boolean; orden: number;
  estado: EstadoGenerico; deleted_at: string | null;
}

export interface CategoriaServicio extends Base {
  barberia_id: string; nombre: string; slug: string | null;
  orden: number; estado: EstadoGenerico;
}

export interface Servicio extends Base {
  barberia_id: string; categoria_id: string | null;
  nombre: string; descripcion: string | null; precio: number; duracion_min: number;
  imagen_url: string | null; comision_sugerida: number | null;
  destacado: boolean; orden: number; estado: EstadoGenerico; deleted_at: string | null;
}

export interface Reserva extends Base {
  barberia_id: string; cliente_id: string | null; barbero_id: string | null; servicio_id: string | null;
  cliente_nombre: string; cliente_celular: string | null; cliente_correo: string | null;
  fecha: string; hora_inicio: string; hora_fin: string; precio: number;
  estado: EstadoReserva; observaciones: string | null;
  metodo_pago: MetodoPago | null; comprobante_url: string | null;
  origen: string; deleted_at: string | null;
}

export interface Promocion extends Base {
  barberia_id: string; nombre: string; descripcion: string | null; imagen_url: string | null;
  precio_anterior: number | null; precio_promocional: number;
  fecha_inicio: string | null; fecha_fin: string | null;
  mostrar_landing: boolean; estado: EstadoGenerico; orden: number; deleted_at: string | null;
}

export interface Galeria extends Base {
  barberia_id: string; titulo: string | null; descripcion: string | null;
  imagen_url: string; categoria: string | null;
  destacada: boolean; visible: boolean; orden: number; deleted_at: string | null;
}

export interface Testimonio extends Base {
  barberia_id: string; nombre_cliente: string; foto_url: string | null;
  comentario: string; calificacion: number; visible: boolean; orden: number; deleted_at: string | null;
}

export interface Producto extends Base {
  barberia_id: string; categoria_id: string | null; proveedor_id: string | null;
  nombre: string; descripcion: string | null; imagen_url: string | null;
  unidad_medida: string | null; stock_actual: number; stock_minimo: number;
  precio_compra: number; precio_venta: number | null; es_vendible: boolean;
  estado: EstadoGenerico; deleted_at: string | null;
}

export interface MovimientoInventario {
  id: string; barberia_id: string; producto_id: string;
  tipo: TipoMovimientoInventario; cantidad: number;
  motivo: string | null; referencia: string | null; usuario_id: string | null; created_at: string;
}

export interface FinanzaMovimiento extends Base {
  barberia_id: string; caja_id: string | null; categoria_id: string | null;
  tipo: TipoMovimientoFinanciero; concepto: string; monto: number; metodo_pago: MetodoPago;
  barbero_id: string | null; reserva_id: string | null; venta_id: string | null;
  usuario_id: string | null; fecha: string; comprobante_url: string | null; deleted_at: string | null;
}

export interface Caja extends Base {
  barberia_id: string; usuario_apertura: string | null; usuario_cierre: string | null;
  monto_inicial: number; monto_final: number | null;
  total_ingresos: number; total_gastos: number;
  estado: EstadoCaja; abierta_at: string; cerrada_at: string | null; observaciones: string | null;
}

export interface LeadContacto extends Base {
  barberia_id: string; nombre: string; celular: string | null; correo: string | null;
  mensaje: string | null; origen: string; atendido: boolean;
}

// ── Database (para los clientes de Supabase) ────────────────────────────────
export interface Database {
  public: {
    Tables: {
      barberias: Tbl<Barberia>;
      configuracion_barberia: Tbl<ConfiguracionBarberia>;
      roles: Tbl<Rol>;
      permisos: Tbl<{ id: string; clave: string; modulo: string; descripcion: string | null; created_at: string }>;
      rol_permisos: Tbl<{ id: string; rol_id: string; permiso_id: string }>;
      perfiles_usuario: Tbl<PerfilUsuario>;
      clientes: Tbl<Cliente>;
      barberos: Tbl<Barbero>;
      categorias_servicios: Tbl<CategoriaServicio>;
      servicios: Tbl<Servicio>;
      barbero_servicios: Tbl<{ id: string; barbero_id: string; servicio_id: string }>;
      horarios_barberos: Tbl<{ id: string; barberia_id: string; barbero_id: string; dia_semana: number; hora_inicio: string; hora_fin: string; activo: boolean; created_at: string; updated_at: string }>;
      bloqueos_agenda: Tbl<{ id: string; barberia_id: string; barbero_id: string | null; motivo: string; descripcion: string | null; inicio: string; fin: string; created_at: string; updated_at: string }>;
      reservas: Tbl<Reserva>;
      promociones: Tbl<Promocion>;
      promocion_servicios: Tbl<{ id: string; promocion_id: string; servicio_id: string }>;
      galeria: Tbl<Galeria>;
      testimonios: Tbl<Testimonio>;
      categorias_productos: Tbl<{ id: string; barberia_id: string; nombre: string; estado: EstadoGenerico; created_at: string; updated_at: string }>;
      proveedores: Tbl<{ id: string; barberia_id: string; nombre: string; contacto: string | null; telefono: string | null; correo: string | null; estado: EstadoGenerico; created_at: string; updated_at: string }>;
      productos: Tbl<Producto>;
      movimientos_inventario: Tbl<MovimientoInventario>;
      ventas_productos: Tbl<{ id: string; barberia_id: string; cliente_id: string | null; vendedor_id: string | null; total: number; metodo_pago: MetodoPago; observaciones: string | null; created_at: string; updated_at: string }>;
      detalle_ventas_productos: Tbl<{ id: string; venta_id: string; producto_id: string | null; producto_nombre: string; cantidad: number; precio_unitario: number; subtotal: number }>;
      categorias_financieras: Tbl<{ id: string; barberia_id: string; nombre: string; tipo: TipoMovimientoFinanciero; es_sistema: boolean; created_at: string; updated_at: string }>;
      cajas: Tbl<Caja>;
      finanzas_movimientos: Tbl<FinanzaMovimiento>;
      pagos: Tbl<{ id: string; barberia_id: string; barbero_id: string; concepto: string; monto: number; metodo_pago: MetodoPago; periodo_desde: string | null; periodo_hasta: string | null; usuario_id: string | null; created_at: string; updated_at: string }>;
      comisiones_barberos: Tbl<{ id: string; barberia_id: string; barbero_id: string; reserva_id: string | null; base: number; porcentaje: number; monto: number; pagado: boolean; pago_id: string | null; created_at: string; updated_at: string }>;
      leads_contacto: Tbl<LeadContacto>;
      notificaciones: Tbl<{ id: string; barberia_id: string; usuario_id: string | null; tipo: string; titulo: string; mensaje: string | null; url: string | null; leida: boolean; created_at: string }>;
      logs_actividad: Tbl<{ id: string; barberia_id: string | null; usuario_id: string | null; accion: string; entidad: string; entidad_id: string | null; detalle: unknown; ip: string | null; created_at: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      estado_reserva: EstadoReserva;
      tipo_movimiento_financiero: TipoMovimientoFinanciero;
      metodo_pago: MetodoPago;
      tipo_movimiento_inventario: TipoMovimientoInventario;
    };
  };
}
