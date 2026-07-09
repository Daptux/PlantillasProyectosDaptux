import { z } from "zod";

// ── Helpers ──────────────────────────────────────────────────────────────────
const celular = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s-]{7,15}$/, "Celular invalido");

const correoOpcional = z
  .string()
  .trim()
  .email("Correo invalido")
  .optional()
  .or(z.literal(""));

// ── Reservas ─────────────────────────────────────────────────────────────────
export const reservaPublicaSchema = z.object({
  servicio_id: z.string().uuid("Selecciona un servicio"),
  barbero_id: z.string().uuid().nullable().optional(),
  hora_inicio: z.string().datetime({ offset: true }),
  cliente_nombre: z.string().trim().min(2, "Ingresa tu nombre"),
  cliente_celular: celular,
  cliente_correo: correoOpcional,
  observaciones: z.string().trim().max(500).optional(),
});

export const reservaAdminSchema = reservaPublicaSchema.extend({
  cliente_id: z.string().uuid().nullable().optional(),
  precio: z.coerce.number().min(0).optional(),
  metodo_pago: z.string().optional(),
  estado: z.string().optional(),
});

export const cambiarEstadoReservaSchema = z.object({
  estado: z.enum([
    "pendiente", "confirmada", "en_proceso",
    "completada", "cancelada", "no_asistio",
  ]),
  metodo_pago: z
    .enum(["efectivo", "nequi", "daviplata", "transferencia", "tarjeta", "wompi", "mercado_pago", "otro"])
    .optional(),
});

// ── Servicios ────────────────────────────────────────────────────────────────
export const servicioSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
  descripcion: z.string().trim().max(1000).optional().or(z.literal("")),
  categoria_id: z.string().uuid().nullable().optional(),
  precio: z.coerce.number().min(0, "Precio invalido"),
  duracion_min: z.coerce.number().int().min(5, "Duracion minima 5 min"),
  imagen_url: z.string().url().optional().or(z.literal("")),
  comision_sugerida: z.coerce.number().min(0).max(100).optional(),
  destacado: z.boolean().optional(),
  orden: z.coerce.number().int().optional(),
  estado: z.enum(["activo", "inactivo"]).optional(),
});

// ── Barberos ─────────────────────────────────────────────────────────────────
export const barberoSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
  foto_url: z.string().url().optional().or(z.literal("")),
  celular: celular.optional().or(z.literal("")),
  correo: correoOpcional,
  documento: z.string().trim().optional().or(z.literal("")),
  especialidad: z.string().trim().optional().or(z.literal("")),
  descripcion: z.string().trim().max(1000).optional().or(z.literal("")),
  experiencia: z.string().trim().optional().or(z.literal("")),
  instagram: z.string().trim().optional().or(z.literal("")),
  porcentaje_comision: z.coerce.number().min(0).max(100).optional(),
  salario_base: z.coerce.number().min(0).optional(),
  fecha_ingreso: z.string().optional().or(z.literal("")),
  destacado: z.boolean().optional(),
  estado: z.enum(["activo", "inactivo"]).optional(),
  servicios: z.array(z.string().uuid()).optional(),
});

// ── Clientes ─────────────────────────────────────────────────────────────────
export const clienteSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
  celular: celular.optional().or(z.literal("")),
  correo: correoOpcional,
  fecha_nacimiento: z.string().optional().or(z.literal("")),
  observaciones: z.string().trim().max(1000).optional().or(z.literal("")),
  preferencias: z.string().trim().max(500).optional().or(z.literal("")),
  notas_internas: z.string().trim().max(1000).optional().or(z.literal("")),
  barbero_favorito: z.string().uuid().nullable().optional(),
});

// ── Finanzas ─────────────────────────────────────────────────────────────────
export const movimientoFinancieroSchema = z.object({
  tipo: z.enum(["ingreso", "gasto"]),
  concepto: z.string().trim().min(2, "Concepto requerido"),
  monto: z.coerce.number().positive("Monto debe ser positivo"),
  metodo_pago: z.enum(["efectivo", "nequi", "daviplata", "transferencia", "tarjeta", "wompi", "mercado_pago", "otro"]),
  categoria_id: z.string().uuid().nullable().optional(),
  barbero_id: z.string().uuid().nullable().optional(),
  fecha: z.string().optional(),
});

// ── Caja ─────────────────────────────────────────────────────────────────────
export const abrirCajaSchema = z.object({
  monto_inicial: z.coerce.number().min(0),
  observaciones: z.string().trim().optional(),
});

export const cerrarCajaSchema = z.object({
  monto_final: z.coerce.number().min(0),
  observaciones: z.string().trim().optional(),
});

