# Arquitectura — BarberPro Studio

## Visión general

```
┌─────────────────────────────────────────────┐
│                  Vercel                       │
│  ┌────────────────┐   ┌────────────────────┐  │
│  │  Next.js App    │   │  Route Handlers     │  │
│  │  (App Router)   │   │  app/api/*          │  │
│  │  - Server Comp. │──▶│  - Zod validation   │  │
│  │  - Client Comp. │   │  - permisos/auth    │  │
│  └────────────────┘   └─────────┬──────────┘  │
└──────────────────────────────────┼────────────┘
                                    │
                   ┌────────────────▼────────────────┐
                   │            Supabase               │
                   │  PostgreSQL · Auth · Storage · RLS │
                   └───────────────────────────────────┘
```

## Por qué Next.js en Vercel + Supabase PostgreSQL

- **Un solo despliegue**: frontend y backend viven en el mismo proyecto Next.js. Los
  Route Handlers (`app/api`) reemplazan a un servidor Express independiente; se ejecutan
  como funciones serverless en Vercel, escalan solas y no requieren mantenimiento de infra.
- **Supabase** aporta Postgres administrado, autenticación, almacenamiento de archivos y
  Row Level Security en un solo servicio, con SDK oficial y soporte SSR (`@supabase/ssr`).
- **PostgreSQL** (no MySQL) por: tipos ricos (`jsonb`, `numeric`, enums), `tstzrange` para
  validar solapamiento de reservas, triggers/funciones para lógica de negocio en la BD, y RLS.

## Clientes de Supabase (`lib/supabase/`)

| Archivo | Uso | Llave |
|---------|-----|-------|
| `client.ts` | Componentes cliente (`"use client"`) | anon (pública) |
| `server.ts` | Server Components y Route Handlers (respeta RLS con la sesión) | anon + cookies |
| `admin.ts` | Operaciones privilegiadas del backend (crear usuarios, reservas públicas) | **service role** (solo servidor) |

> ⚠️ La `SUPABASE_SERVICE_ROLE_KEY` **jamás** se expone al cliente. Solo se importa en
> Route Handlers/Server Actions.

## Capas

- **Presentación**: `app/(public)` (dark, orientado a marca) y `app/admin` (claro, operativo).
- **Componentes**: `ui` (primitivos shadcn), `common`, `public`, `admin`, `forms`.
- **Dominio/negocio**: `lib/` — `validations` (Zod), `permissions`, `disponibilidad`
  (motor de agenda), `crud` (factory de handlers), `queries` (lecturas públicas).
- **Datos**: `supabase/` — migración, políticas RLS y seed.

## Seguridad en profundidad
1. **Middleware** refresca sesión y bloquea `/admin` sin login.
2. **Layout `/admin`** valida rol con acceso.
3. **Route Handlers** validan permiso (`requirePermiso`) y datos (Zod).
4. **RLS** en Postgres impide fugas entre barberías incluso si algo se salta arriba.
