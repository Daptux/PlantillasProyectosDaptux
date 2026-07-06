/**
 * Datos por defecto para una firma nueva (tipos de documento, obligaciones,
 * plantillas). Modulo plano (sin "server-only") para poder reutilizarlo tanto
 * en los servicios del servidor como en el script de seed ejecutado con tsx.
 */

export const DEFAULT_DOCUMENT_TYPES = [
  { name: "Factura de venta", requiredByDefault: true },
  { name: "Factura de compra", requiredByDefault: true },
  { name: "Gasto", requiredByDefault: false },
  { name: "Comprobante de pago", requiredByDefault: true },
  { name: "Extracto bancario", requiredByDefault: true },
  { name: "Nomina", requiredByDefault: false },
  { name: "Seguridad social", requiredByDefault: false },
  { name: "Documento soporte", requiredByDefault: false },
  { name: "Declaracion tributaria", requiredByDefault: false },
  { name: "Certificado", requiredByDefault: false },
  { name: "Contrato", requiredByDefault: false },
  { name: "Otro", requiredByDefault: false },
];

export const DEFAULT_OBLIGATIONS = [
  { name: "IVA", defaultPeriodicity: "bimestral" as const },
  { name: "Retencion en la fuente", defaultPeriodicity: "mensual" as const },
  { name: "ICA", defaultPeriodicity: "bimestral" as const },
  { name: "Renta", defaultPeriodicity: "anual" as const },
  { name: "Nomina electronica", defaultPeriodicity: "mensual" as const },
  { name: "Seguridad social", defaultPeriodicity: "mensual" as const },
  { name: "Documento soporte", defaultPeriodicity: "mensual" as const },
  { name: "Informacion exogena", defaultPeriodicity: "anual" as const },
  { name: "Renovacion camara de comercio", defaultPeriodicity: "anual" as const },
  { name: "Reporte mensual interno", defaultPeriodicity: "mensual" as const },
];

export const DEFAULT_TEMPLATES = [
  {
    name: "Solicitud de documentos",
    type: "solicitud",
    subject: "Documentos pendientes - {{cliente}}",
    body: "Hola, necesitamos que cargues los documentos correspondientes al mes de {{mes}} de {{ano}} para {{cliente}}. Puedes subirlos en el siguiente enlace: {{link}}. Fecha limite: {{fecha_limite}}. Gracias, {{contador}}.",
  },
  {
    name: "Recordatorio de documentos",
    type: "recordatorio",
    subject: "Recordatorio: documentos {{mes}} {{ano}}",
    body: "Hola {{cliente}}, te recordamos que aun estan pendientes documentos del mes de {{mes}}. Puedes subirlos aqui: {{link}}. Fecha limite: {{fecha_limite}}.",
  },
  {
    name: "Documento rechazado",
    type: "rechazo",
    subject: "Documento rechazado - {{cliente}}",
    body: "Hola {{cliente}}, uno de los documentos enviados fue rechazado. Por favor revisa y vuelve a cargarlo en: {{link}}.",
  },
  {
    name: "Falta soporte",
    type: "soporte",
    subject: "Falta soporte - {{cliente}}",
    body: "Hola {{cliente}}, necesitamos el soporte del documento cargado. Puedes subirlo en: {{link}}.",
  },
  {
    name: "Reporte mensual listo",
    type: "reporte",
    subject: "Reporte mensual {{mes}} {{ano}} - {{cliente}}",
    body: "Hola {{cliente}}, tu reporte mensual de {{mes}} de {{ano}} ya esta listo. Puedes descargarlo aqui: {{link}}. Saludos, {{contador}}.",
  },
];
