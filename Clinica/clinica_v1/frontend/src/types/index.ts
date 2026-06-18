export type RoleCode =
  | "SUPER_ADMIN"
  | "ADMIN_CLINICA"
  | "RECEPCION"
  | "MEDICO"
  | "LABORATORIO"
  | "FACTURACION"
  | "PACIENTE";

export interface User {
  id: number;
  clinicaId: number | null;
  rol: RoleCode;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Envoltura uniforme de respuestas de la API. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

// ---------------------------------------------------------------------------
//  CITAS (Entrega 2)
// ---------------------------------------------------------------------------

export type EstadoCita =
  | "SOLICITADA"
  | "PENDIENTE_DOCUMENTOS"
  | "CONFIRMADA"
  | "EN_ESPERA"
  | "EN_ATENCION"
  | "ATENDIDA"
  | "CANCELADA"
  | "NO_ASISTIO";

/** Cita tal como la devuelve el backend (SELECT enriquecido). */
export interface Cita {
  id: number;
  clinica_id: number;
  sede_id: number | null;
  paciente_id: number;
  medico_id: number;
  servicio_id: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoCita;
  motivo: string | null;
  notas: string | null;
  creado_por: number | null;
  created_at: string;
  updated_at: string;
  paciente_nombres: string;
  paciente_apellidos: string;
  paciente_documento: string;
  medico_nombres: string;
  medico_apellidos: string;
  servicio_nombre: string | null;
  servicio_duracion: number | null;
  sede_nombre: string | null;
}

export interface OpcionMedico {
  id: number;
  nombres: string;
  apellidos: string;
  servicio_ids: number[];
}
export interface OpcionServicio {
  id: number;
  nombre: string;
  duracion_minutos: number;
  precio: string;
  especialidad_id: number | null;
  sede_ids: number[];
}
export interface OpcionSede {
  id: number;
  nombre: string;
}
export interface OpcionPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  numero_documento: string;
}
export interface AppointmentOptions {
  medicos: OpcionMedico[];
  servicios: OpcionServicio[];
  sedes: OpcionSede[];
  pacientes: OpcionPaciente[];
}

export interface ListAppointmentsFilters {
  desde?: string;
  hasta?: string;
  medico_id?: number;
  paciente_id?: number;
  sede_id?: number;
  estado?: EstadoCita;
}

export interface CreateAppointmentPayload {
  paciente_id?: number;
  medico_id: number;
  servicio_id?: number;
  sede_id?: number;
  fecha_inicio: string;
  motivo?: string;
  notas?: string;
}

export interface ReschedulePayload {
  fecha_inicio: string;
  servicio_id?: number;
  sede_id?: number;
}

// ---------------------------------------------------------------------------
//  GESTION ADMIN (Entrega 3)
// ---------------------------------------------------------------------------

export interface Paciente {
  id: number;
  clinica_id: number;
  usuario_id: number | null;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string | null;
  sexo: "M" | "F" | "OTRO";
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  eps: string | null;
  grupo_sanguineo: string | null;
  activo: number;
}

export interface Medico {
  id: number;
  clinica_id: number;
  usuario_id: number | null;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  registro_medico: string | null;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  biografia: string | null;
  activo: number;
  especialidad_ids: number[];
  servicio_ids: number[];
}

export interface Servicio {
  id: number;
  clinica_id: number;
  especialidad_id: number | null;
  especialidad_nombre: string | null;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: string;
  requiere_orden: number;
  activo: number;
  sede_ids: number[];
}

export interface Especialidad {
  id: number;
  clinica_id: number;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  activo: number;
}

export interface Sede {
  id: number;
  clinica_id: number;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  activo: number;
}

export interface HorarioMedico {
  id: number;
  clinica_id: number;
  medico_id: number;
  sede_id: number | null;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: number;
}

export interface BloqueoAgenda {
  id: number;
  clinica_id: number;
  medico_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string | null;
}

/** Médico tal como lo expone el directorio público (landing). */
export interface MedicoPublico {
  id: number;
  nombres: string;
  apellidos: string;
  foto_url: string | null;
  biografia: string | null;
  especialidades: string[];
}

// ---------------------------------------------------------------------------
//  DOCUMENTOS y RESULTADOS (Entrega 4)
// ---------------------------------------------------------------------------

