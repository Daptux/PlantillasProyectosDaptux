-- =====================================================================
--  OdontoAdmin Pro - Datos iniciales (seed)
--  Archivo: database/seed.sql
--  Ejecutar DESPUÉS de schema.sql
--
--  Usuario admin inicial:
--     correo:   admin@odontoadmin.com
--     password: Admin123*
--  (cambiar inmediatamente en producción)
-- =====================================================================

USE odontoadmin;

-- ---------------------------------------------------------------------
--  Roles
-- ---------------------------------------------------------------------
INSERT INTO roles (nombre, descripcion) VALUES
  ('SUPERADMIN',    'Acceso total al sistema'),
  ('ADMIN',         'Gestiona toda la operación de la clínica'),
  ('RECEPCIONISTA', 'Gestiona citas, pacientes, check-in y pagos básicos'),
  ('ODONTOLOGO',    'Atiende pacientes, historia clínica, odontograma y planes'),
  ('AUXILIAR',      'Apoya pacientes, agenda e inventario'),
  ('CAJA',          'Gestiona pagos, abonos, saldos y reportes financieros'),
  ('PACIENTE',      'Portal del paciente (futuro)');

-- ---------------------------------------------------------------------
--  Usuario administrador inicial (password: Admin123*)
-- ---------------------------------------------------------------------
INSERT INTO usuarios (rol_id, nombre, correo, password_hash, telefono, activo) VALUES
  ((SELECT id FROM roles WHERE nombre='SUPERADMIN'),
   'Administrador General',
   'admin@odontoadmin.com',
   '$2b$10$CynloLCsegs.m9sYbFHfNOXvFCG/FH2m1mFIYo7yFoKazcx5CD3h.',
   '3000000000', 1);

-- ---------------------------------------------------------------------
--  Especialidades
-- ---------------------------------------------------------------------
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Odontología General',  'Atención odontológica integral'),
  ('Ortodoncia',           'Corrección de la posición dental'),
  ('Endodoncia',           'Tratamiento de conductos'),
  ('Periodoncia',          'Tratamiento de encías'),
  ('Cirugía Oral',         'Procedimientos quirúrgicos orales'),
  ('Rehabilitación Oral',  'Prótesis y reconstrucción'),
  ('Odontopediatría',      'Atención odontológica infantil'),
  ('Estética Dental',      'Diseño de sonrisa y blanqueamiento');

-- ---------------------------------------------------------------------
--  Servicios odontológicos básicos
-- ---------------------------------------------------------------------
INSERT INTO servicios
  (nombre, categoria, descripcion_corta, descripcion_larga, precio_base, duracion_min, icono, visible_landing, activo, orden)
VALUES
  ('Odontología General', 'General',
   'Consultas, limpiezas y tratamientos preventivos.',
   'Atención integral para mantener tu salud bucal: valoración, profilaxis, detartraje y manejo de caries.',
   80000, 40, 'tooth', 1, 1, 1),
  ('Ortodoncia', 'Ortodoncia',
   'Brackets y alineadores para una sonrisa alineada.',
   'Diagnóstico ortodóntico y tratamiento con brackets metálicos, estéticos o alineadores transparentes.',
   3500000, 45, 'braces', 1, 1, 2),
  ('Diseño de Sonrisa', 'Estetica',
   'Transforma tu sonrisa con tratamientos estéticos.',
   'Planificación digital de sonrisa con carillas, resinas y armonización dental.',
   2500000, 60, 'smile', 1, 1, 3),
  ('Blanqueamiento Dental', 'Estetica',
   'Dientes más blancos en una sola sesión.',
   'Blanqueamiento profesional en consultorio y/o ambulatorio con férulas personalizadas.',
   450000, 60, 'sparkles', 1, 1, 4),
  ('Implantes Dentales', 'Cirugia',
   'Recupera tus dientes perdidos de forma permanente.',
   'Colocación de implantes de titanio con corona, devolviendo función y estética.',
   3200000, 90, 'implant', 1, 1, 5),
  ('Endodoncia', 'Endodoncia',
   'Tratamiento de conductos sin dolor.',
   'Eliminación de la pulpa dental afectada para conservar el diente natural.',
   600000, 60, 'root', 1, 1, 6),
  ('Periodoncia', 'Periodoncia',
   'Cuidado y tratamiento de las encías.',
   'Manejo de gingivitis y periodontitis, raspaje y alisado radicular.',
   350000, 50, 'gum', 1, 1, 7),
  ('Cirugía Oral', 'Cirugia',
   'Extracciones y procedimientos quirúrgicos.',
   'Exodoncias simples y complejas, cordales y cirugía oral menor.',
   250000, 60, 'scalpel', 1, 1, 8),
  ('Rehabilitación Oral', 'Rehabilitacion',
   'Prótesis fijas y removibles a tu medida.',
   'Coronas, puentes y prótesis para restaurar la función masticatoria.',
   1200000, 60, 'crown', 1, 1, 9),
  ('Odontopediatría', 'Odontopediatria',
   'Atención odontológica especializada para niños.',
   'Cuidado bucal infantil con enfoque preventivo y trato amable.',
   90000, 40, 'child', 1, 1, 10),
  ('Urgencias Odontológicas', 'Urgencias',
   'Atención inmediata para dolor o trauma dental.',
   'Manejo de dolor agudo, fracturas y urgencias odontológicas.',
   120000, 30, 'emergency', 1, 1, 11);

