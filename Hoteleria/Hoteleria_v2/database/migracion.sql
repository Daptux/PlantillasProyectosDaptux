-- ============================================================
--  HOTELERIA APP - MIGRACIÓN SOBRE BD EXISTENTE
--  Úsalo SOLO si ya tienes la BD con datos y NO quieres recrearla.
--  Estos cambios ya fueron aplicados a la BD de desarrollo.
-- ============================================================

USE hoteleria_db;

-- 1) Agregar imagen_url a habitaciones (si no existe).
--    Si MySQL marca error de columna duplicada, ya está aplicada: ignóralo.
ALTER TABLE habitaciones
  ADD COLUMN imagen_url VARCHAR(255) NULL AFTER estado;

-- 2) Agregar el estado INACTIVA al ENUM de habitaciones.
ALTER TABLE habitaciones
  MODIFY COLUMN estado
  ENUM('DISPONIBLE','OCUPADA','MANTENIMIENTO','LIMPIEZA','INACTIVA')
  NOT NULL DEFAULT 'DISPONIBLE';

-- 3) Crear la tabla de pagos.
CREATE TABLE IF NOT EXISTS pagos (
  id_pago     INT(11)      NOT NULL AUTO_INCREMENT,
  id_reserva  INT(11)      NOT NULL,
  metodo_pago ENUM('EFECTIVO','TARJETA','TRANSFERENCIA') NOT NULL,
  monto       DECIMAL(10,2) NOT NULL,
  estado      ENUM('PENDIENTE','PAGADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  fecha_pago  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pago),
  KEY idx_pagos_reserva (id_reserva),
  CONSTRAINT fk_pagos_reserva
    FOREIGN KEY (id_reserva) REFERENCES reservas (id_reserva)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) (Opcional) Forzar documento único en usuarios.
--    Ejecútalo solo si NO tienes documentos duplicados.
-- ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_documento (documento);
