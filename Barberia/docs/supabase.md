# Supabase — BarberPro Studio

## Orden de ejecución (SQL Editor)
1. `supabase/migrations/001_initial_schema.sql` — tablas, enums, índices, triggers.
2. `supabase/policies.sql` — RLS + funciones helper.
3. `supabase/seed.sql` — datos demo (barbería `00000000-…-0001`).

## Tablas principales (32)
Negocio: `barberias`, `configuracion_barberia`.
Acceso: `roles`, `permisos`, `rol_permisos`, `perfiles_usuario`.
Operación: `clientes`, `barberos`, `categorias_servicios`, `servicios`, `barbero_servicios`,
`horarios_barberos`, `bloqueos_agenda`, `reservas`.
Marketing: `promociones`, `promocion_servicios`, `galeria`, `testimonios`.
Inventario/ventas: `categorias_productos`, `proveedores`, `productos`,
`movimientos_inventario`, `ventas_productos`, `detalle_ventas_productos`.
Finanzas: `categorias_financieras`, `cajas`, `finanzas_movimientos`, `pagos`, `comisiones_barberos`.
Otros: `leads_contacto`, `notificaciones`, `logs_actividad`.

Convenciones: UUID (`gen_random_uuid()`), `timestamptz`, `numeric(12,2)`, `created_at`/`updated_at`
(trigger `set_updated_at`), `deleted_at` (soft delete), `barberia_id` en tablas principales.

## Enums / checks
- `estado_reserva`: pendiente, confirmada, en_proceso, completada, cancelada, no_asistio.
- `tipo_movimiento_financiero`: ingreso, gasto.
- `metodo_pago`: efectivo, nequi, daviplata, transferencia, tarjeta, wompi, mercado_pago, otro.
- `tipo_movimiento_inventario`: entrada, salida, ajuste.

## Triggers / funciones
- `set_updated_at` — mantiene `updated_at`.
- `reservas_calcular_hora_fin` — calcula `hora_fin` desde la duración del servicio.
- `reservas_validar_solapamiento` — evita doble reserva del barbero (usa `tstzrange &&`).
- `reservas_al_completar` — al completar: ingreso + comisión + métricas del cliente.
- `inventario_aplicar_movimiento` — aplica entrada/salida/ajuste al stock.

## RLS (resumen)
- Contenido público (servicios, barberos, galería, promociones, testimonios, configuración,
  horarios) es **legible por anon**.
- El público puede **insertar** reservas (`origen = publico`) y leads.
- El staff accede solo a datos de **su** barbería (`auth_barberia_id()` + `auth_es_staff()`).
- El **barbero** solo ve sus reservas/comisiones; **finanzas** solo admin/recepción.
- Helpers: `auth_barberia_id()`, `auth_rol()`, `auth_barbero_id()`, `auth_es_staff()`.

## Storage — buckets recomendados
`logos`, `galeria`, `servicios`, `barberos`, `promociones` → **públicos**.
`comprobantes` → **privado**. Validar tipo (image/*) y tamaño (p. ej. ≤ 5 MB).

```sql
-- Ejemplo: crear bucket público (o hazlo desde el panel Storage)
insert into storage.buckets (id, name, public) values ('galeria','galeria', true)
on conflict do nothing;
```

## Variables de entorno
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # solo servidor
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_BARBERIA_ID=00000000-0000-0000-0000-000000000001
```
