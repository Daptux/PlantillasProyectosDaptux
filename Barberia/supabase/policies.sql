-- ═══════════════════════════════════════════════════════════════════════════
-- BarberPro Studio — Row Level Security (RLS)
--
-- Estrategia:
--   • El contenido PUBLICO de la landing (servicios, barberos, galeria,
--     promociones, testimonios, configuracion) es legible por todos (rol anon).
--   • Los datos operativos/privados solo son accesibles por usuarios de la
--     MISMA barberia. Se determina con helpers que leen perfiles_usuario.
--   • El barbero solo ve sus propias reservas/agenda/comisiones.
--   • Las operaciones administrativas sensibles se hacen desde Route Handlers
--     con la SERVICE ROLE KEY (que bypassa RLS).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Helpers de contexto ─────────────────────────────────────────────────────

-- barberia_id del usuario autenticado
create or replace function auth_barberia_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select barberia_id from perfiles_usuario
  where auth_user_id = auth.uid() and deleted_at is null
  limit 1;
$$;

-- clave del rol del usuario autenticado (superadmin, admin, barbero, ...)
create or replace function auth_rol()
returns text
language sql stable security definer set search_path = public as $$
  select r.clave
  from perfiles_usuario p
  join roles r on r.id = p.rol_id
  where p.auth_user_id = auth.uid() and p.deleted_at is null
  limit 1;
$$;

-- barbero_id vinculado al usuario autenticado (si es barbero)
create or replace function auth_barbero_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select b.id
  from barberos b
  join perfiles_usuario p on p.id = b.perfil_usuario_id
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

-- true si el usuario es staff (puede operar la barberia)
create or replace function auth_es_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_rol() in ('superadmin','admin','recepcionista','barbero'), false);
$$;

-- ── Activar RLS ─────────────────────────────────────────────────────────────
do $$
declare t text;
  tablas text[] := array[
    'barberias','configuracion_barberia','roles','permisos','rol_permisos',
    'perfiles_usuario','clientes','barberos','categorias_servicios','servicios',
    'barbero_servicios','horarios_barberos','bloqueos_agenda','reservas',
    'promociones','promocion_servicios','galeria','testimonios',
    'categorias_productos','proveedores','productos','movimientos_inventario',
    'ventas_productos','detalle_ventas_productos','categorias_financieras',
    'cajas','finanzas_movimientos','pagos','comisiones_barberos',
    'leads_contacto','notificaciones','logs_actividad'
  ];
begin
  foreach t in array tablas loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- ── Contenido PUBLICO (lectura anonima) ─────────────────────────────────────
-- Landing: cualquiera puede leer lo visible/activo.

drop policy if exists pub_config on configuracion_barberia;
create policy pub_config on configuracion_barberia
  for select using (true);

drop policy if exists pub_barberias on barberias;
create policy pub_barberias on barberias
  for select using (estado = 'activo');

drop policy if exists pub_servicios on servicios;
create policy pub_servicios on servicios
  for select using (estado = 'activo' and deleted_at is null);

drop policy if exists pub_categorias_serv on categorias_servicios;
create policy pub_categorias_serv on categorias_servicios
  for select using (estado = 'activo');

drop policy if exists pub_barberos on barberos;
create policy pub_barberos on barberos
  for select using (estado = 'activo' and deleted_at is null);

drop policy if exists pub_barbero_serv on barbero_servicios;
create policy pub_barbero_serv on barbero_servicios
  for select using (true);

drop policy if exists pub_promos on promociones;
create policy pub_promos on promociones
  for select using (estado = 'activo' and deleted_at is null);

drop policy if exists pub_promo_serv on promocion_servicios;
create policy pub_promo_serv on promocion_servicios
  for select using (true);

drop policy if exists pub_galeria on galeria;
create policy pub_galeria on galeria
  for select using (visible = true and deleted_at is null);

drop policy if exists pub_testimonios on testimonios;
create policy pub_testimonios on testimonios
  for select using (visible = true and deleted_at is null);

drop policy if exists pub_horarios on horarios_barberos;
create policy pub_horarios on horarios_barberos
  for select using (true);

-- Reservas: el publico puede CREAR (reserva desde la web) pero no leer todo.
drop policy if exists pub_reservas_insert on reservas;
create policy pub_reservas_insert on reservas
  for insert with check (origen = 'publico');

-- Leads: el publico puede crear (formulario de contacto).
drop policy if exists pub_leads_insert on leads_contacto;
create policy pub_leads_insert on leads_contacto
  for insert with check (true);

-- ── STAFF: acceso a datos de SU barberia ────────────────────────────────────
-- Patron reutilizable: mismas barberia_id + es staff. El barbero se restringe
-- adicionalmente en reservas/comisiones a lo suyo.

-- perfiles_usuario: cada quien ve su propio perfil; staff ve los de su barberia
drop policy if exists staff_perfiles on perfiles_usuario;
create policy staff_perfiles on perfiles_usuario
  for select using (
    auth_user_id = auth.uid()
    or (barberia_id = auth_barberia_id() and auth_rol() in ('superadmin','admin'))
  );

