-- ============================================================================
-- OdontoAdmin Pro - Esquema de Base de Datos (PostgreSQL)
-- Portado desde schema.sql (MySQL). Motor: PostgreSQL 14+.
-- ----------------------------------------------------------------------------
-- Convenciones:
--   * id SERIAL/BIGSERIAL como PK.
--   * TINYINT(1) -> SMALLINT (se mantiene el uso 1/0 del código).
--   * ENUM -> VARCHAR (la app envía/recibe strings).
--   * JSON -> JSONB.
--   * created_at / updated_at con trigger para emular ON UPDATE CURRENT_TIMESTAMP.
-- ============================================================================

DROP TABLE IF EXISTS logs_actividad, configuracion_clinica, blog_posts,
  preguntas_frecuentes, testimonios, galeria, movimientos_inventario, inventario,
  proveedores, pagos, detalle_planes_tratamiento, planes_tratamiento, odontograma,
  evoluciones_clinicas, historias_clinicas, citas, odontologo_servicios, servicios,
  pacientes, odontologos, especialidades, usuarios, roles CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- Función/trigger genérico para actualizar updated_at en cada UPDATE.
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. ROLES
-- ============================================================================
CREATE TABLE roles (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(50)  NOT NULL,
  descripcion   VARCHAR(255),
  activo        SMALLINT     NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_roles_nombre UNIQUE (nombre)
);
CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 2. USUARIOS
-- ============================================================================
CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  rol_id        INTEGER      NOT NULL,
  nombre        VARCHAR(150) NOT NULL,
  correo        VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono      VARCHAR(30),
  activo        SMALLINT     NOT NULL DEFAULT 1,
  ultimo_login  TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_correo UNIQUE (correo),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX idx_usuarios_rol ON usuarios (rol_id);
