-- ============================================================================
-- OdontoAdmin Pro - Datos iniciales (seed)
-- ----------------------------------------------------------------------------
-- Ejecutar DESPUES de schema.sql.
-- Usuario admin inicial:
--   correo:   admin@odontoadmin.com
--   password: Admin123*     (hash bcrypt ya generado abajo)
-- ============================================================================

USE odontoadmin;

-- ----------------------------------------------------------------------------
-- ROLES
-- ----------------------------------------------------------------------------
INSERT INTO roles (nombre, descripcion) VALUES
  ('SUPERADMIN',    'Acceso total al sistema.'),
  ('ADMIN',         'Gestiona usuarios, pacientes, citas, servicios, pagos, inventario, contenido y reportes.'),
  ('RECEPCIONISTA', 'Gestiona citas, pacientes, check-in, confirmaciones y pagos básicos.'),
  ('ODONTOLOGO',    'Agenda propia, atención, historia clínica, evoluciones, odontograma y planes.'),
  ('AUXILIAR',      'Apoya gestión de pacientes, agenda e inventario.'),
  ('CAJA',          'Gestiona pagos, abonos, saldos y reportes financieros.'),
  ('PACIENTE',      'Portal del paciente: ver citas, pagos, recomendaciones y documentos.');

-- ----------------------------------------------------------------------------
-- USUARIO ADMIN INICIAL  (rol SUPERADMIN)
-- password: Admin123*
-- ----------------------------------------------------------------------------
INSERT INTO usuarios (rol_id, nombre, correo, password_hash, telefono, activo)
SELECT r.id, 'Administrador', 'admin@odontoadmin.com',
       '$2b$10$WIC3GAyapnXm6wV8urczEutlWY6E2VJAXSwtTbv.HTjmEWurmxEOm', '3000000000', 1
FROM roles r WHERE r.nombre = 'SUPERADMIN';

-- ----------------------------------------------------------------------------
-- ESPECIALIDADES
-- ----------------------------------------------------------------------------
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Odontología General',  'Diagnóstico, prevención y tratamientos básicos.'),
  ('Ortodoncia',           'Corrección de la posición dental y maloclusiones.'),
  ('Endodoncia',           'Tratamientos de conducto y patología pulpar.'),
  ('Periodoncia',          'Tratamiento de encías y tejidos de soporte.'),
  ('Rehabilitación Oral',  'Prótesis, coronas y restauración funcional.'),
  ('Cirugía Oral',         'Extracciones y procedimientos quirúrgicos.'),
  ('Odontopediatría',      'Atención odontológica infantil.'),
  ('Estética Dental',      'Diseño de sonrisa y blanqueamiento.');

-- ----------------------------------------------------------------------------
-- SERVICIOS BASICOS  (visibles en landing)
-- ----------------------------------------------------------------------------
INSERT INTO servicios (nombre, categoria, descripcion_corta, descripcion_larga, precio_base, duracion_min, icono, visible_landing, activo) VALUES
  ('Odontología general',     'General',         'Valoración, limpieza y tratamientos preventivos.', 'Atención integral para mantener tu salud bucal: diagnóstico, profilaxis, sellantes y tratamiento de caries.', 80000,  40, 'tooth',      1, 1),
  ('Ortodoncia',              'Ortodoncia',      'Brackets y alineadores para una sonrisa alineada.', 'Corrección de la posición dental con brackets metálicos, estéticos o alineadores transparentes.', 150000, 45, 'braces',     1, 1),
  ('Diseño de sonrisa',       'Estetica',        'Transforma tu sonrisa de forma armónica.', 'Planificación estética personalizada combinando carillas, blanqueamiento y contorno gingival.', 250000, 60, 'smile',      1, 1),
  ('Blanqueamiento dental',   'Estetica',        'Dientes más blancos en una sesión.', 'Blanqueamiento profesional en consultorio con resultados visibles y seguros.', 200000, 60, 'sparkles',   1, 1),
  ('Implantes dentales',      'Cirugia',         'Reemplaza dientes perdidos de forma permanente.', 'Colocación de implantes de titanio para recuperar función y estética de manera duradera.', 1800000, 90, 'implant',  1, 1),
  ('Endodoncia',              'Endodoncia',      'Tratamiento de conducto sin dolor.', 'Eliminamos la infección del nervio dental y conservamos tu diente natural.', 220000, 60, 'root',      1, 1),
  ('Periodoncia',             'Periodoncia',     'Cuidado de encías y tejidos de soporte.', 'Tratamiento de gingivitis y enfermedad periodontal para encías sanas.', 120000, 45, 'gum',        1, 1),
  ('Cirugía oral',            'Cirugia',         'Extracciones y cirugía menor.', 'Extracciones simples y quirúrgicas, incluida la de cordales, con protocolos seguros.', 130000, 50, 'scalpel',    1, 1),
  ('Rehabilitación oral',     'Rehabilitacion',  'Coronas, prótesis y restauraciones.', 'Recupera la función masticatoria con coronas, puentes y prótesis a medida.', 400000, 60, 'crown',     1, 1),
  ('Odontopediatría',         'Odontopediatria', 'Atención dental para los más pequeños.', 'Cuidado bucal infantil en un entorno amable y libre de miedo.', 90000, 40, 'child',          1, 1),
  ('Urgencias odontológicas', 'Urgencias',       'Atención inmediata ante dolor o trauma.', 'Manejo de dolor, infecciones y traumatismos dentales con prioridad de atención.', 100000, 30, 'emergency', 1, 1);

