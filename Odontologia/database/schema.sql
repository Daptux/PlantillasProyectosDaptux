-- =====================================================================
--  OdontoAdmin Pro - Esquema de base de datos
--  Motor: MySQL 8+ / InnoDB / utf8mb4
--  Archivo: database/schema.sql
--
--  Convenciones:
--   - Todas las tablas usan InnoDB y utf8mb4_unicode_ci.
--   - PK autoincremental "id".
--   - created_at / updated_at en tablas relevantes.
--   - Soft delete vía columnas "estado" / "activo" en registros sensibles.
--   - Llaves foráneas con ON DELETE/UPDATE explícitos.
-- =====================================================================

DROP DATABASE IF EXISTS odontoadmin;
CREATE DATABASE odontoadmin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE odontoadmin;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
--  ROLES Y USUARIOS
-- =====================================================================

CREATE TABLE roles (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(50)  NOT NULL,            -- SUPERADMIN, ADMIN, etc.
  descripcion   VARCHAR(255) DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuarios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  rol_id        INT UNSIGNED NOT NULL,
  nombre        VARCHAR(150) NOT NULL,
  correo        VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono      VARCHAR(30)  DEFAULT NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  ultimo_login  TIMESTAMP    NULL DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_correo (correo),
  KEY idx_usuarios_rol (rol_id),
  KEY idx_usuarios_activo (activo),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id)
    REFERENCES roles (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  ESPECIALIDADES Y ODONTÓLOGOS
-- =====================================================================

CREATE TABLE especialidades (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(255) DEFAULT NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_especialidades_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE odontologos (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED DEFAULT NULL,        -- vínculo opcional con login
  especialidad_id INT UNSIGNED DEFAULT NULL,
  nombre          VARCHAR(150) NOT NULL,
  documento       VARCHAR(40)  DEFAULT NULL,
  registro_profesional VARCHAR(60) DEFAULT NULL,
  telefono        VARCHAR(30)  DEFAULT NULL,
  correo          VARCHAR(150) DEFAULT NULL,
  foto_url        VARCHAR(255) DEFAULT NULL,
  biografia       TEXT         DEFAULT NULL,
  horarios        JSON         DEFAULT NULL,         -- ej: {"lunes":["08:00-12:00"]}
  visible_landing TINYINT(1)   NOT NULL DEFAULT 1,
  estado          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_odontologos_usuario (usuario_id),
  KEY idx_odontologos_especialidad (especialidad_id),
  KEY idx_odontologos_estado (estado),
  CONSTRAINT fk_odontologos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_odontologos_especialidad FOREIGN KEY (especialidad_id)
    REFERENCES especialidades (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  SERVICIOS
-- =====================================================================

CREATE TABLE servicios (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(150) NOT NULL,
  categoria         ENUM('General','Estetica','Ortodoncia','Cirugia','Endodoncia',
                         'Periodoncia','Rehabilitacion','Odontopediatria','Urgencias')
                    NOT NULL DEFAULT 'General',
  descripcion_corta VARCHAR(255) DEFAULT NULL,
  descripcion_larga TEXT         DEFAULT NULL,
  precio_base       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  duracion_min      INT UNSIGNED NOT NULL DEFAULT 30,   -- duración estimada en minutos
  imagen_url        VARCHAR(255) DEFAULT NULL,
  icono             VARCHAR(60)  DEFAULT NULL,
  visible_landing   TINYINT(1)   NOT NULL DEFAULT 1,
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  orden             INT          NOT NULL DEFAULT 0,
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
  CONSTRAINT fk_os_odontologo FOREIGN KEY (odontologo_id)
    REFERENCES odontologos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_os_servicio FOREIGN KEY (servicio_id)
    REFERENCES servicios (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  PACIENTES
-- =====================================================================

CREATE TABLE pacientes (
  id                       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_documento           ENUM('CC','TI','CE','PA','RC','NIT','OTRO') NOT NULL DEFAULT 'CC',
  numero_documento         VARCHAR(40)  NOT NULL,
  nombres                  VARCHAR(120) NOT NULL,
  apellidos                VARCHAR(120) NOT NULL,
  fecha_nacimiento         DATE         DEFAULT NULL,
  genero                   ENUM('M','F','OTRO') DEFAULT NULL,
  telefono                 VARCHAR(30)  DEFAULT NULL,
  correo                   VARCHAR(150) DEFAULT NULL,
  direccion                VARCHAR(255) DEFAULT NULL,
  ciudad                   VARCHAR(100) DEFAULT NULL,
  ocupacion                VARCHAR(120) DEFAULT NULL,
  contacto_emergencia      VARCHAR(150) DEFAULT NULL,
  telefono_emergencia      VARCHAR(30)  DEFAULT NULL,
  alergias                 TEXT         DEFAULT NULL,
  enfermedades             TEXT         DEFAULT NULL,
  medicamentos             TEXT         DEFAULT NULL,
  antecedentes_medicos     TEXT         DEFAULT NULL,
  antecedentes_odontologicos TEXT       DEFAULT NULL,
  observaciones            TEXT         DEFAULT NULL,
  acepta_tratamiento_datos TINYINT(1)   NOT NULL DEFAULT 0,
  estado                   TINYINT(1)   NOT NULL DEFAULT 1,  -- 1 activo / 0 inactivo (soft delete)
  created_at               TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pacientes_documento (tipo_documento, numero_documento),
  KEY idx_pacientes_nombres (apellidos, nombres),
  KEY idx_pacientes_telefono (telefono),
  KEY idx_pacientes_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  CITAS
-- =====================================================================

CREATE TABLE citas (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id   INT UNSIGNED DEFAULT NULL,   -- puede ser null si viene de la web sin paciente creado
  odontologo_id INT UNSIGNED DEFAULT NULL,
  servicio_id   INT UNSIGNED DEFAULT NULL,
  -- datos de contacto para solicitudes desde la web (sin paciente aún)
  nombre_contacto   VARCHAR(150) DEFAULT NULL,
  telefono_contacto VARCHAR(30)  DEFAULT NULL,
  correo_contacto   VARCHAR(150) DEFAULT NULL,
  fecha         DATE         NOT NULL,
  hora_inicio   TIME         NOT NULL,
  hora_fin      TIME         DEFAULT NULL,
  motivo        VARCHAR(255) DEFAULT NULL,
  observaciones TEXT         DEFAULT NULL,
  estado        ENUM('SOLICITADA','CONFIRMADA','EN_ESPERA','EN_ATENCION',
                     'FINALIZADA','CANCELADA','NO_ASISTIO','REPROGRAMADA')
                NOT NULL DEFAULT 'SOLICITADA',
  origen        ENUM('WEB','WHATSAPP','LLAMADA','PRESENCIAL') NOT NULL DEFAULT 'PRESENCIAL',
  confirmada    TINYINT(1)   NOT NULL DEFAULT 0,
  creado_por    INT UNSIGNED DEFAULT NULL,   -- usuario que registró la cita
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_citas_paciente (paciente_id),
  KEY idx_citas_odontologo (odontologo_id),
  KEY idx_citas_servicio (servicio_id),
  KEY idx_citas_fecha (fecha),
  KEY idx_citas_estado (estado),
  KEY idx_citas_agenda (odontologo_id, fecha, hora_inicio),
  CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_citas_odontologo FOREIGN KEY (odontologo_id)
    REFERENCES odontologos (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_citas_servicio FOREIGN KEY (servicio_id)
    REFERENCES servicios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_citas_creado_por FOREIGN KEY (creado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  HISTORIA CLÍNICA Y EVOLUCIONES
-- =====================================================================

CREATE TABLE historias_clinicas (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id        INT UNSIGNED NOT NULL,
  odontologo_id      INT UNSIGNED DEFAULT NULL,
  motivo_consulta    TEXT         DEFAULT NULL,
  antecedentes       TEXT         DEFAULT NULL,
  diagnostico        TEXT         DEFAULT NULL,
  observaciones      TEXT         DEFAULT NULL,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_historia_paciente (paciente_id),  -- 1 historia principal por paciente
  KEY idx_historia_odontologo (odontologo_id),
  CONSTRAINT fk_historia_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_historia_odontologo FOREIGN KEY (odontologo_id)
    REFERENCES odontologos (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- La historia clínica NO se elimina físicamente: las correcciones se hacen
-- mediante nuevas evoluciones (registros append-only).
CREATE TABLE evoluciones_clinicas (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  historia_id        INT UNSIGNED NOT NULL,
  paciente_id        INT UNSIGNED NOT NULL,
  cita_id            INT UNSIGNED DEFAULT NULL,
  odontologo_id      INT UNSIGNED DEFAULT NULL,
  procedimiento      VARCHAR(255) DEFAULT NULL,
  diagnostico        TEXT         DEFAULT NULL,
  descripcion        TEXT         DEFAULT NULL,
  recomendaciones    TEXT         DEFAULT NULL,
  medicamentos       TEXT         DEFAULT NULL,
  proxima_cita_sugerida DATE      DEFAULT NULL,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evolucion_historia (historia_id),
  KEY idx_evolucion_paciente (paciente_id),
  KEY idx_evolucion_cita (cita_id),
  CONSTRAINT fk_evolucion_historia FOREIGN KEY (historia_id)
    REFERENCES historias_clinicas (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_evolucion_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_evolucion_cita FOREIGN KEY (cita_id)
    REFERENCES citas (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_evolucion_odontologo FOREIGN KEY (odontologo_id)
    REFERENCES odontologos (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  ODONTOGRAMA
-- =====================================================================

CREATE TABLE odontograma (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id          INT UNSIGNED NOT NULL,
  numero_diente        SMALLINT     NOT NULL,        -- notación FDI (11-48, 51-85)
  estado               ENUM('SANO','CARIES','RESTAURADO','CORONA','IMPLANTE','AUSENTE',
                            'ENDODONCIA','FRACTURA','EXTRACCION_INDICADA','MOVILIDAD','EN_TRATAMIENTO')
                       NOT NULL DEFAULT 'SANO',
  observaciones        VARCHAR(255) DEFAULT NULL,
  tratamiento_sugerido VARCHAR(255) DEFAULT NULL,
  tratamiento_realizado VARCHAR(255) DEFAULT NULL,
  odontologo_id        INT UNSIGNED DEFAULT NULL,
  fecha                DATE         NOT NULL DEFAULT (CURRENT_DATE),
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_odontograma_paciente_diente (paciente_id, numero_diente),
  KEY idx_odontograma_paciente (paciente_id),
  CONSTRAINT fk_odontograma_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_odontograma_odontologo FOREIGN KEY (odontologo_id)
    REFERENCES odontologos (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  PLANES DE TRATAMIENTO
-- =====================================================================

CREATE TABLE planes_tratamiento (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id        INT UNSIGNED NOT NULL,
  odontologo_id      INT UNSIGNED DEFAULT NULL,
  nombre             VARCHAR(150) NOT NULL,
  diagnostico_general TEXT        DEFAULT NULL,
  descripcion        TEXT         DEFAULT NULL,
  estado             ENUM('PROPUESTO','ACEPTADO','EN_PROCESO','FINALIZADO','CANCELADO')
                     NOT NULL DEFAULT 'PROPUESTO',
  total              DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  descuento          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_final        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_planes_paciente (paciente_id),
  KEY idx_planes_estado (estado),
  CONSTRAINT fk_planes_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_planes_odontologo FOREIGN KEY (odontologo_id)
    REFERENCES odontologos (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_planes_tratamiento (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_id         INT UNSIGNED NOT NULL,
  servicio_id     INT UNSIGNED DEFAULT NULL,
  numero_diente   SMALLINT     DEFAULT NULL,
  descripcion     VARCHAR(255) DEFAULT NULL,
  precio          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  cantidad        INT UNSIGNED NOT NULL DEFAULT 1,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado          ENUM('PENDIENTE','EN_PROCESO','REALIZADO','CANCELADO')
                  NOT NULL DEFAULT 'PENDIENTE',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_detalle_plan (plan_id),
  CONSTRAINT fk_detalle_plan FOREIGN KEY (plan_id)
    REFERENCES planes_tratamiento (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_servicio FOREIGN KEY (servicio_id)
    REFERENCES servicios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  PAGOS
-- =====================================================================

CREATE TABLE pagos (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id   INT UNSIGNED NOT NULL,
  plan_id       INT UNSIGNED DEFAULT NULL,
  cita_id       INT UNSIGNED DEFAULT NULL,
  monto         DECIMAL(12,2) NOT NULL,
  metodo        ENUM('EFECTIVO','TRANSFERENCIA','TARJETA','NEQUI','DAVIPLATA','OTRO')
                NOT NULL DEFAULT 'EFECTIVO',
  concepto      VARCHAR(255) DEFAULT NULL,
  observaciones TEXT         DEFAULT NULL,
  registrado_por INT UNSIGNED DEFAULT NULL,
  fecha         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pagos_paciente (paciente_id),
  KEY idx_pagos_plan (plan_id),
  KEY idx_pagos_fecha (fecha),
  CONSTRAINT chk_pagos_monto CHECK (monto >= 0),
  CONSTRAINT fk_pagos_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pagos_plan FOREIGN KEY (plan_id)
    REFERENCES planes_tratamiento (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_pagos_cita FOREIGN KEY (cita_id)
    REFERENCES citas (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_pagos_usuario FOREIGN KEY (registrado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  INVENTARIO
-- =====================================================================

CREATE TABLE proveedores (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(150) NOT NULL,
  contacto      VARCHAR(150) DEFAULT NULL,
  telefono      VARCHAR(30)  DEFAULT NULL,
  correo        VARCHAR(150) DEFAULT NULL,
  direccion     VARCHAR(255) DEFAULT NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventario (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(150) NOT NULL,
  categoria         ENUM('Anestesia','Guantes','Tapabocas','Resinas','Fresas','Agujas',
                        'Suturas','Cementos','Ortodoncia','Blanqueamiento','Bioseguridad','Otros')
                    NOT NULL DEFAULT 'Otros',
  descripcion       VARCHAR(255) DEFAULT NULL,
  stock_actual      INT          NOT NULL DEFAULT 0,
  stock_minimo      INT          NOT NULL DEFAULT 0,
  unidad_medida     VARCHAR(30)  DEFAULT 'unidad',
  fecha_vencimiento DATE         DEFAULT NULL,
  proveedor_id      INT UNSIGNED DEFAULT NULL,
  costo_unitario    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado            TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inventario_categoria (categoria),
  KEY idx_inventario_proveedor (proveedor_id),
  KEY idx_inventario_vencimiento (fecha_vencimiento),
  CONSTRAINT chk_inventario_stock CHECK (stock_actual >= 0),
  CONSTRAINT fk_inventario_proveedor FOREIGN KEY (proveedor_id)
    REFERENCES proveedores (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE movimientos_inventario (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  inventario_id INT UNSIGNED NOT NULL,
  tipo          ENUM('ENTRADA','SALIDA') NOT NULL,
  cantidad      INT          NOT NULL,
  motivo        VARCHAR(255) DEFAULT NULL,
  usuario_id    INT UNSIGNED DEFAULT NULL,
  fecha         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mov_inventario (inventario_id),
  KEY idx_mov_fecha (fecha),
  CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_mov_inventario FOREIGN KEY (inventario_id)
    REFERENCES inventario (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_mov_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  CONTENIDO WEB
-- =====================================================================

CREATE TABLE galeria (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(150) DEFAULT NULL,
  descripcion   VARCHAR(255) DEFAULT NULL,
  imagen_url    VARCHAR(255) NOT NULL,
  categoria     VARCHAR(60)  DEFAULT 'general',  -- clinica, consultorio, tratamiento, antes_despues
  orden         INT          NOT NULL DEFAULT 0,
  visible       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_galeria_visible (visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(150) NOT NULL,
  comentario    TEXT         NOT NULL,
  calificacion  TINYINT      NOT NULL DEFAULT 5,  -- 1 a 5
  servicio      VARCHAR(150) DEFAULT NULL,
  foto_url      VARCHAR(255) DEFAULT NULL,
  visible       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_testimonios_visible (visible),
  CONSTRAINT chk_testimonios_calif CHECK (calificacion BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE preguntas_frecuentes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pregunta      VARCHAR(255) NOT NULL,
  respuesta     TEXT         NOT NULL,
  orden         INT          NOT NULL DEFAULT 0,
  visible       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faqs_visible (visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_posts (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(200) NOT NULL,
  slug          VARCHAR(220) NOT NULL,
  resumen       VARCHAR(300) DEFAULT NULL,
  contenido     LONGTEXT     DEFAULT NULL,
  imagen_url    VARCHAR(255) DEFAULT NULL,
  autor         VARCHAR(150) DEFAULT NULL,
  publicado     TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_publicacion DATETIME DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_slug (slug),
  KEY idx_blog_publicado (publicado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configuración general de la clínica (singleton: 1 fila editable)
CREATE TABLE configuracion_clinica (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre_clinica  VARCHAR(150) NOT NULL DEFAULT 'OdontoAdmin Pro',
  logo_url        VARCHAR(255) DEFAULT NULL,
  telefono        VARCHAR(30)  DEFAULT NULL,
  whatsapp        VARCHAR(30)  DEFAULT NULL,
  correo          VARCHAR(150) DEFAULT NULL,
  direccion       VARCHAR(255) DEFAULT NULL,
  ciudad          VARCHAR(100) DEFAULT NULL,
  mapa_embed      TEXT         DEFAULT NULL,
  horarios        TEXT         DEFAULT NULL,
  color_primario  VARCHAR(20)  DEFAULT '#0ea5e9',
  color_secundario VARCHAR(20) DEFAULT '#14b8a6',
  facebook        VARCHAR(255) DEFAULT NULL,
  instagram       VARCHAR(255) DEFAULT NULL,
  tiktok          VARCHAR(255) DEFAULT NULL,
  hero_titulo     VARCHAR(255) DEFAULT NULL,
  hero_subtitulo  VARCHAR(500) DEFAULT NULL,
  hero_imagen_url VARCHAR(255) DEFAULT NULL,
  stat_pacientes  VARCHAR(30)  DEFAULT NULL,
  stat_experiencia VARCHAR(30) DEFAULT NULL,
  stat_tratamientos VARCHAR(30) DEFAULT NULL,
  stat_calificacion VARCHAR(30) DEFAULT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  LOGS DE ACTIVIDAD
-- =====================================================================

CREATE TABLE logs_actividad (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED DEFAULT NULL,
  accion        VARCHAR(100) NOT NULL,        -- LOGIN, CREAR_PACIENTE, etc.
  entidad       VARCHAR(60)  DEFAULT NULL,    -- pacientes, citas, ...
  entidad_id    INT UNSIGNED DEFAULT NULL,
  detalle       TEXT         DEFAULT NULL,
  ip            VARCHAR(45)  DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_logs_usuario (usuario_id),
  KEY idx_logs_fecha (created_at),
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
--  FIN DEL ESQUEMA
-- =====================================================================