CREATE TRIGGER trg_usuarios_updated BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 3. ESPECIALIDADES
-- ============================================================================
CREATE TABLE especialidades (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(255),
  activo        SMALLINT     NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_especialidades_nombre UNIQUE (nombre)
);
CREATE TRIGGER trg_especialidades_updated BEFORE UPDATE ON especialidades FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 4. ODONTOLOGOS
-- ============================================================================
CREATE TABLE odontologos (
  id              SERIAL PRIMARY KEY,
  usuario_id      INTEGER,
  especialidad_id INTEGER,
  nombre          VARCHAR(150) NOT NULL,
  documento       VARCHAR(40),
  registro_profesional VARCHAR(80),
  telefono        VARCHAR(30),
  correo          VARCHAR(150),
  foto_url        VARCHAR(255),
  biografia       TEXT,
  horarios        JSONB,
  visible_landing SMALLINT     NOT NULL DEFAULT 1,
  estado          SMALLINT     NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_odontologos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_odontologos_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_odontologos_usuario ON odontologos (usuario_id);
CREATE INDEX idx_odontologos_especialidad ON odontologos (especialidad_id);
CREATE INDEX idx_odontologos_estado ON odontologos (estado);
CREATE TRIGGER trg_odontologos_updated BEFORE UPDATE ON odontologos FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 5. PACIENTES
-- ============================================================================
CREATE TABLE pacientes (
  id                    SERIAL PRIMARY KEY,
  usuario_id            INTEGER,
  nombre                VARCHAR(150) NOT NULL,
  tipo_documento        VARCHAR(20)  NOT NULL DEFAULT 'CC',
  numero_documento      VARCHAR(40)  NOT NULL,
  fecha_nacimiento      DATE,
  genero                VARCHAR(10)  NOT NULL DEFAULT 'NA',
  telefono              VARCHAR(30),
  correo                VARCHAR(150),
  direccion             VARCHAR(255),
  ocupacion             VARCHAR(120),
  contacto_emergencia_nombre   VARCHAR(150),
  contacto_emergencia_telefono VARCHAR(30),
  alergias              TEXT,
  enfermedades          TEXT,
  medicamentos          TEXT,
  antecedentes_medicos      TEXT,
  antecedentes_odontologicos TEXT,
  observaciones         TEXT,
  acepta_tratamiento_datos SMALLINT NOT NULL DEFAULT 0,
  estado                SMALLINT     NOT NULL DEFAULT 1,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_pacientes_documento UNIQUE (tipo_documento, numero_documento)
);
CREATE INDEX idx_pacientes_nombre ON pacientes (nombre);
CREATE INDEX idx_pacientes_telefono ON pacientes (telefono);
CREATE INDEX idx_pacientes_documento ON pacientes (numero_documento);
CREATE INDEX idx_pacientes_usuario ON pacientes (usuario_id);
ALTER TABLE pacientes ADD CONSTRAINT fk_pacientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
  ON UPDATE CASCADE ON DELETE SET NULL;
CREATE TRIGGER trg_pacientes_updated BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 6. SERVICIOS
-- ============================================================================
CREATE TABLE servicios (
  id                SERIAL PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  categoria         VARCHAR(30)  NOT NULL DEFAULT 'General',
  descripcion_corta VARCHAR(255),
  descripcion_larga TEXT,
  precio_base       NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  duracion_min      INTEGER      NOT NULL DEFAULT 30,
  imagen_url        VARCHAR(255),
  icono             VARCHAR(80),
  visible_landing   SMALLINT     NOT NULL DEFAULT 1,
  activo            SMALLINT     NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_servicios_categoria ON servicios (categoria);
CREATE INDEX idx_servicios_visible ON servicios (visible_landing);
CREATE INDEX idx_servicios_activo ON servicios (activo);
CREATE TRIGGER trg_servicios_updated BEFORE UPDATE ON servicios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Relación N:M odontólogo <-> servicios
CREATE TABLE odontologo_servicios (
  odontologo_id INTEGER NOT NULL,
  servicio_id   INTEGER NOT NULL,
  PRIMARY KEY (odontologo_id, servicio_id),
  CONSTRAINT fk_os_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_os_servicio FOREIGN KEY (servicio_id) REFERENCES servicios (id)
    ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_os_servicio ON odontologo_servicios (servicio_id);

-- ============================================================================
-- 7. CITAS
-- ============================================================================
CREATE TABLE citas (
  id            SERIAL PRIMARY KEY,
  paciente_id   INTEGER,
  odontologo_id INTEGER,
  servicio_id   INTEGER,
  nombre_contacto   VARCHAR(150),
  telefono_contacto VARCHAR(30),
  correo_contacto   VARCHAR(150),
  fecha         DATE NOT NULL,
  hora_inicio   TIME NOT NULL,
  hora_fin      TIME,
  motivo        VARCHAR(255),
  estado        VARCHAR(20) NOT NULL DEFAULT 'SOLICITADA',
  origen        VARCHAR(20) NOT NULL DEFAULT 'WEB',
  confirmada    SMALLINT NOT NULL DEFAULT 0,
  observaciones TEXT,
  creado_por    INTEGER,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_citas_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_citas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_citas_creado_por FOREIGN KEY (creado_por) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_citas_paciente ON citas (paciente_id);
CREATE INDEX idx_citas_odontologo ON citas (odontologo_id);
CREATE INDEX idx_citas_servicio ON citas (servicio_id);
CREATE INDEX idx_citas_fecha ON citas (fecha);
CREATE INDEX idx_citas_estado ON citas (estado);
CREATE INDEX idx_citas_agenda ON citas (odontologo_id, fecha, hora_inicio);
CREATE TRIGGER trg_citas_updated BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 8. HISTORIAS CLINICAS
-- ============================================================================
CREATE TABLE historias_clinicas (
  id                  SERIAL PRIMARY KEY,
  paciente_id         INTEGER NOT NULL,
  odontologo_id       INTEGER,
  motivo_consulta     TEXT,
  antecedentes        TEXT,
  diagnostico         TEXT,
  observaciones       TEXT,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_historia_paciente UNIQUE (paciente_id),
  CONSTRAINT fk_historia_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_historia_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_historia_odontologo ON historias_clinicas (odontologo_id);
CREATE TRIGGER trg_historias_updated BEFORE UPDATE ON historias_clinicas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 9. EVOLUCIONES CLINICAS
-- ============================================================================
CREATE TABLE evoluciones_clinicas (
  id                    SERIAL PRIMARY KEY,
  historia_id           INTEGER NOT NULL,
  paciente_id           INTEGER NOT NULL,
  cita_id               INTEGER,
  odontologo_id         INTEGER,
  procedimiento         VARCHAR(255),
  diagnostico           TEXT,
  descripcion           TEXT,
  recomendaciones       TEXT,
  medicamentos          TEXT,
  proxima_cita_sugerida DATE,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evol_historia FOREIGN KEY (historia_id) REFERENCES historias_clinicas (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_evol_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_evol_cita FOREIGN KEY (cita_id) REFERENCES citas (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_evol_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_evol_historia ON evoluciones_clinicas (historia_id);
CREATE INDEX idx_evol_paciente ON evoluciones_clinicas (paciente_id);
CREATE INDEX idx_evol_cita ON evoluciones_clinicas (cita_id);
CREATE INDEX idx_evol_odontologo ON evoluciones_clinicas (odontologo_id);

-- ============================================================================
-- 10. ODONTOGRAMA
-- ============================================================================
CREATE TABLE odontograma (
  id                    SERIAL PRIMARY KEY,
  paciente_id           INTEGER NOT NULL,
  odontologo_id         INTEGER,
  numero_diente         SMALLINT NOT NULL,
  estado                VARCHAR(30) NOT NULL DEFAULT 'SANO',
  observaciones         TEXT,
  tratamiento_sugerido  VARCHAR(255),
  tratamiento_realizado VARCHAR(255),
  fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_odon_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_odon_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_odon_paciente ON odontograma (paciente_id);
CREATE INDEX idx_odon_diente ON odontograma (paciente_id, numero_diente);
CREATE TRIGGER trg_odontograma_updated BEFORE UPDATE ON odontograma FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 11. PLANES DE TRATAMIENTO
-- ============================================================================
CREATE TABLE planes_tratamiento (
  id                 SERIAL PRIMARY KEY,
  paciente_id        INTEGER NOT NULL,
  odontologo_id      INTEGER,
  nombre             VARCHAR(150) NOT NULL,
  diagnostico_general TEXT,
  descripcion        TEXT,
  estado             VARCHAR(20) NOT NULL DEFAULT 'PROPUESTO',
  total              NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  descuento          NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_final        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_plan_odontologo FOREIGN KEY (odontologo_id) REFERENCES odontologos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_plan_paciente ON planes_tratamiento (paciente_id);
CREATE INDEX idx_plan_odontologo ON planes_tratamiento (odontologo_id);
CREATE INDEX idx_plan_estado ON planes_tratamiento (estado);
CREATE TRIGGER trg_planes_updated BEFORE UPDATE ON planes_tratamiento FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE detalle_planes_tratamiento (
  id                SERIAL PRIMARY KEY,
  plan_id           INTEGER NOT NULL,
  servicio_id       INTEGER,
  numero_diente     SMALLINT,
  descripcion       VARCHAR(255),
  precio            NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  cantidad          INTEGER NOT NULL DEFAULT 1,
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_detplan_plan FOREIGN KEY (plan_id) REFERENCES planes_tratamiento (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detplan_servicio FOREIGN KEY (servicio_id) REFERENCES servicios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_detplan_plan ON detalle_planes_tratamiento (plan_id);
CREATE INDEX idx_detplan_servicio ON detalle_planes_tratamiento (servicio_id);
CREATE TRIGGER trg_detplan_updated BEFORE UPDATE ON detalle_planes_tratamiento FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 12. PAGOS
-- ============================================================================
CREATE TABLE pagos (
  id            SERIAL PRIMARY KEY,
  paciente_id   INTEGER NOT NULL,
  plan_id       INTEGER,
  cita_id       INTEGER,
  monto         NUMERIC(12,2) NOT NULL,
  metodo        VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
  concepto      VARCHAR(255),
  observaciones TEXT,
  registrado_por INTEGER,
  fecha         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_pagos_monto CHECK (monto >= 0),
  CONSTRAINT fk_pagos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_plan FOREIGN KEY (plan_id) REFERENCES planes_tratamiento (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_pagos_cita FOREIGN KEY (cita_id) REFERENCES citas (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_pagos_usuario FOREIGN KEY (registrado_por) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_pagos_paciente ON pagos (paciente_id);
CREATE INDEX idx_pagos_plan ON pagos (plan_id);
CREATE INDEX idx_pagos_cita ON pagos (cita_id);
CREATE INDEX idx_pagos_fecha ON pagos (fecha);

-- ============================================================================
-- 13. PROVEEDORES
-- ============================================================================
CREATE TABLE proveedores (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  contacto      VARCHAR(150),
  telefono      VARCHAR(30),
  correo        VARCHAR(150),
  direccion     VARCHAR(255),
  activo        SMALLINT     NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_proveedores_nombre ON proveedores (nombre);
CREATE TRIGGER trg_proveedores_updated BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 14. INVENTARIO
-- ============================================================================
CREATE TABLE inventario (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(150) NOT NULL,
  categoria       VARCHAR(30)  NOT NULL DEFAULT 'Otros',
  descripcion     VARCHAR(255),
  stock_actual    INTEGER NOT NULL DEFAULT 0,
  stock_minimo    INTEGER NOT NULL DEFAULT 0,
  unidad_medida   VARCHAR(40) NOT NULL DEFAULT 'unidad',
  fecha_vencimiento DATE,
  proveedor_id    INTEGER,
  costo_unitario  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  estado          SMALLINT NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_inv_stock CHECK (stock_actual >= 0),
  CONSTRAINT fk_inv_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_inv_categoria ON inventario (categoria);
CREATE INDEX idx_inv_proveedor ON inventario (proveedor_id);
CREATE INDEX idx_inv_vencimiento ON inventario (fecha_vencimiento);
CREATE TRIGGER trg_inventario_updated BEFORE UPDATE ON inventario FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE movimientos_inventario (
  id              SERIAL PRIMARY KEY,
  inventario_id   INTEGER NOT NULL,
  tipo            VARCHAR(20) NOT NULL,
  cantidad        INTEGER NOT NULL,
  motivo          VARCHAR(255),
  usuario_id      INTEGER,
  fecha           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_mov_inventario FOREIGN KEY (inventario_id) REFERENCES inventario (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_mov_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_mov_inventario ON movimientos_inventario (inventario_id);
CREATE INDEX idx_mov_fecha ON movimientos_inventario (fecha);

-- ============================================================================
-- 15. CONTENIDO WEB
-- ============================================================================
CREATE TABLE galeria (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(150),
  descripcion   VARCHAR(255),
  imagen_url    VARCHAR(255) NOT NULL,
  categoria     VARCHAR(80),
  orden         INTEGER NOT NULL DEFAULT 0,
  visible       SMALLINT     NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_galeria_visible ON galeria (visible);
CREATE TRIGGER trg_galeria_updated BEFORE UPDATE ON galeria FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE testimonios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  comentario    TEXT NOT NULL,
  calificacion  SMALLINT NOT NULL DEFAULT 5,
  servicio      VARCHAR(150),
  foto_url      VARCHAR(255),
  visible       SMALLINT NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_testimonios_calif CHECK (calificacion BETWEEN 1 AND 5)
);
CREATE INDEX idx_testimonios_visible ON testimonios (visible);
CREATE TRIGGER trg_testimonios_updated BEFORE UPDATE ON testimonios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE preguntas_frecuentes (
  id            SERIAL PRIMARY KEY,
  pregunta      VARCHAR(255) NOT NULL,
  respuesta     TEXT NOT NULL,
  orden         INTEGER NOT NULL DEFAULT 0,
  visible       SMALLINT NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_faq_visible ON preguntas_frecuentes (visible);
CREATE TRIGGER trg_faq_updated BEFORE UPDATE ON preguntas_frecuentes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE blog_posts (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(200) NOT NULL,
  slug          VARCHAR(220) NOT NULL,
  resumen       VARCHAR(500),
  contenido     TEXT,
  imagen_url    VARCHAR(255),
  autor_id      INTEGER,
  publicado     SMALLINT NOT NULL DEFAULT 0,
  fecha_publicacion TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_blog_slug UNIQUE (slug),
  CONSTRAINT fk_blog_autor FOREIGN KEY (autor_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_blog_publicado ON blog_posts (publicado);
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 16. CONFIGURACION DE LA CLINICA
-- ============================================================================
CREATE TABLE configuracion_clinica (
  id            SERIAL PRIMARY KEY,
  clave         VARCHAR(80)  NOT NULL,
  valor         TEXT,
  descripcion   VARCHAR(255),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_config_clave UNIQUE (clave)
);
CREATE TRIGGER trg_config_updated BEFORE UPDATE ON configuracion_clinica FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 17. LOGS DE ACTIVIDAD
-- ============================================================================
CREATE TABLE logs_actividad (
  id            BIGSERIAL PRIMARY KEY,
  usuario_id    INTEGER,
  accion        VARCHAR(120) NOT NULL,
  entidad       VARCHAR(80),
  entidad_id    INTEGER,
  detalle       TEXT,
  ip            VARCHAR(45),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_logs_usuario ON logs_actividad (usuario_id);
CREATE INDEX idx_logs_accion ON logs_actividad (accion);
CREATE INDEX idx_logs_fecha ON logs_actividad (created_at);

-- ============================================================================
-- FIN DEL ESQUEMA
-- ============================================================================
