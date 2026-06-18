-- ============================================================
--  CLINICA-APP  |  seed.sql
--  Datos iniciales de demostracion.
--  Importar DESPUES de schema.sql sobre la base clinica_app.
-- ============================================================
--  CREDENCIALES DEMO (texto plano -> hash bcrypt ya incluido):
--    SUPER ADMIN   : admin@clinica.com     / Admin123*
--    MEDICO        : medico@clinica.com     / Medico123*
--    PACIENTE      : paciente@clinica.com   / Paciente123*
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE auditoria;
TRUNCATE TABLE notificaciones;
TRUNCATE TABLE contenido_landing;
TRUNCATE TABLE pqrsf;
TRUNCATE TABLE pagos;
TRUNCATE TABLE resultados_medicos;
TRUNCATE TABLE documentos_paciente;
TRUNCATE TABLE citas;
TRUNCATE TABLE bloqueos_agenda;
TRUNCATE TABLE horarios_medicos;
TRUNCATE TABLE medico_servicios;
TRUNCATE TABLE servicio_sedes;
TRUNCATE TABLE servicios;
TRUNCATE TABLE medico_especialidades;
TRUNCATE TABLE medicos;
TRUNCATE TABLE especialidades;
TRUNCATE TABLE pacientes;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE roles;
TRUNCATE TABLE sedes;
TRUNCATE TABLE clinicas;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
INSERT INTO roles (id, codigo, nombre, descripcion) VALUES
  (1, 'SUPER_ADMIN',   'Super Administrador', 'Administra varias clinicas'),
  (2, 'ADMIN_CLINICA', 'Administrador Clinica', 'Administra toda la informacion de su clinica'),
  (3, 'RECEPCION',     'Recepcion', 'Gestiona pacientes, citas y documentos'),
  (4, 'MEDICO',        'Medico', 'Agenda propia y pacientes asignados'),
  (5, 'LABORATORIO',   'Laboratorio', 'Carga resultados medicos'),
  (6, 'FACTURACION',   'Facturacion', 'Gestiona pagos y facturas'),
  (7, 'PACIENTE',      'Paciente', 'Acceso a su propia informacion');

-- ------------------------------------------------------------
-- CLINICA + SEDES
-- ------------------------------------------------------------
INSERT INTO clinicas (id, nombre, nit, telefono, email, direccion) VALUES
  (1, 'Clinica Salud Vital', '900123456-7', '+57 601 7000000', 'contacto@saludvital.com', 'Av. Principal 123, Bogota');

INSERT INTO sedes (id, clinica_id, nombre, direccion, ciudad, telefono, email) VALUES
  (1, 1, 'Sede Norte',   'Calle 100 #15-20', 'Bogota', '+57 601 7000001', 'norte@saludvital.com'),
  (2, 1, 'Sede Centro',  'Carrera 7 #45-10', 'Bogota', '+57 601 7000002', 'centro@saludvital.com');

-- ------------------------------------------------------------
-- USUARIOS  (passwords hasheados con bcrypt, cost 10)
-- ------------------------------------------------------------
-- Admin123*
INSERT INTO usuarios (id, clinica_id, rol_id, nombres, apellidos, email, password_hash, telefono) VALUES
  (1, 1, 1, 'Super', 'Admin', 'admin@clinica.com', '$2b$10$a.hr17LzUWJs8TfCAniUHOALizlB4EPntyOEaMJFdya1nXnZgSZyu', '+57 3000000000');
-- Medico123*
INSERT INTO usuarios (id, clinica_id, rol_id, nombres, apellidos, email, password_hash, telefono) VALUES
  (2, 1, 4, 'Carlos', 'Ramirez', 'medico@clinica.com', '$2b$10$AJ4l1P9xegnL8wCOnrWb7O1O7e6iORW/iUEPjCqx.dMUonaQW7yI.', '+57 3000000001');
-- Paciente123*
INSERT INTO usuarios (id, clinica_id, rol_id, nombres, apellidos, email, password_hash, telefono) VALUES
  (3, 1, 7, 'Laura', 'Gomez', 'paciente@clinica.com', '$2b$10$Z.LHY3ovvcr/y4zEnGe0JuZ/mPkuwUpydQdRN1eAc4VXpatDzVd.W', '+57 3000000002');

