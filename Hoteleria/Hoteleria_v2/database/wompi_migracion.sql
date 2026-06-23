-- ============================================================
--  MIGRACIÓN: Pasarela de pagos Wompi (sandbox)
--  Ejecutar sobre una base de datos hoteleria_db ya existente.
-- ============================================================

USE hoteleria_db;

-- ------------------------------------------------------------
-- 1) Tabla de INTENTOS DE PAGO
--    Guarda los datos de la reserva ANTES de que exista, mientras
--    el cliente paga en Wompi. La reserva sólo se crea cuando el
--    pago queda APROBADO (ver pagos.controller -> procesarTransaccion).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos_intentos (
  id_intento           INT(11)      NOT NULL AUTO_INCREMENT,
  referencia           VARCHAR(80)  NOT NULL,           -- referencia única enviada a Wompi
  id_usuario           INT(11)      NOT NULL,
  id_habitacion        INT(11)      NOT NULL,
  fecha_entrada        DATE         NOT NULL,
  fecha_salida         DATE         NOT NULL,
  monto                DECIMAL(10,2) NOT NULL,
  estado               ENUM('PENDIENTE','APROBADO','RECHAZADO','CONFLICTO') NOT NULL DEFAULT 'PENDIENTE',
  wompi_transaction_id VARCHAR(60)  NULL,
  id_reserva           INT(11)      NULL,               -- se llena al aprobar el pago
  fecha_creacion       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_intento),
  UNIQUE KEY uq_pagos_intentos_referencia (referencia),
  KEY idx_pagos_intentos_usuario (id_usuario),
  KEY idx_pagos_intentos_habitacion (id_habitacion),
  KEY idx_pagos_intentos_estado (estado),
  CONSTRAINT fk_pagos_intentos_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pagos_intentos_habitacion
    FOREIGN KEY (id_habitacion) REFERENCES habitaciones (id_habitacion)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pagos_intentos_reserva
    FOREIGN KEY (id_reserva) REFERENCES reservas (id_reserva)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2) Ajustes a la tabla PAGOS
--    - Nuevo método WOMPI.
--    - Columnas para rastrear la transacción de la pasarela.
-- ------------------------------------------------------------
ALTER TABLE pagos
  MODIFY metodo_pago ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','WOMPI') NOT NULL;

ALTER TABLE pagos
  ADD COLUMN referencia VARCHAR(80) NULL AFTER monto,
  ADD COLUMN wompi_transaction_id VARCHAR(60) NULL AFTER referencia;