// ── Inventario ───────────────────────────────────────────────────────────────
export const productoSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
  descripcion: z.string().trim().optional().or(z.literal("")),
  categoria_id: z.string().uuid().nullable().optional(),
  proveedor_id: z.string().uuid().nullable().optional(),
  imagen_url: z.string().url().optional().or(z.literal("")),
  unidad_medida: z.string().trim().optional(),
  stock_actual: z.coerce.number().min(0).optional(),
  stock_minimo: z.coerce.number().min(0).optional(),
  precio_compra: z.coerce.number().min(0),
  precio_venta: z.coerce.number().min(0).optional(),
  es_vendible: z.boolean().optional(),
  estado: z.enum(["activo", "inactivo"]).optional(),
});

export const movimientoInventarioSchema = z.object({
  producto_id: z.string().uuid(),
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  cantidad: z.coerce.number().positive(),
  motivo: z.string().trim().optional(),
});

// ── Ventas ───────────────────────────────────────────────────────────────────
export const ventaSchema = z.object({
  cliente_id: z.string().uuid().nullable().optional(),
  metodo_pago: z.enum(["efectivo", "nequi", "daviplata", "transferencia", "tarjeta", "wompi", "mercado_pago", "otro"]),
  observaciones: z.string().trim().optional(),
  items: z.array(z.object({
    producto_id: z.string().uuid(),
    cantidad: z.coerce.number().positive(),
  })).min(1, "Agrega al menos un producto"),
});

// ── Promociones ──────────────────────────────────────────────────────────────
export const promocionSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
  descripcion: z.string().trim().optional().or(z.literal("")),
  imagen_url: z.string().url().optional().or(z.literal("")),
  precio_anterior: z.coerce.number().min(0).optional(),
  precio_promocional: z.coerce.number().min(0),
  fecha_inicio: z.string().optional().or(z.literal("")),
  fecha_fin: z.string().optional().or(z.literal("")),
  mostrar_landing: z.boolean().optional(),
  estado: z.enum(["activo", "inactivo"]).optional(),
  servicios: z.array(z.string().uuid()).optional(),
});

// ── Galeria ──────────────────────────────────────────────────────────────────
export const galeriaSchema = z.object({
  titulo: z.string().trim().optional().or(z.literal("")),
  descripcion: z.string().trim().optional().or(z.literal("")),
  imagen_url: z.string().url("Imagen requerida"),
  categoria: z.string().optional(),
  destacada: z.boolean().optional(),
  visible: z.boolean().optional(),
  orden: z.coerce.number().int().optional(),
});

// ── Testimonios ──────────────────────────────────────────────────────────────
export const testimonioSchema = z.object({
  nombre_cliente: z.string().trim().min(2, "Nombre requerido"),
  foto_url: z.string().url().optional().or(z.literal("")),
  comentario: z.string().trim().min(5, "Comentario requerido"),
  calificacion: z.coerce.number().int().min(1).max(5),
  visible: z.boolean().optional(),
});

// ── Contacto / Leads ─────────────────────────────────────────────────────────
export const contactoSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre"),
  celular: celular,
  correo: correoOpcional,
  mensaje: z.string().trim().min(5, "Escribe un mensaje"),
});

// ── Configuracion ────────────────────────────────────────────────────────────
export const configuracionSchema = z.object({
  nombre_comercial: z.string().trim().min(1),
  eslogan: z.string().trim().optional().or(z.literal("")),
  descripcion: z.string().trim().optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
  hero_imagen_url: z.string().url().optional().or(z.literal("")),
  color_primario: z.string().optional(),
  color_secundario: z.string().optional(),
  color_acento: z.string().optional(),
  direccion: z.string().trim().optional().or(z.literal("")),
  ciudad: z.string().trim().optional().or(z.literal("")),
  telefono: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  correo: correoOpcional,
  instagram: z.string().trim().optional().or(z.literal("")),
  facebook: z.string().trim().optional().or(z.literal("")),
  tiktok: z.string().trim().optional().or(z.literal("")),
  google_maps_url: z.string().trim().optional().or(z.literal("")),
  reserva_automatica: z.boolean().optional(),
  anticipacion_minima_min: z.coerce.number().int().min(0).optional(),
  cancelacion_horas: z.coerce.number().int().min(0).optional(),
  mensaje_confirmacion: z.string().trim().optional().or(z.literal("")),
  mensaje_whatsapp: z.string().trim().optional().or(z.literal("")),
});

// ── Usuarios ─────────────────────────────────────────────────────────────────
export const usuarioSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
  correo: z.string().trim().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres").optional(),
  rol_id: z.string().uuid("Selecciona un rol"),
  celular: celular.optional().or(z.literal("")),
  estado: z.enum(["activo", "inactivo"]).optional(),
});

export const loginSchema = z.object({
  correo: z.string().trim().email("Correo invalido"),
  password: z.string().min(1, "Contraseña requerida"),
});