-- ------------------------------------------------------------
-- PACIENTE vinculado al usuario 3
-- ------------------------------------------------------------
INSERT INTO pacientes (id, clinica_id, usuario_id, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, sexo, telefono, email, ciudad, eps) VALUES
  (1, 1, 3, 'CC', '1010101010', 'Laura', 'Gomez', '1995-04-12', 'F', '+57 3000000002', 'paciente@clinica.com', 'Bogota', 'Sanitas');

-- ------------------------------------------------------------
-- ESPECIALIDADES
-- ------------------------------------------------------------
INSERT INTO especialidades (id, clinica_id, nombre, descripcion, icono) VALUES
  (1, 1, 'Medicina General', 'Atencion medica general y preventiva', 'stethoscope'),
  (2, 1, 'Cardiologia', 'Diagnostico y tratamiento del corazon', 'heart-pulse'),
  (3, 1, 'Pediatria', 'Atencion medica para ninos', 'baby'),
  (4, 1, 'Dermatologia', 'Cuidado de la piel', 'scan-face');

-- ------------------------------------------------------------
-- MEDICO vinculado al usuario 2
-- ------------------------------------------------------------
INSERT INTO medicos (id, clinica_id, usuario_id, numero_documento, nombres, apellidos, registro_medico, telefono, email, biografia) VALUES
  (1, 1, 2, '2020202020', 'Carlos', 'Ramirez', 'RM-12345', '+57 3000000001', 'medico@clinica.com', 'Especialista en medicina interna con 10 anios de experiencia.');

INSERT INTO medico_especialidades (medico_id, especialidad_id) VALUES
  (1, 1), (1, 2);

-- ------------------------------------------------------------
-- SERVICIOS
-- ------------------------------------------------------------
INSERT INTO servicios (id, clinica_id, especialidad_id, nombre, descripcion, duracion_minutos, precio, requiere_orden) VALUES
  (1, 1, 1, 'Consulta Medicina General', 'Consulta de valoracion general', 30, 80000.00, FALSE),
  (2, 1, 2, 'Electrocardiograma', 'Examen cardiologico ECG', 45, 150000.00, TRUE),
  (3, 1, 3, 'Consulta Pediatrica', 'Consulta para pacientes pediatricos', 30, 90000.00, FALSE);

INSERT INTO servicio_sedes (servicio_id, sede_id) VALUES
  (1, 1), (1, 2), (2, 1), (3, 2);

INSERT INTO medico_servicios (medico_id, servicio_id) VALUES
  (1, 1), (1, 2);

-- ------------------------------------------------------------
-- HORARIOS DEL MEDICO  (Lun-Vie 08:00-12:00 en Sede Norte)
-- ------------------------------------------------------------
INSERT INTO horarios_medicos (clinica_id, medico_id, sede_id, dia_semana, hora_inicio, hora_fin) VALUES
  (1, 1, 1, 1, '08:00:00', '12:00:00'),
  (1, 1, 1, 2, '08:00:00', '12:00:00'),
  (1, 1, 1, 3, '08:00:00', '12:00:00'),
  (1, 1, 1, 4, '08:00:00', '12:00:00'),
  (1, 1, 1, 5, '08:00:00', '12:00:00');

-- ------------------------------------------------------------
-- CONTENIDO LANDING  (editable desde el panel admin)
-- ------------------------------------------------------------
INSERT INTO contenido_landing (clinica_id, seccion, contenido, orden) VALUES
  (1, 'hero', JSON_OBJECT(
      'titulo', 'Tu salud en las mejores manos',
      'subtitulo', 'Agenda tu cita en linea, consulta resultados y cuida de ti y tu familia.',
      'cta', 'Agendar cita',
      'imagen', '/assets/hero.jpg'
   ), 1),
  (1, 'contacto', JSON_OBJECT(
      'telefono', '+57 601 7000000',
      'whatsapp', '573000000000',
      'email', 'contacto@saludvital.com',
      'direccion', 'Av. Principal 123, Bogota'
   ), 2);

-- ============================================================
--  FIN seed.sql
-- ============================================================