-- ---------------------------------------------------------------------
--  Preguntas frecuentes
-- ---------------------------------------------------------------------
INSERT INTO preguntas_frecuentes (pregunta, respuesta, orden) VALUES
  ('¿Cuánto cuesta una valoración?',
   'La valoración inicial tiene un costo accesible y en muchos casos se abona al tratamiento. Contáctanos para conocer la promoción vigente.', 1),
  ('¿Atienden urgencias?',
   'Sí, contamos con atención de urgencias odontológicas. Comunícate por WhatsApp o teléfono para una atención prioritaria.', 2),
  ('¿Puedo pagar por cuotas?',
   'Sí, ofrecemos planes de pago y financiación para que accedas a tu tratamiento de forma cómoda.', 3),
  ('¿Qué tratamientos ofrecen?',
   'Ofrecemos odontología general, ortodoncia, diseño de sonrisa, blanqueamiento, implantes, endodoncia, periodoncia, cirugía y más.', 4),
  ('¿Atienden niños?',
   'Sí, contamos con odontopediatría y un trato especial para los más pequeños.', 5),
  ('¿Cuánto dura una limpieza dental?',
   'Una limpieza dental profesional suele durar entre 30 y 45 minutos.', 6),
  ('¿Qué hago si tengo dolor de muela?',
   'Evita automedicarte y contáctanos de inmediato. El dolor puede indicar una infección que requiere atención profesional.', 7);

-- ---------------------------------------------------------------------
--  Configuración inicial de la clínica (singleton)
-- ---------------------------------------------------------------------
INSERT INTO configuracion_clinica
  (nombre_clinica, telefono, whatsapp, correo, direccion, ciudad, horarios,
   color_primario, color_secundario,
   hero_titulo, hero_subtitulo,
   stat_pacientes, stat_experiencia, stat_tratamientos, stat_calificacion)
VALUES
  ('OdontoAdmin Pro',
   '+57 300 000 0000',
   '+57 300 000 0000',
   'contacto@odontoadminpro.com',
   'Calle 123 # 45-67, Consultorio 201',
   'Bogotá',
   'Lunes a Viernes: 8:00 - 18:00 | Sábados: 8:00 - 13:00',
   '#0ea5e9', '#14b8a6',
   'Sonrisas saludables, tratamientos confiables y atención personalizada',
   'Agenda tu valoración odontológica y recibe atención profesional en un espacio moderno, cómodo y seguro.',
   '5.000+', '12 años', '15.000+', '4.9/5');

-- ---------------------------------------------------------------------
--  Testimonios de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO testimonios (nombre, comentario, calificacion, servicio) VALUES
  ('Laura Gómez', 'Excelente atención, el equipo es muy profesional y amable. ¡Quedé feliz con mi tratamiento de ortodoncia!', 5, 'Ortodoncia'),
  ('Carlos Méndez', 'Me realicé un blanqueamiento y el resultado fue increíble. Instalaciones modernas y muy limpias.', 5, 'Blanqueamiento Dental'),
  ('Ana Rodríguez', 'Llevé a mi hijo y lo trataron con mucha paciencia. Recomendado para los niños.', 5, 'Odontopediatría');

-- ---------------------------------------------------------------------
--  Proveedor de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO proveedores (nombre, contacto, telefono, correo) VALUES
  ('Dental Supply S.A.S.', 'Área Comercial', '+57 301 111 1111', 'ventas@dentalsupply.com');

-- =====================================================================
--  FIN DEL SEED
-- =====================================================================
