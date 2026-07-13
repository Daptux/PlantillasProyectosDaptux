# Base de datos · Predio360 (Supabase / PostgreSQL)

Scripts SQL para provisionar la base de datos en Supabase.

## Orden de ejecución

Ejecuta en **Supabase → SQL Editor**, en este orden:

1. **`schema.sql`** — Crea enums, tablas (`predios`, `tradicion`, `hallazgos`, `actuaciones`, `documentos`), índices, triggers de `updated_at` y la vista `v_dashboard`.
2. **`policies.sql`** — Habilita Row Level Security (RLS) y políticas de acceso.
3. **`seed.sql`** — *(Opcional)* Inserta datos de ejemplo espejando el frontend.

## Modelo de datos

```
predios ──┬── tradicion      (cadena de titularidad)
          ├── hallazgos       (jurídico, catastral, urbanístico, ambiental, social)
          ├── actuaciones     (visita, concepto, oficio, resolución, licencia, seguimiento)
          └── documentos       (metadatos; los archivos van a Supabase Storage)
```

## Storage

Crea un bucket llamado `documentos` en **Supabase → Storage** para almacenar los archivos
(PDF, DWG, SHP, imágenes). La tabla `documentos.storage_path` guarda la ruta del objeto.

## Seguridad

- El **backend** usa la `service_role key` (omite RLS) — nunca la expongas en el frontend.
- El **frontend** (si accede directo) usa la `anon key` sujeta a las políticas de `policies.sql`.
- Para SaaS multiempresa, añade una columna `org_id` a cada tabla y ajusta las políticas RLS
  para filtrar por `auth.jwt() ->> 'org_id'`.
