-- ============================================================================
-- PREDIO360 · Row Level Security (RLS) para Supabase
-- Ejecuta DESPUÉS de schema.sql.
--
-- Estrategia base:
--   * Lectura/escritura para usuarios autenticados (rol 'authenticated').
--   * El backend usa la Service Role Key, que omite RLS.
-- Ajusta según tu modelo multiempresa (columna tenant_id / org_id).
-- ============================================================================

alter table predios     enable row level security;
alter table tradicion   enable row level security;
alter table hallazgos   enable row level security;
alter table actuaciones enable row level security;
alter table documentos  enable row level security;

-- ---------- PREDIOS ----------
drop policy if exists "predios_read" on predios;
create policy "predios_read" on predios
  for select to authenticated using (true);

drop policy if exists "predios_write" on predios;
create policy "predios_write" on predios
  for all to authenticated using (true) with check (true);

-- ---------- TRADICIÓN ----------
drop policy if exists "tradicion_all" on tradicion;
create policy "tradicion_all" on tradicion
  for all to authenticated using (true) with check (true);

-- ---------- HALLAZGOS ----------
drop policy if exists "hallazgos_all" on hallazgos;
create policy "hallazgos_all" on hallazgos
  for all to authenticated using (true) with check (true);

-- ---------- ACTUACIONES ----------
drop policy if exists "actuaciones_all" on actuaciones;
create policy "actuaciones_all" on actuaciones
  for all to authenticated using (true) with check (true);

-- ---------- DOCUMENTOS ----------
drop policy if exists "documentos_all" on documentos;
create policy "documentos_all" on documentos
  for all to authenticated using (true) with check (true);

-- ============================================================================
-- (Opcional) Lectura pública anónima para una demo sin login.
-- Descomenta si quieres exponer los datos en modo solo lectura.
-- ============================================================================
-- create policy "predios_public_read" on predios for select to anon using (true);
