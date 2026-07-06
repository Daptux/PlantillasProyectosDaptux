# Requerimientos de ContaHub

## Objetivo
Plataforma SaaS para contadores donde centralizar clientes contables, documentos, solicitudes, tareas, checklists mensuales, vencimientos, reportes, alertas y auditoria, con automatizaciones que reducen el trabajo manual. Reemplaza Excel, carpetas desordenadas y WhatsApp como medio de control.

No es un software contable (Siigo/Alegra/World Office): es la capa de **gestion y control**.

## Modulos

| # | Modulo | Estado | Ubicacion |
|---|--------|--------|-----------|
| 1 | Autenticacion y seguridad (JWT, cookies HttpOnly, roles, auditoria) | ✅ | `app/(auth)`, `lib/auth.ts`, `middleware.ts` |
| 2 | Dashboard con KPIs, semaforo, prioridades y graficas | ✅ | `app/(dashboard)/dashboard` |
| 3 | Clientes contables (CRUD + detalle con pestañas) | ✅ | `clientes` |
| 4 | Perfil tributario / obligaciones por cliente | ✅ | `obligations`, `client_obligations` |
| 5 | Gestion documental (subida, estados, renombrado automatico) | ✅ | `documentos`, `lib/storage.ts` |
| 6 | Link seguro de carga (`/subir/[token]`) | ✅ | `app/subir/[token]` |
| 7 | Solicitudes al cliente (token, estados, respuesta) | ✅ | `solicitudes` |
| 8 | Tareas internas (Kanban, prioridades, estados) | ✅ | `tareas` |
| 9 | Checklist mensual automatico + semaforo | ✅ | `checklists` |
| 10 | Calendario de vencimientos (configurable) | ✅ | `vencimientos` |
| 11 | Reportes PDF/Excel | ✅ | `reportes`, `lib/pdf.ts` |
| 12 | Notificaciones internas | ✅ | `notifications` |
| 13 | Plantillas de mensajes con variables | ✅ | `message_templates` |
| 14 | Automatizaciones (cron) | ✅ | `app/api/cron/*` |
| 15 | Auditoria de acciones criticas | ✅ | `audit_logs`, `lib/audit.ts` |
| 16 | Diseño moderno SaaS (sidebar, header, badges, semaforos) | ✅ | `components/` |
| 17 | Pantallas principales | ✅ | `app/(dashboard)/*` |
| 18 | Base de datos (Drizzle, 21 tablas) | ✅ | `database/schema.ts` |
| 19 | Seed inicial (firma, usuarios, 3 clientes, catalogos, checklists, tareas, solicitudes, documentos) | ✅ | `database/seed.ts` |
| 20 | APIs REST | ✅ | `app/api/*` |

## Estados

- **Documento**: pendiente, aprobado, rechazado, falta_soporte, falta_informacion, procesado, archivado.
- **Solicitud**: borrador, enviada, vista, respondida, parcial, vencida, cerrada, cancelada.
- **Tarea**: pendiente, en_proceso, completada, vencida, cancelada.
- **Checklist item**: pendiente, en_proceso, completado, no_aplica.
- **Semaforo**: verde (80-100%), amarillo (50-79%), rojo (<50% o critico vencido).

## Reglas clave
- Multiempresa desde el inicio (`firm_id` en todo).
- Aislamiento por firma; auxiliares limitados a clientes asignados.
- Archivos fuera de la BD (solo URL + metadata).
- Soft delete en registros criticos.
- Fechas tributarias configurables (no quemadas).
- Validacion Zod, estados de carga, empty states, filtros y busqueda en tablas.

## Pendientes / mejoras futuras
- Edicion CRUD visual de obligaciones, tipos de documento y plantillas desde Configuracion (hoy se muestran; el modelo y APIs base ya existen).
- Panel de auditoria por entidad en el detalle del cliente.
- Exportacion Excel de listados (ExcelJS ya incluido).
- Recuperacion de contraseña con pantalla de reseteo por token (el endpoint de solicitud ya existe).
- Superadmin: panel de gestion de firmas y planes.
