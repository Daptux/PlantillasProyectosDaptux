-- ============================================================
--  HOTELERIA APP - SEED (datos iniciales)
--  Ejecutar DESPUÉS de schema.sql
--
--  Credenciales de prueba:
--    ADMIN    -> admin@hoteleria.com    / Admin123*
--    CLIENTE  -> cliente1@test.com      / Cliente123*
--    CLIENTE  -> cliente2@test.com      / Cliente123*
-- ============================================================

USE hoteleria_db;

-- ------------------------------------------------------------
-- Usuario ADMIN inicial
-- (hash bcrypt de 'Admin123*')
-- ------------------------------------------------------------
INSERT INTO usuarios (nombre, apellido, email, password, telefono, documento, rol, cargo, estado)
VALUES
('Admin', 'Principal', 'admin@hoteleria.com',
 '$2b$10$CId75tmhcYjYjC3/.prWFOhmeekIGKAt7u91zUfDAHl/tps1yjOKK',
 '3000000000', 'ADMIN-001', 'ADMIN', 'Administrador', 'ACTIVO')
ON DUPLICATE KEY UPDATE email = email;

-- ------------------------------------------------------------
-- Clientes de prueba
-- (hash bcrypt de 'Cliente123*')
-- ------------------------------------------------------------
INSERT INTO usuarios (nombre, apellido, email, password, telefono, documento, rol, estado)
VALUES
('Juan',  'Pérez',   'cliente1@test.com',
 '$2b$10$hd7q/WwF59SXZ478k0Ro0ebIDAFyzuO.tZdbyxAyu/bGlYRtnNuIG',
 '3001112233', 'CC-1001', 'CLIENTE', 'ACTIVO'),
('María', 'Gómez',   'cliente2@test.com',
 '$2b$10$hd7q/WwF59SXZ478k0Ro0ebIDAFyzuO.tZdbyxAyu/bGlYRtnNuIG',
 '3004445566', 'CC-1002', 'CLIENTE', 'ACTIVO')
ON DUPLICATE KEY UPDATE email = email;

-- ------------------------------------------------------------
-- Habitaciones de ejemplo
-- ------------------------------------------------------------
INSERT INTO habitaciones (numero, tipo, descripcion, precio_noche, capacidad, estado)
VALUES
('101', 'INDIVIDUAL', 'Habitación individual con vista a la calle',  80000.00, 1, 'DISPONIBLE'),
('102', 'DOBLE',      'Habitación doble con balcón',               120000.00, 2, 'DISPONIBLE'),
('201', 'SUITE',      'Suite de lujo con jacuzzi',                 250000.00, 2, 'DISPONIBLE'),
('202', 'FAMILIAR',   'Habitación familiar para 4 personas',       180000.00, 4, 'DISPONIBLE'),
('203', 'DOBLE',      'Habitación doble económica',                100000.00, 2, 'MANTENIMIENTO')
ON DUPLICATE KEY UPDATE numero = numero;
