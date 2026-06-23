-- ============================================================================
-- OdontoAdmin Pro - Esquema de Base de Datos
-- Motor: MySQL 8+ (InnoDB, utf8mb4)
-- ----------------------------------------------------------------------------
-- Convenciones:
--   * Todas las tablas usan InnoDB + utf8mb4_unicode_ci.
--   * created_at / updated_at en (casi) todas las tablas.
--   * Soft delete mediante columna `estado` o `activo` en registros sensibles.
--   * La historia clínica y sus evoluciones NUNCA se eliminan físicamente.
--   * FKs con ON DELETE RESTRICT por defecto para proteger integridad clínica;
--     se usa SET NULL solo en relaciones opcionales.
-- ============================================================================

DROP DATABASE IF EXISTS odontoadmin;
CREATE DATABASE odontoadmin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE odontoadmin;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. ROLES
-- ============================================================================
CREATE TABLE roles (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(50)  NOT NULL,          -- SUPERADMIN, ADMIN, RECEPCIONISTA, ODONTOLOGO, AUXILIAR, CAJA, PACIENTE
  descripcion   VARCHAR(255) NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. USUARIOS
-- ============================================================================
CREATE TABLE usuarios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  rol_id        INT UNSIGNED NOT NULL,
  nombre        VARCHAR(150) NOT NULL,
  correo        VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono      VARCHAR(30)  NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  ultimo_login  TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_correo (correo),
  KEY idx_usuarios_rol (rol_id),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. ESPECIALIDADES
-- ============================================================================
CREATE TABLE especialidades (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(255) NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_especialidades_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. ODONTOLOGOS
-- ============================================================================
CREATE TABLE odontologos (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED NULL,            -- enlaza con login (opcional)
  especialidad_id INT UNSIGNED NULL,
  nombre          VARCHAR(150) NOT NULL,
  documento       VARCHAR(40)  NULL,
  registro_profesional VARCHAR(80) NULL,        -- número de tarjeta profesional
  telefono        VARCHAR(30)  NULL,
  correo          VARCHAR(150) NULL,
  foto_url        VARCHAR(255) NULL,
  biografia       TEXT         NULL,
  horarios        JSON         NULL,            -- estructura libre de disponibilidad
  visible_landing TINYINT(1)   NOT NULL DEFAULT 1,
  estado          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_odontologos_usuario (usuario_id),
  KEY idx_odontologos_especialidad (especialidad_id),
  KEY idx_odontologos_estado (estado),
  CONSTRAINT fk_odontologos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_odontologos_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. PACIENTES
-- ============================================================================
CREATE TABLE pacientes (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id            INT UNSIGNED NULL,       -- portal del paciente (opcional)
  nombre                VARCHAR(150) NOT NULL,
  tipo_documento        ENUM('CC','TI','CE','PASAPORTE','RC','NIT','OTRO') NOT NULL DEFAULT 'CC',
  numero_documento      VARCHAR(40)  NOT NULL,
  fecha_nacimiento      DATE         NULL,
  genero                ENUM('M','F','OTRO','NA') NOT NULL DEFAULT 'NA',
  telefono              VARCHAR(30)  NULL,
  correo                VARCHAR(150) NULL,
  direccion             VARCHAR(255) NULL,
  ocupacion             VARCHAR(120) NULL,
  contacto_emergencia_nombre   VARCHAR(150) NULL,
  contacto_emergencia_telefono VARCHAR(30)  NULL,
  alergias              TEXT NULL,
  enfermedades          TEXT NULL,
  medicamentos          TEXT NULL,
  antecedentes_medicos      TEXT NULL,
  antecedentes_odontologicos TEXT NULL,
  observaciones         TEXT NULL,
  acepta_tratamiento_datos TINYINT(1) NOT NULL DEFAULT 0,
  estado                TINYINT(1)   NOT NULL DEFAULT 1,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pacientes_documento (tipo_documento, numero_documento),
  KEY idx_pacientes_nombre (nombre),
  KEY idx_pacientes_telefono (telefono),
  KEY idx_pacientes_documento (numero_documento),
  KEY idx_pacientes_usuario (usuario_id),
  CONSTRAINT fk_pacientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. SERVICIOS
-- ============================================================================
CREATE TABLE servicios (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(150) NOT NULL,
  categoria         ENUM('General','Estetica','Ortodoncia','Cirugia','Endodoncia',
                         'Periodoncia','Rehabilitacion','Odontopediatria','Urgencias') NOT NULL DEFAULT 'General',
  descripcion_corta VARCHAR(255) NULL,
  descripcion_larga TEXT NULL,
  precio_base       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  duracion_min      INT UNSIGNED NOT NULL DEFAULT 30,  -- duración estimada en minutos
  imagen_url        VARCHAR(255) NULL,
  icono             VARCHAR(80)  NULL,                 -- nombre de ícono para la landing
  visible_landing   TINYINT(1)   NOT NULL DEFAULT 1,
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_servicios_categoria (categoria),
  KEY idx_servicios_visible (visible_landing),
  KEY idx_servicios_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación N:M odontólogo <-> servicios que realiza
CREATE TABLE odontologo_servicios (
  odontologo_id INT UNSIGNED NOT NULL,
  servicio_id   INT UNSIGNED NOT NULL,
  PRIMARY KEY (odontologo_id, servicio_id),
  KEY idx_os_servicio (servicio_id),
  CONSTRAINT fk_os_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_os_servicio FOREIGN KEY (servicio_id) REFERENCES servicios (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. CITAS
-- ============================================================================
CREATE TABLE citas (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id   INT UNSIGNED NULL,           -- NULL hasta que recepción cree/asocie el paciente
  odontologo_id INT UNSIGNED NULL,
  servicio_id   INT UNSIGNED NULL,
  -- Datos de contacto cuando la cita llega desde la landing sin paciente registrado:
  nombre_contacto   VARCHAR(150) NULL,
  telefono_contacto VARCHAR(30)  NULL,
  correo_contacto   VARCHAR(150) NULL,
  fecha         DATE NOT NULL,
  hora_inicio   TIME NOT NULL,
  hora_fin      TIME NULL,
  motivo        VARCHAR(255) NULL,
  estado        ENUM('SOLICITADA','CONFIRMADA','EN_ESPERA','EN_ATENCION',
                     'FINALIZADA','CANCELADA','NO_ASISTIO','REPROGRAMADA') NOT NULL DEFAULT 'SOLICITADA',
  origen        ENUM('WEB','WHATSAPP','LLAMADA','PRESENCIAL') NOT NULL DEFAULT 'WEB',
  confirmada    TINYINT(1) NOT NULL DEFAULT 0,
  observaciones TEXT NULL,
  creado_por    INT UNSIGNED NULL,           -- usuario que registró
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_citas_paciente (paciente_id),
  KEY idx_citas_odontologo (odontologo_id),
  KEY idx_citas_servicio (servicio_id),
  KEY idx_citas_fecha (fecha),
  KEY idx_citas_estado (estado),
  KEY idx_citas_agenda (odontologo_id, fecha, hora_inicio),
  CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_citas_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_citas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_citas_creado_por FOREIGN KEY (creado_por) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. HISTORIAS CLINICAS  (una principal por paciente, no se elimina)
-- ============================================================================
CREATE TABLE historias_clinicas (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id         INT UNSIGNED NOT NULL,
  odontologo_id       INT UNSIGNED NULL,       -- profesional que la abre
  motivo_consulta     TEXT NULL,
  antecedentes        TEXT NULL,
  diagnostico         TEXT NULL,
  observaciones       TEXT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_historia_paciente (paciente_id),  -- una historia principal por paciente
  KEY idx_historia_odontologo (odontologo_id),
  CONSTRAINT fk_historia_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_historia_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. EVOLUCIONES CLINICAS  (registros inmutables ligados a la historia)
-- ============================================================================
CREATE TABLE evoluciones_clinicas (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  historia_id           INT UNSIGNED NOT NULL,
  paciente_id           INT UNSIGNED NOT NULL,
  cita_id               INT UNSIGNED NULL,
  odontologo_id         INT UNSIGNED NULL,
  procedimiento         VARCHAR(255) NULL,
  diagnostico           TEXT NULL,
  descripcion           TEXT NULL,
  recomendaciones       TEXT NULL,
  medicamentos          TEXT NULL,
  proxima_cita_sugerida DATE NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evol_historia (historia_id),
  KEY idx_evol_paciente (paciente_id),
  KEY idx_evol_cita (cita_id),
  KEY idx_evol_odontologo (odontologo_id),
  CONSTRAINT fk_evol_historia FOREIGN KEY (historia_id) REFERENCES historias_clinicas (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_evol_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_evol_cita FOREIGN KEY (cita_id) REFERENCES citas (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_evol_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. ODONTOGRAMA  (estado por diente y paciente)
-- ============================================================================
CREATE TABLE odontograma (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id           INT UNSIGNED NOT NULL,
  odontologo_id         INT UNSIGNED NULL,
  numero_diente         SMALLINT UNSIGNED NOT NULL,   -- notación FDI (11-48, 51-85)
  estado                ENUM('SANO','CARIES','RESTAURADO','CORONA','IMPLANTE','AUSENTE',
                             'ENDODONCIA','FRACTURA','EXTRACCION_INDICADA','MOVILIDAD','EN_TRATAMIENTO')
                        NOT NULL DEFAULT 'SANO',
  observaciones         TEXT NULL,
  tratamiento_sugerido  VARCHAR(255) NULL,
  tratamiento_realizado VARCHAR(255) NULL,
  fecha                 DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_odon_paciente (paciente_id),
  KEY idx_odon_diente (paciente_id, numero_diente),
  CONSTRAINT fk_odon_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_odon_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. PLANES DE TRATAMIENTO
-- ============================================================================
CREATE TABLE planes_tratamiento (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id        INT UNSIGNED NOT NULL,
  odontologo_id      INT UNSIGNED NULL,
  nombre             VARCHAR(150) NOT NULL,
  diagnostico_general TEXT NULL,
  descripcion        TEXT NULL,
  estado             ENUM('PROPUESTO','ACEPTADO','EN_PROCESO','FINALIZADO','CANCELADO')
                     NOT NULL DEFAULT 'PROPUESTO',
  total              DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  descuento          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_final        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_plan_paciente (paciente_id),
  KEY idx_plan_odontologo (odontologo_id),
  KEY idx_plan_estado (estado),
  CONSTRAINT fk_plan_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_plan_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_planes_tratamiento (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_id           INT UNSIGNED NOT NULL,
  servicio_id       INT UNSIGNED NULL,
  numero_diente     SMALLINT UNSIGNED NULL,        -- diente relacionado (opcional)
  descripcion       VARCHAR(255) NULL,
  precio            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  cantidad          INT UNSIGNED NOT NULL DEFAULT 1,
  subtotal          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado            ENUM('PENDIENTE','EN_PROCESO','REALIZADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_detplan_plan (plan_id),
  KEY idx_detplan_servicio (servicio_id),
  CONSTRAINT fk_detplan_plan FOREIGN KEY (plan_id) REFERENCES planes_tratamiento (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detplan_servicio FOREIGN KEY (servicio_id) REFERENCES servicios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. PAGOS
-- ============================================================================
CREATE TABLE pagos (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id   INT UNSIGNED NOT NULL,
  plan_id       INT UNSIGNED NULL,
  cita_id       INT UNSIGNED NULL,
  monto         DECIMAL(12,2) NOT NULL,
  metodo        ENUM('EFECTIVO','TRANSFERENCIA','TARJETA','NEQUI','DAVIPLATA','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  concepto      VARCHAR(255) NULL,
  observaciones TEXT NULL,
  registrado_por INT UNSIGNED NULL,
  fecha         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pagos_paciente (paciente_id),
  KEY idx_pagos_plan (plan_id),
  KEY idx_pagos_cita (cita_id),
  KEY idx_pagos_fecha (fecha),
  CONSTRAINT chk_pagos_monto CHECK (monto >= 0),
  CONSTRAINT fk_pagos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_plan FOREIGN KEY (plan_id) REFERENCES planes_tratamiento (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_pagos_cita FOREIGN KEY (cita_id) REFERENCES citas (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_pagos_usuario FOREIGN KEY (registrado_por) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. PROVEEDORES
-- ============================================================================
CREATE TABLE proveedores (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(150) NOT NULL,
  contacto      VARCHAR(150) NULL,
  telefono      VARCHAR(30)  NULL,
  correo        VARCHAR(150) NULL,
  direccion     VARCHAR(255) NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_proveedores_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. INVENTARIO
-- ============================================================================
CREATE TABLE inventario (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(150) NOT NULL,
  categoria       ENUM('Anestesia','Guantes','Tapabocas','Resinas','Fresas','Agujas',
                       'Suturas','Cementos','Ortodoncia','Blanqueamiento','Bioseguridad','Otros')
                  NOT NULL DEFAULT 'Otros',
  descripcion     VARCHAR(255) NULL,
  stock_actual    INT NOT NULL DEFAULT 0,
  stock_minimo    INT NOT NULL DEFAULT 0,
  unidad_medida   VARCHAR(40) NOT NULL DEFAULT 'unidad',
  fecha_vencimiento DATE NULL,
  proveedor_id    INT UNSIGNED NULL,
  costo_unitario  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado          TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inv_categoria (categoria),
  KEY idx_inv_proveedor (proveedor_id),
  KEY idx_inv_vencimiento (fecha_vencimiento),
  CONSTRAINT chk_inv_stock CHECK (stock_actual >= 0),
  CONSTRAINT fk_inv_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE movimientos_inventario (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  inventario_id   INT UNSIGNED NOT NULL,
  tipo            ENUM('ENTRADA','SALIDA') NOT NULL,
  cantidad        INT NOT NULL,
  motivo          VARCHAR(255) NULL,
  usuario_id      INT UNSIGNED NULL,
  fecha           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mov_inventario (inventario_id),
  KEY idx_mov_fecha (fecha),
  CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_mov_inventario FOREIGN KEY (inventario_id) REFERENCES inventario (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_mov_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. CONTENIDO WEB  (galería, testimonios, FAQs, blog)
-- ============================================================================
CREATE TABLE galeria (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(150) NULL,
  descripcion   VARCHAR(255) NULL,
  imagen_url    VARCHAR(255) NOT NULL,
  categoria     VARCHAR(80)  NULL,        -- consultorio, tratamiento, antes_despues, instalaciones
  orden         INT UNSIGNED NOT NULL DEFAULT 0,
  visible       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_galeria_visible (visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(150) NOT NULL,
  comentario    TEXT NOT NULL,
  calificacion  TINYINT UNSIGNED NOT NULL DEFAULT 5,  -- 1 a 5
  servicio      VARCHAR(150) NULL,
  foto_url      VARCHAR(255) NULL,
  visible       TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_testimonios_visible (visible),
  CONSTRAINT chk_testimonios_calif CHECK (calificacion BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE preguntas_frecuentes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pregunta      VARCHAR(255) NOT NULL,
  respuesta     TEXT NOT NULL,
  orden         INT UNSIGNED NOT NULL DEFAULT 0,
  visible       TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faq_visible (visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_posts (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(200) NOT NULL,
  slug          VARCHAR(220) NOT NULL,
  resumen       VARCHAR(500) NULL,
  contenido     LONGTEXT NULL,
  imagen_url    VARCHAR(255) NULL,
  autor_id      INT UNSIGNED NULL,
  publicado     TINYINT(1) NOT NULL DEFAULT 0,
  fecha_publicacion TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_slug (slug),
  KEY idx_blog_publicado (publicado),
  CONSTRAINT fk_blog_autor FOREIGN KEY (autor_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. CONFIGURACION DE LA CLINICA  (clave/valor para personalización)
-- ============================================================================
CREATE TABLE configuracion_clinica (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave         VARCHAR(80)  NOT NULL,   -- nombre_clinica, logo_url, telefono, whatsapp, color_primario...
  valor         TEXT NULL,
  descripcion   VARCHAR(255) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_config_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 17. LOGS DE ACTIVIDAD  (auditoría básica)
-- ============================================================================
CREATE TABLE logs_actividad (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED NULL,
  accion        VARCHAR(120) NOT NULL,     -- LOGIN, CREAR_CITA, ACTUALIZAR_PACIENTE...
  entidad       VARCHAR(80)  NULL,         -- tabla afectada
  entidad_id    INT UNSIGNED NULL,
  detalle       TEXT NULL,
  ip            VARCHAR(45)  NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_logs_usuario (usuario_id),
  KEY idx_logs_accion (accion),
  KEY idx_logs_fecha (created_at),
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- FIN DEL ESQUEMA
-- ============================================================================
