-- ============================================================
--  HOTELERIA APP - SCHEMA COMPLETO
--  Motor: MySQL / MariaDB (InnoDB, utf8mb4)
--  Crea la base de datos y todas las tablas desde cero.
-- ============================================================

CREATE DATABASE IF NOT EXISTS hoteleria_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE hoteleria_db;

-- ------------------------------------------------------------
-- TABLA: usuarios  (ADMIN, EMPLEADO, CLIENTE)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario          INT(11)      NOT NULL AUTO_INCREMENT,
  nombre              VARCHAR(100) NOT NULL,
  apellido            VARCHAR(100) NULL,
  email               VARCHAR(150) NOT NULL,
  password            VARCHAR(255) NOT NULL,
  telefono            VARCHAR(30)  NULL,
  documento           VARCHAR(50)  NULL,
  rol                 ENUM('ADMIN','EMPLEADO','CLIENTE') NOT NULL DEFAULT 'CLIENTE',
  cargo               VARCHAR(100) NULL,
  estado              ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  fecha_creacion      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_email (email),
  UNIQUE KEY uq_usuarios_documento (documento),
  KEY idx_usuarios_rol (rol),
  KEY idx_usuarios_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: habitaciones
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitaciones (
  id_habitacion       INT(11)      NOT NULL AUTO_INCREMENT,
  numero              VARCHAR(20)  NOT NULL,
  tipo                ENUM('INDIVIDUAL','DOBLE','SUITE','FAMILIAR') NOT NULL,
  descripcion         TEXT         NULL,
  precio_noche        DECIMAL(10,2) NOT NULL,
  capacidad           INT(11)      NOT NULL,
  estado              ENUM('DISPONIBLE','OCUPADA','MANTENIMIENTO','LIMPIEZA','INACTIVA') NOT NULL DEFAULT 'DISPONIBLE',
  imagen_url          VARCHAR(255) NULL,
  fecha_creacion      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_habitacion),
  UNIQUE KEY uq_habitaciones_numero (numero),
  KEY idx_habitaciones_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: reservas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
  id_reserva          INT(11)      NOT NULL AUTO_INCREMENT,
  id_usuario          INT(11)      NOT NULL,
  id_habitacion       INT(11)      NOT NULL,
  fecha_entrada       DATE         NOT NULL,
  fecha_salida        DATE         NOT NULL,
  total               DECIMAL(10,2) NOT NULL,
  estado              ENUM('PENDIENTE','CONFIRMADA','EN_CURSO','CANCELADA','FINALIZADA') NOT NULL DEFAULT 'PENDIENTE',
  fecha_creacion      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_reserva),
  KEY idx_reservas_usuario (id_usuario),
  KEY idx_reservas_habitacion (id_habitacion),
  KEY idx_reservas_estado (estado),
  KEY idx_reservas_fechas (fecha_entrada, fecha_salida),
  CONSTRAINT fk_reservas_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reservas_habitacion
    FOREIGN KEY (id_habitacion) REFERENCES habitaciones (id_habitacion)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: pagos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
  id_pago              INT(11)      NOT NULL AUTO_INCREMENT,
  id_reserva           INT(11)      NOT NULL,
  metodo_pago          ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','WOMPI') NOT NULL,
  monto                DECIMAL(10,2) NOT NULL,
  referencia           VARCHAR(80)  NULL,               -- referencia de la pasarela (Wompi)
  wompi_transaction_id VARCHAR(60)  NULL,               -- id de transacción en Wompi
  estado               ENUM('PENDIENTE','PAGADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  fecha_pago           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pago),
  KEY idx_pagos_reserva (id_reserva),
  CONSTRAINT fk_pagos_reserva
    FOREIGN KEY (id_reserva) REFERENCES reservas (id_reserva)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: pagos_intentos  (pasarela Wompi)
-- Guarda los datos de una reserva mientras el cliente paga en Wompi.
-- La reserva sólo se crea cuando el pago queda APROBADO.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos_intentos (
  id_intento           INT(11)      NOT NULL AUTO_INCREMENT,
  referencia           VARCHAR(80)  NOT NULL,
  id_usuario           INT(11)      NOT NULL,
  id_habitacion        INT(11)      NOT NULL,
  fecha_entrada        DATE         NOT NULL,
  fecha_salida         DATE         NOT NULL,
  monto                DECIMAL(10,2) NOT NULL,
  estado               ENUM('PENDIENTE','APROBADO','RECHAZADO','CONFLICTO') NOT NULL DEFAULT 'PENDIENTE',
  wompi_transaction_id VARCHAR(60)  NULL,
  id_reserva           INT(11)      NULL,
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
