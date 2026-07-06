# Arquitectura de ContaHub

## Vision general

ContaHub es una aplicacion Next.js (App Router) full-stack, multi-firma, con una separacion clara en capas:

```
UI (React Server + Client Components)
      │
Route Handlers (app/api/*)  ── validan sesion, permisos y Zod
      │
Services (server/services/*) ── logica de negocio, transacciones
      │
Drizzle ORM ── PostgreSQL
```

## Capas

### 1. Presentacion
- **Server Components** para paginas (fetch inicial en el servidor, seguro y rapido).
- **Client Components** para interactividad (formularios, tablas con filtros, dialogos).
- Componentes UI reutilizables en `components/ui` (patron shadcn/ui sobre Radix).
- Componentes por dominio en `components/<modulo>`.

### 2. API
- Route Handlers REST en `app/api`.
- Helper `lib/api.ts`: `authContext(permiso)`, `handle()` (manejo uniforme de errores), `json()`, `apiError()`.
- Toda ruta protegida valida sesion + permiso antes de tocar datos.

### 3. Servicios
- `server/services/*.service.ts`: una unidad por dominio (clientes, documentos, tareas, solicitudes, checklists, vencimientos, reportes, usuarios, automatizaciones, notificaciones).
- Reciben la `SessionPayload` y aplican el **scope por firma** (y por asignacion para auxiliares).

### 4. Datos
- Drizzle ORM, un unico `database/schema.ts` con enums, tablas, indices, relaciones y tipos inferidos.
- Cliente de BD singleton en `lib/db.ts` (reutilizado en dev para no agotar conexiones).

## Autenticacion y sesion

- Contraseñas hasheadas con **bcrypt**.
- Sesion en un **JWT firmado (HS256, jose)** almacenado en cookie **HttpOnly** (`contahub_session`), `SameSite=Lax`, `Secure` en produccion.
- `middleware.ts` (Edge) verifica el JWT y protege todas las rutas salvo las publicas (`/`, `/login`, `/register`, `/recuperar`, `/subir/*`).
- `lib/auth.ts` centraliza firma/verificacion y manejo de cookie (server-only).

## Autorizacion

- Matriz de permisos por rol en `lib/permissions.ts` (`modulo:accion`, con comodines `modulo:*` y `*`).
- `can(session, permiso)` / `assertCan(...)` y `authContext(permiso)` en la capa API.

## Multi-firma (aislamiento de datos)

- Cada tabla de negocio tiene `firm_id`.
- Los servicios filtran **siempre** por `session.firmId`.
- Auxiliares: filtro adicional por `assigned_user_id`.
- Los archivos se guardan en almacenamiento externo; en la BD solo va URL + metadata + estado.

## Almacenamiento de archivos

- `lib/storage.ts` abstrae la subida: Vercel Blob (si hay token) o disco local (`/public/uploads`) en desarrollo.
- Nombre interno generado: `Cliente_TipoDocumento_Mes_Año_Numero.ext`.

## Automatizaciones

- `server/services/automations.service.ts` concentra la logica; los endpoints `app/api/cron/*` solo validan el `CRON_SECRET` y delegan.
- Idempotentes: generar checklists no duplica los ya existentes.

## Auditoria

- `lib/audit.ts` -> tabla `audit_logs` (usuario, accion, modulo, entidad, datos, IP).
- Se registran acciones criticas: login, CRUD de clientes/usuarios, subida/aprobacion/rechazo de documentos, envio de solicitudes, cierres de mes, generacion de reportes.

## Convenciones

- Validacion de entrada con **Zod** (`lib/validations.ts`), compartida entre cliente (RHF) y servidor.
- Estados y etiquetas legibles centralizados en `lib/labels.ts` (client-safe).
- Manejo de errores con mensajes claros, estados de carga y empty states en toda tabla.
