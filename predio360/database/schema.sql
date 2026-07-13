-- ============================================================================
-- PREDIO360 · Esquema de base de datos (PostgreSQL / Supabase)
-- Ejecuta este script en Supabase > SQL Editor.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type riesgo_nivel as enum ('bajo','medio','alto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type predio_estado as enum ('Activo','En estudio','Archivado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hallazgo_tipo as enum ('Jurídico','Catastral','Urbanístico','Ambiental','Social');
exception when duplicate_object then null; end $$;

do $$ begin
  create type actuacion_tipo as enum ('Visita','Concepto','Oficio','Resolución','Licencia','Seguimiento');
exception when duplicate_object then null; end $$;

-- ---------- Trigger updated_at ----------
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ============================================================================
-- PREDIOS  (expediente digital)
-- ============================================================================
create table if not exists predios (
  id                  text primary key default ('PR-' || lpad((floor(random()*99999))::text, 5, '0')),
  nombre              text not null,
  matricula           text not null unique,
  cedula_catastral    text,
  chip                text,
  direccion           text not null,
  municipio           text,
  barrio              text,
  tipo                text default 'Urbano',           -- Urbano / Rural
  estrato             int,
  propietario         text,
  naturaleza          text,                            -- Propiedad privada / horizontal / Bien fiscal
  escritura           text,

  -- Estado y avance
  estado              predio_estado default 'En estudio',
  riesgo              riesgo_nivel  default 'bajo',
  estado_juridico     text default 'Sano',             -- Sano / Con observaciones / En litigio
  avance              int  default 0 check (avance between 0 and 100),

  -- Catastral / áreas
  area_terreno_jur    numeric(14,2),
  area_terreno_cat    numeric(14,2),
  area_construida_jur numeric(14,2),
  area_construida_cat numeric(14,2),
  avaluo_catastral    bigint,
  avaluo_comercial    bigint,
  destino             text,

  -- Urbanístico
  uso                 text,
  tratamiento         text,
  pisos               int default 0,
  frente              numeric(8,2),
  fondo               numeric(8,2),

  -- Jurídico (contadores rápidos)
  gravamenes          int default 0,
  servidumbres        int default 0,
  limitaciones        int default 0,

  -- Geo
  lat                 double precision,
  lng                 double precision,
  foto                text default 'poblado',

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists idx_predios_municipio on predios(municipio);
create index if not exists idx_predios_riesgo on predios(riesgo);
create index if not exists idx_predios_estado on predios(estado);
drop trigger if exists trg_predios_updated on predios;
create trigger trg_predios_updated before update on predios for each row execute function set_updated_at();

-- ============================================================================
-- TRADICIÓN  (cadena de titularidad)
-- ============================================================================
create table if not exists tradicion (
  id          uuid primary key default gen_random_uuid(),
  predio_id   text references predios(id) on delete cascade,
  anio        int,
  acto        text,
  transfiere  text,
  adquiere    text,
  instrumento text,
  valor       bigint,
  created_at  timestamptz default now()
);
create index if not exists idx_tradicion_predio on tradicion(predio_id);

-- ============================================================================
-- HALLAZGOS
-- ============================================================================
create table if not exists hallazgos (
  id          text primary key default ('H-' || lpad((floor(random()*99999))::text, 4, '0')),
  predio_id   text references predios(id) on delete cascade,
  tipo        hallazgo_tipo not null,
  severidad   riesgo_nivel  not null default 'medio',
  titulo      text not null,
  descripcion text,
  estado      text default 'Abierto',                  -- Abierto / En gestión / Cerrado
  responsable text,
  fecha       date default current_date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_hallazgos_predio on hallazgos(predio_id);
create index if not exists idx_hallazgos_estado on hallazgos(estado);
drop trigger if exists trg_hallazgos_updated on hallazgos;
create trigger trg_hallazgos_updated before update on hallazgos for each row execute function set_updated_at();

-- ============================================================================
-- ACTUACIONES
-- ============================================================================
create table if not exists actuaciones (
  id          text primary key default ('AC-' || lpad((floor(random()*99999))::text, 4, '0')),
  predio_id   text references predios(id) on delete cascade,
  tipo        actuacion_tipo not null,
  titulo      text not null,
  descripcion text,
  estado      text default 'Programada',               -- Programada / En trámite / Finalizada
  responsable text,
  fecha       date default current_date,
  created_at  timestamptz default now()
);
create index if not exists idx_actuaciones_predio on actuaciones(predio_id);

-- ============================================================================
-- DOCUMENTOS  (metadatos; los archivos van a Supabase Storage)
-- ============================================================================
create table if not exists documentos (
  id          uuid primary key default gen_random_uuid(),
  predio_id   text references predios(id) on delete cascade,
  nombre      text not null,
  tipo        text,                                     -- pdf / doc / xls / dwg / shp / img
  categoria   text,                                     -- Jurídico / Catastral / ...
  origen      text,                                     -- ORIP / IGAC / Notaría / ...
  peso        text,
  storage_path text,                                    -- ruta en Storage
  fecha       date default current_date,
  created_at  timestamptz default now()
);
create index if not exists idx_documentos_predio on documentos(predio_id);

-- ============================================================================
-- Vista de dashboard (indicadores)
-- ============================================================================
create or replace view v_dashboard as
select
  (select count(*) from predios)                                as total_predios,
  (select count(*) from predios where avance >= 100)            as expedientes_completos,
  (select count(*) from hallazgos where estado = 'Abierto')     as hallazgos_abiertos,
  (select coalesce(sum(avaluo_comercial),0) from predios)       as avaluo_total;