-- Macro-generacion de politicas "staff full access" (ALL) por barberia.
do $$
declare t text;
  tablas text[] := array[
    'clientes','servicios','categorias_servicios','barberos','barbero_servicios',
    'horarios_barberos','bloqueos_agenda','promociones','promocion_servicios',
    'galeria','testimonios','categorias_productos','proveedores','productos',
    'movimientos_inventario','ventas_productos','categorias_financieras',
    'cajas','leads_contacto','notificaciones','logs_actividad',
    'configuracion_barberia','roles'
  ];
begin
  foreach t in array tablas loop
    execute format('drop policy if exists staff_all on %I;', t);
    execute format(
      'create policy staff_all on %I
         for all
         using (barberia_id = auth_barberia_id() and auth_es_staff())
         with check (barberia_id = auth_barberia_id() and auth_es_staff());', t);
  end loop;
end $$;

-- detalle_ventas_productos: sin barberia_id directo -> via venta
drop policy if exists staff_detalle_ventas on detalle_ventas_productos;
create policy staff_detalle_ventas on detalle_ventas_productos
  for all
  using (exists (
    select 1 from ventas_productos v
    where v.id = venta_id and v.barberia_id = auth_barberia_id() and auth_es_staff()
  ))
  with check (exists (
    select 1 from ventas_productos v
    where v.id = venta_id and v.barberia_id = auth_barberia_id() and auth_es_staff()
  ));

-- ── RESERVAS ────────────────────────────────────────────────────────────────
-- Admin/recepcion: todas las de su barberia. Barbero: solo las suyas.
drop policy if exists staff_reservas_select on reservas;
create policy staff_reservas_select on reservas
  for select using (
    barberia_id = auth_barberia_id()
    and (
      auth_rol() in ('superadmin','admin','recepcionista')
      or barbero_id = auth_barbero_id()
    )
  );

drop policy if exists staff_reservas_write on reservas;
create policy staff_reservas_write on reservas
  for update using (
    barberia_id = auth_barberia_id()
    and (
      auth_rol() in ('superadmin','admin','recepcionista')
      or barbero_id = auth_barbero_id()
    )
  )
  with check (barberia_id = auth_barberia_id());

drop policy if exists staff_reservas_insert on reservas;
create policy staff_reservas_insert on reservas
  for insert with check (
    barberia_id = auth_barberia_id() and auth_es_staff()
  );

drop policy if exists staff_reservas_delete on reservas;
create policy staff_reservas_delete on reservas
  for delete using (
    barberia_id = auth_barberia_id()
    and auth_rol() in ('superadmin','admin')
  );

-- ── FINANZAS ────────────────────────────────────────────────────────────────
-- Solo superadmin/admin/recepcion (recepcion caja basica). Barbero NO ve finanzas globales.
drop policy if exists staff_finanzas on finanzas_movimientos;
create policy staff_finanzas on finanzas_movimientos
  for all
  using (
    barberia_id = auth_barberia_id()
    and auth_rol() in ('superadmin','admin','recepcionista')
  )
  with check (
    barberia_id = auth_barberia_id()
    and auth_rol() in ('superadmin','admin','recepcionista')
  );

-- Pagos y comisiones: admin ve todo; barbero solo lo suyo (lectura).
drop policy if exists staff_pagos on pagos;
create policy staff_pagos on pagos
  for all
  using (
    barberia_id = auth_barberia_id()
    and (auth_rol() in ('superadmin','admin') or barbero_id = auth_barbero_id())
  )
  with check (barberia_id = auth_barberia_id() and auth_rol() in ('superadmin','admin'));

drop policy if exists staff_comisiones on comisiones_barberos;
create policy staff_comisiones on comisiones_barberos
  for select using (
    barberia_id = auth_barberia_id()
    and (auth_rol() in ('superadmin','admin') or barbero_id = auth_barbero_id())
  );

drop policy if exists admin_comisiones_write on comisiones_barberos;
create policy admin_comisiones_write on comisiones_barberos
  for all
  using (barberia_id = auth_barberia_id() and auth_rol() in ('superadmin','admin'))
  with check (barberia_id = auth_barberia_id() and auth_rol() in ('superadmin','admin'));

-- ── CLIENTES CON CUENTA ─────────────────────────────────────────────────────
-- Si se habilita login de clientes: cada cliente ve sus propias reservas.
drop policy if exists cliente_sus_reservas on reservas;
create policy cliente_sus_reservas on reservas
  for select using (
    cliente_id in (select id from clientes where auth_user_id = auth.uid())
  );

-- Nota: las tablas 'permisos' y 'rol_permisos' se administran via service role.
drop policy if exists lectura_permisos on permisos;
create policy lectura_permisos on permisos for select using (auth_es_staff());

drop policy if exists lectura_rol_permisos on rol_permisos;
create policy lectura_rol_permisos on rol_permisos for select using (auth_es_staff());

-- Fin de policies.sql
