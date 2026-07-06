# ContaHub

Plataforma SaaS de **gestion contable-administrativa** para contadores y oficinas contables. Centraliza clientes, documentos, solicitudes, tareas, checklists mensuales, vencimientos, reportes, notificaciones y auditoria — con automatizaciones que reducen el trabajo manual.

> No es un software contable tipo Siigo/Alegra. Es la capa de **control y organizacion** para que el contador sepa siempre: que cliente esta atrasado, que documentos faltan, que tareas estan vencidas y que mes ya esta cerrado.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + componentes estilo **shadcn/ui** (Radix UI)
- **PostgreSQL** + **Drizzle ORM**
- Autenticacion con **JWT (jose)** + cookies **HttpOnly**
- **Zod** (validaciones) + **React Hook Form**
- **Recharts** (graficas), **Lucide** (iconos), **Sonner** (toasts)
- **PDFKit** (reportes PDF), **ExcelJS** (exportaciones)
- Almacenamiento: **Vercel Blob** (con fallback local en desarrollo)
- Correo: **Resend** o **SMTP/Nodemailer**
- Automatizaciones: **Vercel Cron Jobs**

## Requisitos

- Node.js 20+
- PostgreSQL 14+ (local, o Neon/Supabase/Vercel Postgres)

## Puesta en marcha (local)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
#   Edita .env.local y define al menos DATABASE_URL y AUTH_SECRET
#   Genera un secreto: openssl rand -base64 32

# 3. Crear las tablas en la base de datos
npm run db:push        # aplica el schema directamente (rapido para desarrollo)
#   o bien: npm run db:migrate   (aplica las migraciones de database/migrations)

# 4. Sembrar datos demo
npm run db:seed

# 5. Levantar el servidor
npm run dev
```

Abre http://localhost:3000

### Credenciales demo (contraseña: `contahub123`)

| Rol        | Correo                    |
|------------|---------------------------|
| Contador   | contador@contahub.com     |
| Auxiliar   | auxiliar@contahub.com     |
| Revisor    | revisor@contahub.com      |
| Superadmin | superadmin@contahub.com   |

## Scripts

| Script              | Descripcion                                        |
|---------------------|----------------------------------------------------|
| `npm run dev`       | Servidor de desarrollo                             |
| `npm run build`     | Build de produccion                                |
| `npm run start`     | Servir el build                                    |
| `npm run db:generate` | Generar migraciones SQL desde el schema          |
| `npm run db:push`   | Aplicar el schema directamente a la BD             |
| `npm run db:migrate`| Aplicar migraciones                                |
| `npm run db:studio` | Explorador visual de la BD (Drizzle Studio)        |
| `npm run db:seed`   | Cargar datos demo                                  |

## Estructura

```
app/
  (auth)/            login, register, recuperar
  (dashboard)/       dashboard, clientes, documentos, solicitudes,
                     tareas, checklists, vencimientos, reportes,
                     usuarios, configuracion
  subir/[token]/     carga publica de documentos (cliente externo)
  api/               endpoints REST (auth, clientes, documentos, upload,
                     solicitudes, tareas, checklists, vencimientos,
                     reportes, usuarios, notificaciones, cron)
components/          ui/ (shadcn) + modulos (clientes, documentos, ...)
lib/                 db, auth, permissions, storage, mail, pdf, utils,
                     validations, audit, api, labels, cron
server/services/     logica de negocio por dominio
database/            schema.ts, migrations/, seed.ts, migrate.ts
docs/                requerimientos, arquitectura, roles-permisos, flujo
```

## Roles y permisos

- **Superadmin**: administra el SaaS (firmas, planes, soporte).
- **Contador principal**: dueño de la firma; CRUD completo, cierra meses, aprueba documentos, genera reportes.
- **Auxiliar contable**: ve clientes asignados, sube y clasifica documentos, completa tareas.
- **Revisor/Auditor**: revisa y aprueba/rechaza documentos, valida cierres, consulta auditoria.
- **Cliente externo**: sin panel; solo el link seguro `/subir/[token]` para responder solicitudes.

La matriz completa esta en [`lib/permissions.ts`](lib/permissions.ts) y [`docs/roles-permisos.md`](docs/roles-permisos.md).

## Multiempresa (multi-firma)

Todo el modelo esta particionado por `firm_id`. Cada consulta se limita a la firma de la sesion; los auxiliares ademas solo ven sus clientes asignados. Los archivos nunca se guardan en la BD (solo URL + metadata).

## Automatizaciones (Cron)

Definidas en [`vercel.json`](vercel.json):

| Endpoint                         | Cron           | Que hace                                             |
|----------------------------------|----------------|------------------------------------------------------|
| `/api/cron/generar-checklists`   | `0 5 1 * *`    | Genera el checklist mensual de cada cliente activo   |
| `/api/cron/actualizar-estados`   | `0 6 * * *`    | Marca solicitudes/tareas/vencimientos vencidos       |
| `/api/cron/recordatorios`        | `0 12 * * *`   | Recordatorios y notificaciones de vencimientos       |

Protegidos por `CRON_SECRET` (Vercel envia `Authorization: Bearer <CRON_SECRET>`).

Renombrado automatico de documentos: `Cliente_TipoDocumento_Mes_Año_Numero.ext`
(ej: `HotelPelt_FacturaCompra_Julio_2026_001.pdf`).

## Deploy en Vercel

1. Sube el repo a GitHub e importalo en Vercel.
2. Crea una base de datos Postgres (Vercel Postgres / Neon) y una store de **Vercel Blob**.
3. Configura las variables de entorno (`.env.example`): `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, y correo (`RESEND_API_KEY` o `SMTP_*`).
4. Ejecuta las migraciones: `npm run db:migrate` (o `db:push`) apuntando a la BD de produccion.
5. (Opcional) `npm run db:seed` para datos demo.
6. Deploy. Los cron jobs de `vercel.json` se activan automaticamente.

## Notas

- El almacenamiento usa Vercel Blob si `BLOB_READ_WRITE_TOKEN` esta definido; en local sin token guarda en `/public/uploads`.
- El correo funciona con Resend o SMTP; sin configuracion, hace log en consola (modo desarrollo).
- Las fechas tributarias **no** estan quemadas en el codigo: se gestionan como vencimientos configurables.