-- ----------------------------------------------------------------------------
-- PREGUNTAS FRECUENTES
-- ----------------------------------------------------------------------------
INSERT INTO preguntas_frecuentes (pregunta, respuesta, orden) VALUES
  ('¿Cuánto cuesta una valoración?', 'La valoración inicial tiene un costo accesible e incluye diagnóstico y plan de tratamiento. Consulta promociones vigentes al agendar.', 1),
  ('¿Atienden urgencias?', 'Sí. Contamos con atención prioritaria para dolor, infecciones y traumatismos dentales. Escríbenos por WhatsApp para una cita inmediata.', 2),
  ('¿Puedo pagar por cuotas?', 'Sí, ofrecemos planes de pago y financiación para la mayoría de tratamientos. Te asesoramos según tu plan.', 3),
  ('¿Qué tratamientos ofrecen?', 'Odontología general, ortodoncia, estética, implantes, endodoncia, periodoncia, cirugía, rehabilitación y odontopediatría.', 4),
  ('¿Atienden niños?', 'Sí, contamos con odontopediatría y un entorno amable diseñado para que los niños se sientan cómodos.', 5),
  ('¿Cuánto dura una limpieza dental?', 'Una limpieza profesional dura aproximadamente entre 30 y 45 minutos.', 6),
  ('¿Qué hago si tengo dolor de muela?', 'Evita automedicarte en exceso y agenda una cita de urgencia. Mientras tanto, aplica frío externo y mantén la zona limpia.', 7);

-- ----------------------------------------------------------------------------
-- TESTIMONIOS DE EJEMPLO
-- ----------------------------------------------------------------------------
INSERT INTO testimonios (nombre, comentario, calificacion, servicio, visible) VALUES
  ('María González',  'Excelente atención, me explicaron todo el tratamiento con paciencia. Mi sonrisa cambió por completo.', 5, 'Diseño de sonrisa', 1),
  ('Carlos Ramírez',  'Me atendieron una urgencia el mismo día. Muy profesionales y sin dolor.', 5, 'Urgencias odontológicas', 1),
  ('Laura Pérez',     'El mejor trato para mi hijo, ya no le da miedo el odontólogo.', 5, 'Odontopediatría', 1);

-- ----------------------------------------------------------------------------
-- PROVEEDOR DE EJEMPLO
-- ----------------------------------------------------------------------------
INSERT INTO proveedores (nombre, contacto, telefono, correo) VALUES
  ('Distribuidora Dental Andina', 'Ventas', '6011234567', 'ventas@dentalandina.com');

-- ----------------------------------------------------------------------------
-- INVENTARIO INICIAL DE EJEMPLO
-- ----------------------------------------------------------------------------
INSERT INTO inventario (nombre, categoria, descripcion, stock_actual, stock_minimo, unidad_medida, costo_unitario, proveedor_id) VALUES
  ('Guantes de nitrilo M',      'Guantes',     'Caja x100 talla M', 25, 10, 'caja',  35000, 1),
  ('Tapabocas quirúrgico',      'Tapabocas',   'Caja x50',          8,  10, 'caja',  18000, 1),
  ('Anestesia lidocaína 2%',    'Anestesia',   'Cartuchos',         60, 20, 'unidad', 1800, 1),
  ('Resina compuesta A2',       'Resinas',     'Jeringa 4g',        12, 5,  'unidad', 45000, 1),
  ('Agujas dentales cortas',    'Agujas',      'Caja x100',         5,  5,  'caja',  22000, 1);

-- ----------------------------------------------------------------------------
-- CONFIGURACION INICIAL DE LA CLINICA  (personalizable desde el panel)
-- ----------------------------------------------------------------------------
INSERT INTO configuracion_clinica (clave, valor, descripcion) VALUES
  ('nombre_clinica',   'OdontoAdmin Pro',                         'Nombre visible de la clínica.'),
  ('eslogan',          'Sonrisas saludables, tratamientos confiables y atención personalizada', 'Eslogan principal.'),
  ('logo_url',         '/assets/logo.svg',                        'Ruta del logo.'),
  ('telefono',         '+57 300 000 0000',                        'Teléfono principal.'),
  ('whatsapp',         '573000000000',                            'Número de WhatsApp (formato internacional sin +).'),
  ('correo',           'contacto@odontoadmin.com',                'Correo de contacto.'),
  ('direccion',        'Calle 123 #45-67, Bogotá, Colombia',      'Dirección física.'),
  ('horarios',         'Lun-Vie 8:00-18:00, Sáb 8:00-13:00',      'Horarios de atención.'),
  ('color_primario',   '#0EA5E9',                                 'Color primario (azul salud).'),
  ('color_secundario', '#14B8A6',                                 'Color secundario (verde agua).'),
  ('color_oscuro',     '#0F172A',                                 'Color oscuro (azul profundo).'),
  ('facebook_url',     '',                                        'URL de Facebook.'),
  ('instagram_url',    '',                                        'URL de Instagram.'),
  ('mapa_embed',       '',                                        'Iframe/URL de Google Maps embebido.');

-- ============================================================================
-- FIN DEL SEED
-- ============================================================================
