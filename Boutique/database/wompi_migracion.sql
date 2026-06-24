-- ============================================================
--  MIGRACIÓN: integración Wompi (Payment Links)
--  Aplica esto si ya tienes la base creada (sin recrearla).
--  En XAMPP/Windows:
--    "C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 < wompi_migracion.sql
-- ============================================================
USE boutique_ecommerce;

-- Columna para guardar el id del Payment Link de Wompi y correlacionar el webhook.
-- (Si la columna ya existe, ignora el error de "Duplicate column".)
ALTER TABLE orders
  ADD COLUMN wompi_link_id VARCHAR(60) DEFAULT NULL AFTER cupon_codigo;