export type TipoDocumento =
  | "ORDEN_MEDICA"
  | "AUTORIZACION"
  | "EXAMEN_PREVIO"
  | "HISTORIA_CLINICA"
  | "OTRO";

export interface DocumentoPaciente {
  id: number;
  clinica_id: number;
  paciente_id: number;
  cita_id: number | null;
  tipo: TipoDocumento;
  nombre_archivo: string;
  url: string;
  mime_type: string | null;
  tamano_bytes: number | null;
  subido_por: number | null;
  created_at: string;
  subido_por_nombres: string | null;
  subido_por_apellidos: string | null;
}

export interface ResultadoMedico {
  id: number;
  clinica_id: number;
  paciente_id: number;
  cita_id: number | null;
  servicio_id: number | null;
  titulo: string;
  descripcion: string | null;
  url: string | null;
  fecha_resultado: string | null;
  cargado_por: number | null;
  created_at: string;
  paciente_nombres: string;
  paciente_apellidos: string;
  paciente_documento: string;
  servicio_nombre: string | null;
  cargado_por_nombres: string | null;
  cargado_por_apellidos: string | null;
}

// ---------------------------------------------------------------------------
//  PAGOS (Entrega 5)
// ---------------------------------------------------------------------------

export type EstadoPago = "PENDIENTE" | "PAGADO" | "ANULADO" | "REEMBOLSADO";
export type MetodoPago = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "PSE" | "OTRO";

export interface Pago {
  id: number;
  clinica_id: number;
  paciente_id: number;
  cita_id: number | null;
  numero_factura: string | null;
  concepto: string | null;
  monto: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  fecha_pago: string | null;
  registrado_por: number | null;
  created_at: string;
  paciente_nombres: string;
  paciente_apellidos: string;
  paciente_documento: string;
}

export interface CreatePaymentPayload {
  paciente_id: number;
  cita_id?: number;
  numero_factura?: string;
  concepto?: string;
  monto: number;
  metodo?: MetodoPago;
  estado?: EstadoPago;
}

// ---------------------------------------------------------------------------
//  PQRSF (Entrega 6)
// ---------------------------------------------------------------------------

export type TipoPqrsf = "PETICION" | "QUEJA" | "RECLAMO" | "SUGERENCIA" | "FELICITACION";
export type EstadoPqrsf = "ABIERTA" | "EN_PROCESO" | "RESPONDIDA" | "CERRADA";

export interface Pqrsf {
  id: number;
  clinica_id: number;
  paciente_id: number | null;
  tipo: TipoPqrsf;
  nombre_remitente: string | null;
  email_remitente: string | null;
  telefono_remitente: string | null;
  asunto: string;
  mensaje: string;
  estado: EstadoPqrsf;
  respuesta: string | null;
  respondido_por: number | null;
  fecha_respuesta: string | null;
  created_at: string;
  paciente_nombres: string | null;
  paciente_apellidos: string | null;
  respondido_por_nombres: string | null;
  respondido_por_apellidos: string | null;
}

export interface CreatePqrsfPayload {
  tipo: TipoPqrsf;
  asunto: string;
  mensaje: string;
  nombre_remitente?: string;
  email_remitente?: string;
  telefono_remitente?: string;
  clinica_id?: number;
}

// ---------------------------------------------------------------------------
//  USUARIOS / ROLES y LANDING (Entrega 7)
// ---------------------------------------------------------------------------

export interface Rol {
  id: number;
  codigo: RoleCode;
  nombre: string;
  descripcion: string | null;
}

export interface Usuario {
  id: number;
  clinica_id: number | null;
  rol_id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  activo: number;
  ultimo_login: string | null;
  created_at: string;
  rol_codigo: RoleCode;
  rol_nombre: string;
}

export interface LandingSeccion {
  seccion: string;
  orden: number;
  contenido: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
//  DASHBOARD y NOTIFICACIONES (Entrega 8)
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  rol: RoleCode;
  citasHoy: number;
  citasProximas: number;
  pacientes: number;
  medicos: number;
  pagosMes: number;
  pagosPendientes: number;
  pqrsfAbiertas: number;
  misResultados: number;
  misDocumentos: number;
  misPagosPendientes: number;
}

export interface Notificacion {
  id: number;
  clinica_id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string | null;
  tipo: string;
  leida: number;
  url_destino: string | null;
  created_at: string;
}
