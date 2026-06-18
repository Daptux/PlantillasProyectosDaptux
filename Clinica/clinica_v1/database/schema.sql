-- ============================================================
--  CLINICA-APP  |  schema.sql
--  MySQL 8.x / MariaDB 10.x  (compatible XAMPP + phpMyAdmin)
--  Motor: InnoDB | Charset: utf8mb4
-- ============================================================
--  Importar DESPUES de crear la base de datos:
--    CREATE DATABASE clinica_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--    USE clinica_app;
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. CLINICAS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS clinicas;
CREATE TABLE clinicas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(150) NOT NULL,
  nit             VARCHAR(50),
  telefono        VARCHAR(50),
  email           VARCHAR(150),
  direccion       VARCHAR(255),
  logo_url        VARCHAR(500),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. SEDES
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sedes;
CREATE TABLE sedes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  nombre          VARCHAR(150) NOT NULL,
  direccion       VARCHAR(255),
  ciudad          VARCHAR(100),
  telefono        VARCHAR(50),
  email           VARCHAR(150),
  latitud         DECIMAL(10,7),
  longitud        DECIMAL(10,7),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sedes_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  INDEX idx_sedes_clinica (clinica_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. ROLES
-- ------------------------------------------------------------
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(40) NOT NULL UNIQUE,   -- SUPER_ADMIN, ADMIN_CLINICA, RECEPCION, MEDICO, LABORATORIO, FACTURACION, PACIENTE
  nombre          VARCHAR(80) NOT NULL,
  descripcion     VARCHAR(255),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. USUARIOS  (cuentas de acceso de cualquier rol)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NULL,                       -- NULL solo para SUPER_ADMIN global
  rol_id          INT NOT NULL,
  nombres         VARCHAR(120) NOT NULL,
  apellidos       VARCHAR(120) NOT NULL,
  email           VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  telefono        VARCHAR(50),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login    DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_usuarios_rol     FOREIGN KEY (rol_id)     REFERENCES roles(id),
  UNIQUE KEY uq_usuarios_email (email),
  INDEX idx_usuarios_clinica (clinica_id),
  INDEX idx_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. PACIENTES  (datos clinicos; vinculado opcionalmente a un usuario)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS pacientes;
CREATE TABLE pacientes (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id          INT NOT NULL,
  usuario_id          INT NULL,                   -- cuenta de acceso del paciente (rol PACIENTE)
  tipo_documento      VARCHAR(20) NOT NULL DEFAULT 'CC',
  numero_documento    VARCHAR(40) NOT NULL,
  nombres             VARCHAR(120) NOT NULL,
  apellidos           VARCHAR(120) NOT NULL,
  fecha_nacimiento    DATE,
  sexo                ENUM('M','F','OTRO') DEFAULT 'OTRO',
  telefono            VARCHAR(50),
  email               VARCHAR(150),
  direccion           VARCHAR(255),
  ciudad              VARCHAR(100),
  eps                 VARCHAR(120),
  grupo_sanguineo     VARCHAR(5),
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pacientes_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_pacientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  UNIQUE KEY uq_pacientes_doc (clinica_id, numero_documento),
  INDEX idx_pacientes_clinica (clinica_id),
  INDEX idx_pacientes_documento (numero_documento),
  INDEX idx_pacientes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. ESPECIALIDADES
-- ------------------------------------------------------------
DROP TABLE IF EXISTS especialidades;
CREATE TABLE especialidades (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  nombre          VARCHAR(120) NOT NULL,
  descripcion     TEXT,
  icono           VARCHAR(80),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_esp_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  INDEX idx_esp_clinica (clinica_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. MEDICOS  (perfil profesional; vinculado a un usuario rol MEDICO)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS medicos;
CREATE TABLE medicos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id          INT NOT NULL,
  usuario_id          INT NULL,
  numero_documento    VARCHAR(40) NOT NULL,
  nombres             VARCHAR(120) NOT NULL,
  apellidos           VARCHAR(120) NOT NULL,
  registro_medico     VARCHAR(80),                -- tarjeta profesional
  telefono            VARCHAR(50),
  email               VARCHAR(150),
  foto_url            VARCHAR(500),
  biografia           TEXT,
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_medicos_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_medicos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_medicos_clinica (clinica_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. MEDICO_ESPECIALIDADES  (N:M)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS medico_especialidades;
CREATE TABLE medico_especialidades (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  medico_id         INT NOT NULL,
  especialidad_id   INT NOT NULL,
  CONSTRAINT fk_me_medico       FOREIGN KEY (medico_id)       REFERENCES medicos(id) ON DELETE CASCADE,
  CONSTRAINT fk_me_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE CASCADE,
  UNIQUE KEY uq_medico_esp (medico_id, especialidad_id),
  INDEX idx_me_medico (medico_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. SERVICIOS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS servicios;
CREATE TABLE servicios (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id          INT NOT NULL,
  especialidad_id     INT NULL,
  nombre              VARCHAR(150) NOT NULL,
  descripcion         TEXT,
  duracion_minutos    INT NOT NULL DEFAULT 30,
  precio              DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  requiere_orden      BOOLEAN NOT NULL DEFAULT FALSE,
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_serv_clinica     FOREIGN KEY (clinica_id)      REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_serv_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE SET NULL,
  INDEX idx_serv_clinica (clinica_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. SERVICIO_SEDES  (N:M)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS servicio_sedes;
CREATE TABLE servicio_sedes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  servicio_id   INT NOT NULL,
  sede_id       INT NOT NULL,
  CONSTRAINT fk_ss_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
  CONSTRAINT fk_ss_sede     FOREIGN KEY (sede_id)     REFERENCES sedes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_servicio_sede (servicio_id, sede_id),
  INDEX idx_ss_sede (sede_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. MEDICO_SERVICIOS  (N:M)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS medico_servicios;
CREATE TABLE medico_servicios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  medico_id     INT NOT NULL,
  servicio_id   INT NOT NULL,
  CONSTRAINT fk_ms_medico   FOREIGN KEY (medico_id)   REFERENCES medicos(id) ON DELETE CASCADE,
  CONSTRAINT fk_ms_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_medico_servicio (medico_id, servicio_id),
  INDEX idx_ms_servicio (servicio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. HORARIOS_MEDICOS  (disponibilidad semanal recurrente)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS horarios_medicos;
CREATE TABLE horarios_medicos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id    INT NOT NULL,
  medico_id     INT NOT NULL,
  sede_id       INT NULL,
  dia_semana    TINYINT NOT NULL,                 -- 0=Domingo ... 6=Sabado
  hora_inicio   TIME NOT NULL,
  hora_fin      TIME NOT NULL,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hm_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_hm_medico  FOREIGN KEY (medico_id)  REFERENCES medicos(id) ON DELETE CASCADE,
  CONSTRAINT fk_hm_sede    FOREIGN KEY (sede_id)    REFERENCES sedes(id) ON DELETE SET NULL,
  INDEX idx_hm_medico (medico_id),
  INDEX idx_hm_clinica (clinica_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. BLOQUEOS_AGENDA  (ausencias, vacaciones, bloqueos puntuales)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS bloqueos_agenda;
CREATE TABLE bloqueos_agenda (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id    INT NOT NULL,
  medico_id     INT NOT NULL,
  fecha_inicio  DATETIME NOT NULL,
  fecha_fin     DATETIME NOT NULL,
  motivo        VARCHAR(255),
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ba_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_ba_medico  FOREIGN KEY (medico_id)  REFERENCES medicos(id) ON DELETE CASCADE,
  INDEX idx_ba_medico (medico_id),
  INDEX idx_ba_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. CITAS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS citas;
CREATE TABLE citas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  sede_id         INT NULL,
  paciente_id     INT NOT NULL,
  medico_id       INT NOT NULL,
  servicio_id     INT NULL,
  fecha_inicio    DATETIME NOT NULL,
  fecha_fin       DATETIME NOT NULL,
  estado          ENUM('SOLICITADA','PENDIENTE_DOCUMENTOS','CONFIRMADA','EN_ESPERA','EN_ATENCION','ATENDIDA','CANCELADA','NO_ASISTIO')
                  NOT NULL DEFAULT 'SOLICITADA',
  motivo          VARCHAR(255),
  notas           TEXT,
  creado_por      INT NULL,                       -- usuario que creo la cita
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_citas_clinica  FOREIGN KEY (clinica_id)  REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_citas_sede     FOREIGN KEY (sede_id)     REFERENCES sedes(id) ON DELETE SET NULL,
  CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_citas_medico   FOREIGN KEY (medico_id)   REFERENCES medicos(id) ON DELETE CASCADE,
  CONSTRAINT fk_citas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_citas_creador  FOREIGN KEY (creado_por)  REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_citas_clinica (clinica_id),
  INDEX idx_citas_paciente (paciente_id),
  INDEX idx_citas_medico (medico_id),
  INDEX idx_citas_fecha_inicio (fecha_inicio),
  INDEX idx_citas_medico_fecha (medico_id, fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. DOCUMENTOS_PACIENTE  (solo URL/ruta, nunca el binario)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS documentos_paciente;
CREATE TABLE documentos_paciente (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  paciente_id     INT NOT NULL,
  cita_id         INT NULL,
  tipo            ENUM('ORDEN_MEDICA','AUTORIZACION','EXAMEN_PREVIO','HISTORIA_CLINICA','OTRO') NOT NULL DEFAULT 'OTRO',
  nombre_archivo  VARCHAR(255) NOT NULL,
  url             VARCHAR(500) NOT NULL,          -- ruta segura del archivo
  mime_type       VARCHAR(100),
  tamano_bytes    INT,
  subido_por      INT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_clinica  FOREIGN KEY (clinica_id)  REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_cita     FOREIGN KEY (cita_id)     REFERENCES citas(id) ON DELETE SET NULL,
  CONSTRAINT fk_doc_subido   FOREIGN KEY (subido_por)  REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_doc_clinica (clinica_id),
  INDEX idx_doc_paciente (paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 16. RESULTADOS_MEDICOS  (solo URL/ruta del resultado)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS resultados_medicos;
CREATE TABLE resultados_medicos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  paciente_id     INT NOT NULL,
  cita_id         INT NULL,
  servicio_id     INT NULL,
  titulo          VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  url             VARCHAR(500),                   -- ruta segura del resultado (PDF, imagen)
  fecha_resultado DATE,
  cargado_por     INT NULL,                       -- usuario LABORATORIO/MEDICO
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_clinica  FOREIGN KEY (clinica_id)  REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_cita     FOREIGN KEY (cita_id)     REFERENCES citas(id) ON DELETE SET NULL,
  CONSTRAINT fk_res_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_res_cargado  FOREIGN KEY (cargado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_res_clinica (clinica_id),
  INDEX idx_res_paciente (paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 17. PAGOS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS pagos;
CREATE TABLE pagos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  paciente_id     INT NOT NULL,
  cita_id         INT NULL,
  numero_factura  VARCHAR(60),
  concepto        VARCHAR(255),
  monto           DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  metodo          ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','PSE','OTRO') DEFAULT 'OTRO',
  estado          ENUM('PENDIENTE','PAGADO','ANULADO','REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
  fecha_pago      DATETIME NULL,
  registrado_por  INT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pago_clinica   FOREIGN KEY (clinica_id)     REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_pago_paciente  FOREIGN KEY (paciente_id)    REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_pago_cita      FOREIGN KEY (cita_id)        REFERENCES citas(id) ON DELETE SET NULL,
  CONSTRAINT fk_pago_registro  FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_pago_clinica (clinica_id),
  INDEX idx_pago_paciente (paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 18. PQRSF  (Peticiones, Quejas, Reclamos, Sugerencias, Felicitaciones)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS pqrsf;
CREATE TABLE pqrsf (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  paciente_id     INT NULL,                       -- puede ser anonima desde la landing
  tipo            ENUM('PETICION','QUEJA','RECLAMO','SUGERENCIA','FELICITACION') NOT NULL DEFAULT 'PETICION',
  nombre_remitente VARCHAR(150),
  email_remitente  VARCHAR(150),
  telefono_remitente VARCHAR(50),
  asunto          VARCHAR(200) NOT NULL,
  mensaje         TEXT NOT NULL,
  estado          ENUM('ABIERTA','EN_PROCESO','RESPONDIDA','CERRADA') NOT NULL DEFAULT 'ABIERTA',
  respuesta       TEXT,
  respondido_por  INT NULL,
  fecha_respuesta DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pqrsf_clinica  FOREIGN KEY (clinica_id)     REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_pqrsf_paciente FOREIGN KEY (paciente_id)    REFERENCES pacientes(id) ON DELETE SET NULL,
  CONSTRAINT fk_pqrsf_resp     FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_pqrsf_clinica (clinica_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 19. NOTIFICACIONES
-- ------------------------------------------------------------
DROP TABLE IF EXISTS notificaciones;
CREATE TABLE notificaciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  usuario_id      INT NOT NULL,
  titulo          VARCHAR(200) NOT NULL,
  mensaje         TEXT,
  tipo            VARCHAR(50) DEFAULT 'INFO',
  leida           BOOLEAN NOT NULL DEFAULT FALSE,
  url_destino     VARCHAR(500),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_notif_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 20. CONTENIDO_LANDING  (editable desde el panel admin)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS contenido_landing;
CREATE TABLE contenido_landing (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NOT NULL,
  seccion         VARCHAR(60) NOT NULL,           -- hero, servicios, sedes, contacto, etc.
  contenido       JSON NOT NULL,                  -- bloque editable en JSON
  orden           INT NOT NULL DEFAULT 0,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_landing_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE,
  UNIQUE KEY uq_landing_seccion (clinica_id, seccion),
  INDEX idx_landing_clinica (clinica_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 21. AUDITORIA  (acciones sensibles)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS auditoria;
CREATE TABLE auditoria (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  clinica_id      INT NULL,
  usuario_id      INT NULL,
  accion          VARCHAR(100) NOT NULL,          -- LOGIN, CREATE_CITA, UPDATE_PAGO, etc.
  entidad         VARCHAR(80),                    -- tabla/recurso afectado
  entidad_id      INT NULL,
  detalle         JSON NULL,                      -- payload / cambios
  ip              VARCHAR(60),
  user_agent      VARCHAR(255),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE SET NULL,
  CONSTRAINT fk_aud_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_aud_clinica (clinica_id),
  INDEX idx_aud_usuario (usuario_id),
  INDEX idx_aud_accion (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  FIN schema.sql
-- ============================================================
