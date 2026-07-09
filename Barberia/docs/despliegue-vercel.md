# Despliegue en Vercel — BarberPro Studio

## 1. Crear proyecto en Supabase
- Nuevo proyecto → guarda la **Project URL**, **anon key** y **service_role key** (Settings → API).

## 2. Base de datos
En el **SQL Editor**, ejecuta en orden:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/policies.sql`
3. `supabase/seed.sql`

## 3. Storage
Crea los buckets: `logos`, `galeria`, `servicios`, `barberos`, `promociones` (públicos)
y `comprobantes` (privado). Ver `docs/supabase.md`.

## 4. Usuario administrador
- Authentication → Users → **Add user** (email + password).
- Vincula el perfil con el rol superadmin del seed (SQL en el README).

## 5. Repositorio y Vercel
- Sube el proyecto a GitHub.
- En Vercel → **New Project** → importa el repo.
- **Environment Variables**:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SITE_URL          # https://tu-dominio.vercel.app
  NEXT_PUBLIC_BARBERIA_ID       # 00000000-0000-0000-0000-000000000001
  ```
- **Deploy**.

## 6. Configurar redirect de Auth
En Supabase → Authentication → URL Configuration → añade tu dominio de Vercel a
**Site URL** y **Redirect URLs**.

## 7. Pruebas de humo
- [ ] Landing pública carga con datos del seed.
- [ ] `/login` permite iniciar sesión con el usuario creado.
- [ ] `/admin/dashboard` muestra métricas.
- [ ] Crear una reserva desde `/reservar` (verifica disponibilidad).
- [ ] Cambiar una reserva a "completada" genera ingreso en Finanzas.
- [ ] CRUD de servicios/barberos/clientes funciona.

## Notas
- Los Route Handlers corren como funciones serverless: sin configuración extra.
- Para una **nueva barbería**: inserta filas en `barberias` + `configuracion_barberia`,
  crea sus usuarios y despliega otra instancia cambiando `NEXT_PUBLIC_BARBERIA_ID`.
