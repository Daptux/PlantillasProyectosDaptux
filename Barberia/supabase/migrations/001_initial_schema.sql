-- ═══════════════════════════════════════════════════════════════════════════
-- BarberPro Studio — Esquema inicial (PostgreSQL / Supabase)
-- Migracion: 001_initial_schema.sql
--
-- Convenciones:
--   • IDs UUID con gen_random_uuid()
--   • Fechas con timestamptz
--   • Dinero con numeric(12,2)
--   • created_at / updated_at en todas las tablas; deleted_at (soft delete) donde aplica
--   • barberia_id en tablas principales (multi-barberia)
--   • trigger set_updated_at() actualiza updated_at automaticamente
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
do $$ begin
  create type estado_reserva as enum
    ('pendiente','confirmada','en_proceso','completada','cancelada','no_asistio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_movimiento_financiero as enum ('ingreso','gasto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type metodo_pago as enum
    ('efectivo','nequi','daviplata','transferencia','tarjeta','wompi','mercado_pago','otro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_movimiento_inventario as enum ('entrada','salida','ajuste');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_generico as enum ('activo','inactivo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_caja as enum ('abierta','cerrada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type segmento_cliente as enum ('activo','frecuente','inactivo');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────
-- FUNCION: set_updated_at (trigger generico)
-- ─────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. BARBERIAS Y CONFIGURACION
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists barberias (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  slug           text unique not null,
  nit            text,
  estado         estado_generico not null default 'activo',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create table if not exists configuracion_barberia (
  id                      uuid primary key default gen_random_uuid(),
  barberia_id             uuid not null unique references barberias(id) on delete cascade,
  nombre_comercial        text not null,
  eslogan                 text,
  descripcion             text,
  logo_url                text,
  favicon_url             text,
  hero_imagen_url         text,
  color_primario          text default '#c8963e',
  color_secundario        text default '#1a1a1a',
  color_acento            text default '#e0b862',
  tipografia              text,
  direccion               text,
  ciudad                  text,
  telefono                text,
  whatsapp                text,
  correo                  text,
  instagram               text,
  facebook                text,
  tiktok                  text,
  google_maps_url         text,
  google_maps_embed       text,
  -- textos landing
  landing_titulo          text,
  landing_subtitulo       text,
  landing_por_que_texto   text,
  -- politicas de reserva
  reserva_automatica      boolean not null default false,
  anticipacion_minima_min integer not null default 60,
  cancelacion_horas       integer not null default 4,
  mensaje_confirmacion    text default 'Tu reserva ha sido registrada. Te esperamos!',
  mensaje_whatsapp        text default 'Hola! Quiero reservar una cita.',
  -- horarios generales (JSON: { "lunes": {"abre":"09:00","cierra":"19:00","cerrado":false}, ... })
  horarios                jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ROLES, PERMISOS Y PERFILES DE USUARIO
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists roles (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid references barberias(id) on delete cascade,
  clave        text not null,          -- superadmin | admin | barbero | recepcionista | cliente
  nombre       text not null,
  descripcion  text,
  es_sistema   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (barberia_id, clave)
);

create table if not exists permisos (
  id           uuid primary key default gen_random_uuid(),
  clave        text unique not null,   -- ej: 'reservas.crear', 'finanzas.ver'
  modulo       text not null,
  descripcion  text,
  created_at   timestamptz not null default now()
);

create table if not exists rol_permisos (
  id          uuid primary key default gen_random_uuid(),
  rol_id      uuid not null references roles(id) on delete cascade,
  permiso_id  uuid not null references permisos(id) on delete cascade,
  unique (rol_id, permiso_id)
);

create table if not exists perfiles_usuario (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  barberia_id   uuid not null references barberias(id) on delete cascade,
  rol_id        uuid references roles(id) on delete set null,
  nombre        text not null,
  correo        text,
  celular       text,
  avatar_url    text,
  estado        estado_generico not null default 'activo',
  ultimo_acceso timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CLIENTES (CRM)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists clientes (
  id                uuid primary key default gen_random_uuid(),
  barberia_id       uuid not null references barberias(id) on delete cascade,
  auth_user_id      uuid references auth.users(id) on delete set null,
  nombre            text not null,
  celular           text,
  correo            text,
  fecha_nacimiento  date,
  observaciones     text,
  preferencias      text,
  notas_internas    text,
  barbero_favorito  uuid,               -- FK a barberos (se agrega abajo)
  segmento          segmento_cliente not null default 'activo',
  total_gastado     numeric(12,2) not null default 0,
  numero_visitas    integer not null default 0,
  ultima_visita     timestamptz,
  estado            estado_generico not null default 'activo',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. BARBEROS / EMPLEADOS
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists barberos (
  id                    uuid primary key default gen_random_uuid(),
  barberia_id           uuid not null references barberias(id) on delete cascade,
  perfil_usuario_id     uuid references perfiles_usuario(id) on delete set null,
  nombre                text not null,
  foto_url              text,
  celular               text,
  correo                text,
  documento             text,
  especialidad          text,
  descripcion           text,
  experiencia           text,
  instagram             text,
  porcentaje_comision   numeric(5,2) not null default 0,   -- 0..100
  salario_base          numeric(12,2) default 0,
  fecha_ingreso         date,
  valoracion            numeric(3,2) default 5.0,
  destacado             boolean not null default false,
  orden                 integer not null default 0,
  estado                estado_generico not null default 'activo',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

-- FK diferida: cliente.barbero_favorito -> barberos.id
alter table clientes
  drop constraint if exists clientes_barbero_favorito_fkey;
alter table clientes
  add constraint clientes_barbero_favorito_fkey
  foreign key (barbero_favorito) references barberos(id) on delete set null;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. SERVICIOS
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists categorias_servicios (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  nombre       text not null,
  slug         text,
  orden        integer not null default 0,
  estado       estado_generico not null default 'activo',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists servicios (
  id                  uuid primary key default gen_random_uuid(),
  barberia_id         uuid not null references barberias(id) on delete cascade,
  categoria_id        uuid references categorias_servicios(id) on delete set null,
  nombre              text not null,
  descripcion         text,
  precio              numeric(12,2) not null default 0,
  duracion_min        integer not null default 30,
  imagen_url          text,
  comision_sugerida   numeric(5,2) default 0,
  destacado           boolean not null default false,
  orden               integer not null default 0,
  estado              estado_generico not null default 'activo',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

-- Relacion N:N barberos <-> servicios (que servicios puede realizar cada barbero)
create table if not exists barbero_servicios (
  id           uuid primary key default gen_random_uuid(),
  barbero_id   uuid not null references barberos(id) on delete cascade,
  servicio_id  uuid not null references servicios(id) on delete cascade,
  unique (barbero_id, servicio_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. AGENDA: HORARIOS Y BLOQUEOS
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists horarios_barberos (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  barbero_id   uuid not null references barberos(id) on delete cascade,
  dia_semana   smallint not null check (dia_semana between 0 and 6), -- 0=domingo
  hora_inicio  time not null,
  hora_fin     time not null,
  activo       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (hora_fin > hora_inicio)
);

create table if not exists bloqueos_agenda (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  barbero_id   uuid references barberos(id) on delete cascade, -- null = toda la barberia
  motivo       text not null,          -- almuerzo | incapacidad | ausencia | evento | mantenimiento | personalizado
  descripcion  text,
  inicio       timestamptz not null,
  fin          timestamptz not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (fin > inicio)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. RESERVAS
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists reservas (
  id              uuid primary key default gen_random_uuid(),
  barberia_id     uuid not null references barberias(id) on delete cascade,
  cliente_id      uuid references clientes(id) on delete set null,
  barbero_id      uuid references barberos(id) on delete set null,
  servicio_id     uuid references servicios(id) on delete set null,
  -- snapshot de datos del cliente (por si reserva sin cuenta)
  cliente_nombre  text not null,
  cliente_celular text,
  cliente_correo  text,
  fecha           date not null,
  hora_inicio     timestamptz not null,
  hora_fin        timestamptz not null,
  precio          numeric(12,2) not null default 0,
  estado          estado_reserva not null default 'pendiente',
  observaciones   text,
  metodo_pago     metodo_pago,
  comprobante_url text,
  origen          text not null default 'publico',   -- publico | admin
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  check (hora_fin > hora_inicio)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. PROMOCIONES
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists promociones (
  id                 uuid primary key default gen_random_uuid(),
  barberia_id        uuid not null references barberias(id) on delete cascade,
  nombre             text not null,
  descripcion        text,
  imagen_url         text,
  precio_anterior    numeric(12,2),
  precio_promocional numeric(12,2) not null default 0,
  fecha_inicio       date,
  fecha_fin          date,
  mostrar_landing    boolean not null default true,
  estado             estado_generico not null default 'activo',
  orden              integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

create table if not exists promocion_servicios (
  id            uuid primary key default gen_random_uuid(),
  promocion_id  uuid not null references promociones(id) on delete cascade,
  servicio_id   uuid not null references servicios(id) on delete cascade,
  unique (promocion_id, servicio_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. GALERIA Y TESTIMONIOS
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists galeria (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  titulo       text,
  descripcion  text,
  imagen_url   text not null,
  categoria    text,   -- cortes | barbas | antes_despues | promociones | estilo | destacados
  destacada    boolean not null default false,
  visible      boolean not null default true,
  orden        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table if not exists testimonios (
  id             uuid primary key default gen_random_uuid(),
  barberia_id    uuid not null references barberias(id) on delete cascade,
  nombre_cliente text not null,
  foto_url       text,
  comentario     text not null,
  calificacion   smallint not null default 5 check (calificacion between 1 and 5),
  visible        boolean not null default true,
  orden          integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. INVENTARIO
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists categorias_productos (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  nombre       text not null,
  estado       estado_generico not null default 'activo',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists proveedores (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  nombre       text not null,
  contacto     text,
  telefono     text,
  correo       text,
  estado       estado_generico not null default 'activo',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists productos (
  id                uuid primary key default gen_random_uuid(),
  barberia_id       uuid not null references barberias(id) on delete cascade,
  categoria_id      uuid references categorias_productos(id) on delete set null,
  proveedor_id      uuid references proveedores(id) on delete set null,
  nombre            text not null,
  descripcion       text,
  imagen_url        text,
  unidad_medida     text default 'unidad',
  stock_actual      numeric(12,2) not null default 0,
  stock_minimo      numeric(12,2) not null default 0,
  precio_compra     numeric(12,2) not null default 0,
  precio_venta      numeric(12,2) default 0,
  es_vendible       boolean not null default true,
  estado            estado_generico not null default 'activo',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create table if not exists movimientos_inventario (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  producto_id  uuid not null references productos(id) on delete cascade,
  tipo         tipo_movimiento_inventario not null,
  cantidad     numeric(12,2) not null,
  motivo       text,
  referencia   text,          -- ej: id de venta, servicio, ajuste
  usuario_id   uuid references perfiles_usuario(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. VENTAS DE PRODUCTOS
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists ventas_productos (
  id            uuid primary key default gen_random_uuid(),
  barberia_id   uuid not null references barberias(id) on delete cascade,
  cliente_id    uuid references clientes(id) on delete set null,
  vendedor_id   uuid references perfiles_usuario(id) on delete set null,
  total         numeric(12,2) not null default 0,
  metodo_pago   metodo_pago not null default 'efectivo',
  observaciones text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists detalle_ventas_productos (
  id                uuid primary key default gen_random_uuid(),
  venta_id          uuid not null references ventas_productos(id) on delete cascade,
  producto_id       uuid references productos(id) on delete set null,
  producto_nombre   text not null,
  cantidad          numeric(12,2) not null default 1,
  precio_unitario   numeric(12,2) not null default 0,
  subtotal          numeric(12,2) not null default 0
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. FINANZAS Y CAJA
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists categorias_financieras (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  nombre       text not null,
  tipo         tipo_movimiento_financiero not null default 'gasto',
  es_sistema   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists cajas (
  id                uuid primary key default gen_random_uuid(),
  barberia_id       uuid not null references barberias(id) on delete cascade,
  usuario_apertura  uuid references perfiles_usuario(id) on delete set null,
  usuario_cierre    uuid references perfiles_usuario(id) on delete set null,
  monto_inicial     numeric(12,2) not null default 0,
  monto_final       numeric(12,2),
  total_ingresos    numeric(12,2) not null default 0,
  total_gastos      numeric(12,2) not null default 0,
  estado            estado_caja not null default 'abierta',
  abierta_at        timestamptz not null default now(),
  cerrada_at        timestamptz,
  observaciones     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists finanzas_movimientos (
  id             uuid primary key default gen_random_uuid(),
  barberia_id    uuid not null references barberias(id) on delete cascade,
  caja_id        uuid references cajas(id) on delete set null,
  categoria_id   uuid references categorias_financieras(id) on delete set null,
  tipo           tipo_movimiento_financiero not null,
  concepto       text not null,
  monto          numeric(12,2) not null default 0,
  metodo_pago    metodo_pago not null default 'efectivo',
  barbero_id     uuid references barberos(id) on delete set null,
  reserva_id     uuid references reservas(id) on delete set null,
  venta_id       uuid references ventas_productos(id) on delete set null,
  usuario_id     uuid references perfiles_usuario(id) on delete set null,
  fecha          date not null default current_date,
  comprobante_url text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

-- Pagos a barberos (nomina / comisiones liquidadas)
create table if not exists pagos (
  id            uuid primary key default gen_random_uuid(),
  barberia_id   uuid not null references barberias(id) on delete cascade,
  barbero_id    uuid not null references barberos(id) on delete cascade,
  concepto      text not null,          -- comision | salario | bono | otro
  monto         numeric(12,2) not null default 0,
  metodo_pago   metodo_pago not null default 'efectivo',
  periodo_desde date,
  periodo_hasta date,
  usuario_id    uuid references perfiles_usuario(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Comisiones generadas por reservas completadas
create table if not exists comisiones_barberos (
  id            uuid primary key default gen_random_uuid(),
  barberia_id   uuid not null references barberias(id) on delete cascade,
  barbero_id    uuid not null references barberos(id) on delete cascade,
  reserva_id    uuid references reservas(id) on delete set null,
  base          numeric(12,2) not null default 0,   -- precio del servicio
  porcentaje    numeric(5,2) not null default 0,
  monto         numeric(12,2) not null default 0,
  pagado        boolean not null default false,
  pago_id       uuid references pagos(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 13. LEADS, NOTIFICACIONES Y LOGS
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists leads_contacto (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  nombre       text not null,
  celular      text,
  correo       text,
  mensaje      text,
  origen       text default 'contacto',
  atendido     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists notificaciones (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid not null references barberias(id) on delete cascade,
  usuario_id   uuid references perfiles_usuario(id) on delete cascade,
  tipo         text not null default 'info',   -- info | reserva | inventario | financiero
  titulo       text not null,
  mensaje      text,
  url          text,
  leida        boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists logs_actividad (
  id           uuid primary key default gen_random_uuid(),
  barberia_id  uuid references barberias(id) on delete cascade,
  usuario_id   uuid references perfiles_usuario(id) on delete set null,
  accion       text not null,          -- crear | editar | eliminar | login | ...
  entidad      text not null,          -- reservas | clientes | ...
  entidad_id   uuid,
  detalle      jsonb,
  ip           text,
  created_at   timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDICES
-- ═══════════════════════════════════════════════════════════════════════════
create index if not exists idx_perfiles_barberia   on perfiles_usuario(barberia_id);
create index if not exists idx_perfiles_auth        on perfiles_usuario(auth_user_id);
create index if not exists idx_clientes_barberia    on clientes(barberia_id);
create index if not exists idx_clientes_celular      on clientes(celular);
create index if not exists idx_barberos_barberia    on barberos(barberia_id);
create index if not exists idx_servicios_barberia   on servicios(barberia_id);
create index if not exists idx_servicios_categoria  on servicios(categoria_id);
create index if not exists idx_reservas_barberia    on reservas(barberia_id);
create index if not exists idx_reservas_barbero     on reservas(barbero_id);
create index if not exists idx_reservas_cliente     on reservas(cliente_id);
create index if not exists idx_reservas_fecha       on reservas(fecha);
create index if not exists idx_reservas_estado      on reservas(estado);
create index if not exists idx_reservas_barbero_inicio on reservas(barbero_id, hora_inicio);
create index if not exists idx_horarios_barbero     on horarios_barberos(barbero_id, dia_semana);
create index if not exists idx_bloqueos_barbero     on bloqueos_agenda(barbero_id, inicio);
create index if not exists idx_productos_barberia   on productos(barberia_id);
create index if not exists idx_movinv_producto      on movimientos_inventario(producto_id);
create index if not exists idx_finanzas_barberia    on finanzas_movimientos(barberia_id, fecha);
create index if not exists idx_finanzas_tipo        on finanzas_movimientos(tipo);
create index if not exists idx_comisiones_barbero   on comisiones_barberos(barbero_id);
create index if not exists idx_promos_barberia      on promociones(barberia_id);
create index if not exists idx_galeria_barberia     on galeria(barberia_id);
create index if not exists idx_logs_barberia        on logs_actividad(barberia_id, created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS: updated_at automatico
-- ═══════════════════════════════════════════════════════════════════════════
do $$
declare
  t text;
  tablas text[] := array[
    'barberias','configuracion_barberia','roles','perfiles_usuario','clientes',
    'barberos','categorias_servicios','servicios','horarios_barberos','bloqueos_agenda',
    'reservas','promociones','galeria','testimonios','categorias_productos','proveedores',
    'productos','ventas_productos','categorias_financieras','cajas','finanzas_movimientos',
    'pagos','comisiones_barberos','leads_contacto'
  ];
begin
  foreach t in array tablas loop
    execute format('drop trigger if exists trg_set_updated_at on %I;', t);
    execute format(
      'create trigger trg_set_updated_at before update on %I
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCION: calcular hora_fin segun duracion del servicio
-- Si hora_fin no viene, se calcula desde hora_inicio + duracion del servicio.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function reservas_calcular_hora_fin()
returns trigger as $$
declare
  dur integer;
begin
  if new.hora_fin is null and new.servicio_id is not null then
    select duracion_min into dur from servicios where id = new.servicio_id;
    if dur is not null then
      new.hora_fin := new.hora_inicio + make_interval(mins => dur);
    end if;
  end if;
  if new.fecha is null then
    new.fecha := (new.hora_inicio at time zone 'UTC')::date;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reservas_hora_fin on reservas;
create trigger trg_reservas_hora_fin
  before insert or update on reservas
  for each row execute function reservas_calcular_hora_fin();

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCION: evitar doble reserva del mismo barbero en horario solapado
-- Estados que ocupan agenda: pendiente, confirmada, en_proceso.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function reservas_validar_solapamiento()
returns trigger as $$
begin
  if new.barbero_id is null then
    return new;
  end if;
  if new.estado in ('cancelada','no_asistio','completada') then
    return new;
  end if;

  if exists (
    select 1 from reservas r
    where r.barbero_id = new.barbero_id
      and r.id <> new.id
      and r.deleted_at is null
      and r.estado in ('pendiente','confirmada','en_proceso')
      and tstzrange(r.hora_inicio, r.hora_fin) && tstzrange(new.hora_inicio, new.hora_fin)
  ) then
    raise exception 'El barbero ya tiene una reserva en ese horario (%, %)',
      new.hora_inicio, new.hora_fin
      using errcode = 'exclusion_violation';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reservas_solapamiento on reservas;
create trigger trg_reservas_solapamiento
  before insert or update on reservas
  for each row execute function reservas_validar_solapamiento();

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCION: al marcar reserva como 'completada' -> registrar ingreso + comision
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function reservas_al_completar()
returns trigger as $$
declare
  v_porcentaje numeric(5,2);
  v_monto_comision numeric(12,2);
  v_caja uuid;
begin
  if new.estado = 'completada' and coalesce(old.estado,'') <> 'completada' then
    -- caja abierta actual (si existe)
    select id into v_caja from cajas
      where barberia_id = new.barberia_id and estado = 'abierta'
      order by abierta_at desc limit 1;

    -- ingreso financiero (si no existe ya uno vinculado a esta reserva)
    if not exists (select 1 from finanzas_movimientos where reserva_id = new.id and tipo = 'ingreso') then
      insert into finanzas_movimientos
        (barberia_id, caja_id, tipo, concepto, monto, metodo_pago, barbero_id, reserva_id, fecha)
      values
        (new.barberia_id, v_caja, 'ingreso',
         'Servicio: ' || coalesce(new.cliente_nombre,'cliente'),
         coalesce(new.precio,0), coalesce(new.metodo_pago,'efectivo'),
         new.barbero_id, new.id, coalesce(new.fecha, current_date));
    end if;

    -- comision del barbero
    if new.barbero_id is not null then
      select porcentaje_comision into v_porcentaje from barberos where id = new.barbero_id;
      v_porcentaje := coalesce(v_porcentaje, 0);
      v_monto_comision := round(coalesce(new.precio,0) * v_porcentaje / 100.0, 2);
      if v_monto_comision > 0 and not exists (
        select 1 from comisiones_barberos where reserva_id = new.id
      ) then
        insert into comisiones_barberos
          (barberia_id, barbero_id, reserva_id, base, porcentaje, monto)
        values
          (new.barberia_id, new.barbero_id, new.id,
           coalesce(new.precio,0), v_porcentaje, v_monto_comision);
      end if;
    end if;

    -- actualizar metricas del cliente
    if new.cliente_id is not null then
      update clientes
        set numero_visitas = numero_visitas + 1,
            total_gastado  = total_gastado + coalesce(new.precio,0),
            ultima_visita  = now()
      where id = new.cliente_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reservas_completar on reservas;
create trigger trg_reservas_completar
  after update on reservas
  for each row execute function reservas_al_completar();

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCION: aplicar movimiento de inventario al stock
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function inventario_aplicar_movimiento()
returns trigger as $$
begin
  if new.tipo = 'entrada' then
    update productos set stock_actual = stock_actual + new.cantidad where id = new.producto_id;
  elsif new.tipo = 'salida' then
    update productos set stock_actual = stock_actual - new.cantidad where id = new.producto_id;
  elsif new.tipo = 'ajuste' then
    update productos set stock_actual = new.cantidad where id = new.producto_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_inventario_movimiento on movimientos_inventario;
create trigger trg_inventario_movimiento
  after insert on movimientos_inventario
  for each row execute function inventario_aplicar_movimiento();

-- Fin de la migracion 001
