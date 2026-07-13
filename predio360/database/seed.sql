-- ============================================================================
-- PREDIO360 · Datos de ejemplo (seed)
-- Ejecuta DESPUÉS de schema.sql. Espeja los datos demo del frontend.
-- ============================================================================

insert into predios (id, nombre, matricula, cedula_catastral, chip, direccion, municipio, barrio, tipo, estrato,
  propietario, naturaleza, escritura, estado, riesgo, estado_juridico, avance,
  area_terreno_jur, area_terreno_cat, area_construida_jur, area_construida_cat, avaluo_catastral, avaluo_comercial,
  destino, uso, tratamiento, pisos, frente, fondo, gravamenes, servidumbres, limitaciones, lat, lng, foto)
values
('PR-00124','Lote El Poblado 15','001-458792','05001010200030015000','05001AAA0124BBBB','Cra. 43A #7-50, El Poblado','Medellín','El Poblado','Urbano',6,
  'Inversiones Aurora S.A.S.','Propiedad privada','E.P. 3421 de 2021 - Notaría 20','Activo','bajo','Sano',92,
  480.0,478.5,1240.0,1235.0,2450000000,3980000000,'Habitacional','Residencial','Consolidación',4,16,30,1,0,0,6.2088,-75.5673,'poblado'),
('PR-00125','Bodega Industrial Guayabal','001-772104','05001010500120088000','05001AAA0125BBBB','Cl. 10 #52-14, Guayabal','Medellín','Guayabal','Urbano',3,
  'Logística del Sur Ltda.','Propiedad privada','E.P. 1180 de 2019 - Notaría 4','En estudio','medio','Con observaciones',58,
  2100.0,2065.0,1800.0,1795.0,3100000000,4200000000,'Industrial','Industrial','Renovación urbana',2,42,50,2,1,1,6.2225,-75.5920,'bodega'),
('PR-00126','Finca La Esperanza','020-118845','05266010100050022000','05266AAA0126BBBB','Vereda El Tablazo Km 4','Rionegro','Rural','Rural',0,
  'Sucesión Ramírez Gómez','Propiedad privada','E.P. 902 de 2005 - Notaría 1','Activo','alto','En litigio',35,
  42000.0,40850.0,320.0,318.0,1850000000,2600000000,'Agropecuario','Rural','Conservación',1,0,0,1,3,2,6.1554,-75.3738,'finca'),
('PR-00127','Local Comercial Laureles','001-990233','05001010900450011000','05001AAA0127BBBB','Cir. 4 #70-22, Laureles','Medellín','Laureles','Urbano',5,
  'María Fernanda Ospina','Propiedad privada','E.P. 5567 de 2023 - Notaría 12','Activo','bajo','Sano',100,
  210.0,210.0,185.0,185.0,890000000,1250000000,'Comercial','Comercial','Consolidación',2,10,21,0,0,0,6.2447,-75.5936,'local'),
('PR-00128','Urbanización Los Cerezos','005-334521','05088010300220077000','05088AAA0128BBBB','Cl. 50 #48-30','Bello','Niquía','Urbano',4,
  'Constructora Vértice S.A.','Propiedad privada','E.P. 2210 de 2022 - Notaría 2 Bello','En estudio','medio','Con observaciones',47,
  8500.0,8420.0,12400.0,12380.0,6700000000,9100000000,'Habitacional','Residencial','Desarrollo',8,60,70,3,0,1,6.3379,-75.5544,'urbanizacion')
on conflict (id) do nothing;

-- Tradición del PR-00124
insert into tradicion (predio_id, anio, acto, transfiere, adquiere, instrumento, valor) values
('PR-00124',2021,'Compraventa','Grupo Meridian S.A.','Inversiones Aurora S.A.S.','E.P. 3421 - Not. 20',3400000000),
('PR-00124',2016,'Compraventa','Constructora Del Río','Grupo Meridian S.A.','E.P. 1890 - Not. 7',2200000000),
('PR-00124',2009,'Adjudicación','Sucesión Arango','Constructora Del Río','E.P. 445 - Not. 1',980000000);

-- Hallazgos
insert into hallazgos (id, predio_id, tipo, severidad, titulo, descripcion, estado, responsable, fecha) values
('H-0091','PR-00126','Jurídico','alto','Proceso de sucesión sin liquidar','La tradición registra sucesión iniciada en 2019 sin adjudicación.','Abierto','C. Restrepo','2026-06-28'),
('H-0090','PR-00125','Catastral','medio','Diferencia de área terreno (-35 m²)','Área catastral 2065 m² vs. jurídica 2100 m².','En gestión','L. Muñoz','2026-06-25'),
('H-0089','PR-00128','Urbanístico','medio','Índice de ocupación excede norma POT','IO 0.72 supera el 0.65 permitido.','Abierto','J. Herrera','2026-06-22'),
('H-0088','PR-00126','Ambiental','alto','Afectación por ronda hídrica','Parte del predio en retiro de quebrada (POMCA).','Abierto','A. Vélez','2026-06-20')
on conflict (id) do nothing;

-- Actuaciones
insert into actuaciones (id, predio_id, tipo, titulo, estado, responsable, fecha) values
('AC-0442','PR-00124','Concepto','Concepto técnico de viabilidad','Finalizada','J. Herrera','2026-07-02'),
('AC-0441','PR-00126','Visita','Visita de inspección predial','Programada','A. Vélez','2026-07-15'),
('AC-0440','PR-00125','Oficio','Oficio a gestor catastral','En trámite','L. Muñoz','2026-07-01')
on conflict (id) do nothing;

-- Documentos (metadatos)
insert into documentos (predio_id, nombre, tipo, categoria, origen, peso, fecha) values
('PR-00124','Certificado de Tradición y Libertad','pdf','Jurídico','ORIP','1.2 MB','2026-06-30'),
('PR-00124','Escritura Pública 3421','pdf','Jurídico','Notaría 20','3.4 MB','2021-05-14'),
('PR-00124','Plano Predial Catastral','dwg','Cartografía','IGAC','890 KB','2025-11-02');
