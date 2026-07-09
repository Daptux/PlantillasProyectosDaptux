# BarberPro Studio 💈

Plantilla profesional **full-stack** para barberías: sitio público con reservas online + panel administrativo completo (reservas, agenda, CRM, finanzas, caja, inventario, ventas, promociones, galería, reportes y configuración de marca).

Pensada como **plantilla reutilizable**: cada barbería personaliza logo, colores, textos, servicios, barberos, horarios y promociones desde el panel, sin tocar código.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (componentes propios en `components/ui`)
- **Supabase**: PostgreSQL + Auth + Storage + Row Level Security
- **React Hook Form** + **Zod** (validaciones)
- **Recharts** (gráficas) · **Lucide React** (íconos) · **Sonner** (toasts)
- Backend 100% en **Next.js API Route Handlers** (`app/api`) — sin servidor Express aparte
- Deploy en **Vercel**

## Arranque rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env.local   # y completar con tus llaves de Supabase

# 3. Base de datos (en el SQL Editor de Supabase, en orden):
#    - supabase/migrations/001_initial_schema.sql
#    - supabase/policies.sql
#    - supabase/seed.sql

# 4. Crear los buckets de Storage (ver docs/supabase.md)

# 5. Levantar en local
npm run dev
```

Abre http://localhost:3000 (sitio público) y http://localhost:3000/admin (panel, requiere login).

### Crear el primer usuario administrador

1. En Supabase → **Authentication → Users → Add user** (email + password).
2. En el **SQL Editor**, vincula su perfil (usa el `id` del usuario auth y el rol superadmin del seed):

```sql
insert into perfiles_usuario (auth_user_id, barberia_id, rol_id, nombre, correo)
values ('<auth-user-id>', '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001', 'Dueño', 'dueno@barberpro.studio');
```

3. Inicia sesión en `/login`.

## Estructura

```
app/
  (public)/        → landing, servicios, barberos, reservar, promociones, galería, contacto
  admin/           → panel (dashboard + 15 módulos) con layout protegido
  api/             → Route Handlers (auth, reservas, finanzas, inventario, ...)
  login/           → autenticación
components/        → ui / common / public / admin / forms
lib/               → supabase (client/server/admin), validaciones, permisos, utils, crud factory
supabase/          → migrations, policies.sql, seed.sql
docs/              → documentación técnica
types/             → tipos de la base de datos
```

## Documentación

- [Requerimientos](docs/requerimientos.md) — módulos, roles y funcionamiento
- [Arquitectura](docs/arquitectura.md) — por qué Next.js + Supabase
- [Endpoints](docs/endpoints.md) — API completa con permisos
- [Flujo de reservas](docs/flujo-reservas.md) — paso a paso y validaciones
- [Supabase](docs/supabase.md) — tablas, RLS, Storage, seed
- [Despliegue en Vercel](docs/despliegue-vercel.md) — checklist de producción

## Personalización (multi-barbería)

Todo el contenido de marca vive en la tabla `configuracion_barberia` y se edita desde
**Admin → Configuración**. Los colores se inyectan en runtime como variables CSS
(`components/common/BrandStyle.tsx`). Para una nueva barbería basta con crear otra fila en
`barberias` + `configuracion_barberia` y apuntar `NEXT_PUBLIC_BARBERIA_ID`.

---

Hecho con 💈 por Daptux · Plantilla BarberPro Studio
