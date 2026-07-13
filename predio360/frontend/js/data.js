/* PREDIO360 · Datos de demostración (mock)
   Se usan cuando no hay backend/Supabase configurado (config.js -> USE_MOCK = true).
   Estructura compatible con las tablas definidas en /database/schema.sql */
window.DB = (function () {
  const municipios = ['Medellín', 'Bello', 'Envigado', 'Itagüí', 'Sabaneta', 'Rionegro', 'La Estrella'];
  const usos = ['Residencial', 'Comercial', 'Industrial', 'Dotacional', 'Mixto', 'Rural'];
  const tratamientos = ['Consolidación', 'Renovación urbana', 'Desarrollo', 'Conservación', 'Mejoramiento integral'];
  const destinos = ['Habitacional', 'Comercial', 'Lote', 'Industrial', 'Institucional', 'Agropecuario'];

  const predios = [
    {
      id: 'PR-00124', matricula: '001-458792', cedulaCatastral: '05001010200030015000',
      nombre: 'Lote El Poblado 15', direccion: 'Cra. 43A #7-50, El Poblado', municipio: 'Medellín',
      barrio: 'El Poblado', estado: 'Activo', riesgo: 'bajo', avance: 92,
      propietario: 'Inversiones Aurora S.A.S.', tipo: 'Urbano', estrato: 6,
      areaTerrenoJur: 480.0, areaTerrenoCat: 478.5, areaConstruidaJur: 1240.0, areaConstruidaCat: 1235.0,
      avaluoCatastral: 2450000000, avaluoComercial: 3980000000, lat: 6.2088, lng: -75.5673,
      uso: 'Residencial', tratamiento: 'Consolidación', destino: 'Habitacional', estadoJuridico: 'Sano',
      pisos: 4, frente: 16, fondo: 30, foto: 'poblado',
      gravamenes: 1, servidumbres: 0, limitaciones: 0,
      naturaleza: 'Propiedad privada', chip: '05001AAA0124BBBB', escritura: 'E.P. 3421 de 2021 - Notaría 20',
    },
    {
      id: 'PR-00125', matricula: '001-772104', cedulaCatastral: '05001010500120088000',
      nombre: 'Bodega Industrial Guayabal', direccion: 'Cl. 10 #52-14, Guayabal', municipio: 'Medellín',
      barrio: 'Guayabal', estado: 'En estudio', riesgo: 'medio', avance: 58,
      propietario: 'Logística del Sur Ltda.', tipo: 'Urbano', estrato: 3,
      areaTerrenoJur: 2100.0, areaTerrenoCat: 2065.0, areaConstruidaJur: 1800.0, areaConstruidaCat: 1795.0,
      avaluoCatastral: 3100000000, avaluoComercial: 4200000000, lat: 6.2225, lng: -75.5920,
      uso: 'Industrial', tratamiento: 'Renovación urbana', destino: 'Industrial', estadoJuridico: 'Con observaciones',
      pisos: 2, frente: 42, fondo: 50, foto: 'bodega',
      gravamenes: 2, servidumbres: 1, limitaciones: 1,
      naturaleza: 'Propiedad privada', chip: '05001AAA0125BBBB', escritura: 'E.P. 1180 de 2019 - Notaría 4',
    },
    {
      id: 'PR-00126', matricula: '020-118845', cedulaCatastral: '05266010100050022000',
      nombre: 'Finca La Esperanza', direccion: 'Vereda El Tablazo Km 4', municipio: 'Rionegro',
      barrio: 'Rural', estado: 'Activo', riesgo: 'alto', avance: 35,
      propietario: 'Sucesión Ramírez Gómez', tipo: 'Rural', estrato: 0,
      areaTerrenoJur: 42000.0, areaTerrenoCat: 40850.0, areaConstruidaJur: 320.0, areaConstruidaCat: 318.0,
      avaluoCatastral: 1850000000, avaluoComercial: 2600000000, lat: 6.1554, lng: -75.3738,
      uso: 'Rural', tratamiento: 'Conservación', destino: 'Agropecuario', estadoJuridico: 'En litigio',
      pisos: 1, frente: 0, fondo: 0, foto: 'finca',
      gravamenes: 1, servidumbres: 3, limitaciones: 2,
      naturaleza: 'Propiedad privada', chip: '05266AAA0126BBBB', escritura: 'E.P. 902 de 2005 - Notaría 1',
    },
    {
      id: 'PR-00127', matricula: '001-990233', cedulaCatastral: '05001010900450011000',
      nombre: 'Local Comercial Laureles', direccion: 'Cir. 4 #70-22, Laureles', municipio: 'Medellín',
      barrio: 'Laureles', estado: 'Activo', riesgo: 'bajo', avance: 100,
      propietario: 'María Fernanda Ospina', tipo: 'Urbano', estrato: 5,
      areaTerrenoJur: 210.0, areaTerrenoCat: 210.0, areaConstruidaJur: 185.0, areaConstruidaCat: 185.0,
      avaluoCatastral: 890000000, avaluoComercial: 1250000000, lat: 6.2447, lng: -75.5936,
      uso: 'Comercial', tratamiento: 'Consolidación', destino: 'Comercial', estadoJuridico: 'Sano',
      pisos: 2, frente: 10, fondo: 21, foto: 'local',
      gravamenes: 0, servidumbres: 0, limitaciones: 0,
      naturaleza: 'Propiedad privada', chip: '05001AAA0127BBBB', escritura: 'E.P. 5567 de 2023 - Notaría 12',
    },
    {
      id: 'PR-00128', matricula: '005-334521', cedulaCatastral: '05088010300220077000',
      nombre: 'Urbanización Los Cerezos', direccion: 'Cl. 50 #48-30', municipio: 'Bello',
      barrio: 'Niquía', estado: 'En estudio', riesgo: 'medio', avance: 47,
      propietario: 'Constructora Vértice S.A.', tipo: 'Urbano', estrato: 4,
      areaTerrenoJur: 8500.0, areaTerrenoCat: 8420.0, areaConstruidaJur: 12400.0, areaConstruidaCat: 12380.0,
      avaluoCatastral: 6700000000, avaluoComercial: 9100000000, lat: 6.3379, lng: -75.5544,
      uso: 'Residencial', tratamiento: 'Desarrollo', destino: 'Habitacional', estadoJuridico: 'Con observaciones',
      pisos: 8, frente: 60, fondo: 70, foto: 'urbanizacion',
      gravamenes: 3, servidumbres: 0, limitaciones: 1,
      naturaleza: 'Propiedad privada', chip: '05088AAA0128BBBB', escritura: 'E.P. 2210 de 2022 - Notaría 2 Bello',
    },
    {
      id: 'PR-00129', matricula: '001-556780', cedulaCatastral: '05001011200990004000',
      nombre: 'Predio Institucional Belén', direccion: 'Cra. 76 #30-15, Belén', municipio: 'Medellín',
      barrio: 'Belén', estado: 'Activo', riesgo: 'bajo', avance: 78,
      propietario: 'Municipio de Medellín', tipo: 'Urbano', estrato: 4,
      areaTerrenoJur: 3200.0, areaTerrenoCat: 3200.0, areaConstruidaJur: 2100.0, areaConstruidaCat: 2100.0,
      avaluoCatastral: 4100000000, avaluoComercial: 5300000000, lat: 6.2308, lng: -75.6055,
      uso: 'Dotacional', tratamiento: 'Consolidación', destino: 'Institucional', estadoJuridico: 'Sano',
      pisos: 3, frente: 40, fondo: 80, foto: 'institucional',
      gravamenes: 0, servidumbres: 1, limitaciones: 0,
      naturaleza: 'Bien fiscal', chip: '05001AAA0129BBBB', escritura: 'E.P. 780 de 2010 - Notaría 18',
    },
    {
      id: 'PR-00130', matricula: '012-201456', cedulaCatastral: '05360010700330019000',
      nombre: 'Lote Comercial Itagüí', direccion: 'Cra. 50A #37-20', municipio: 'Itagüí',
      barrio: 'Centro', estado: 'Archivado', riesgo: 'medio', avance: 63,
      propietario: 'Comercializadora El Faro S.A.S.', tipo: 'Urbano', estrato: 3,
      areaTerrenoJur: 640.0, areaTerrenoCat: 655.0, areaConstruidaJur: 0, areaConstruidaCat: 0,
      avaluoCatastral: 1200000000, avaluoComercial: 1700000000, lat: 6.1719, lng: -75.6110,
      uso: 'Comercial', tratamiento: 'Renovación urbana', destino: 'Lote', estadoJuridico: 'Con observaciones',
      pisos: 0, frente: 20, fondo: 32, foto: 'lote',
      gravamenes: 1, servidumbres: 0, limitaciones: 1,
      naturaleza: 'Propiedad privada', chip: '05360AAA0130BBBB', escritura: 'E.P. 3390 de 2018 - Notaría 1 Itagüí',
    },
    {
      id: 'PR-00131', matricula: '001-667201', cedulaCatastral: '05001010100010001000',
      nombre: 'Edificio Envigado Central', direccion: 'Cl. 38 Sur #43-12', municipio: 'Envigado',
      barrio: 'El Dorado', estado: 'Activo', riesgo: 'bajo', avance: 88,
      propietario: 'Propiedad Horizontal Envigado Central', tipo: 'Urbano', estrato: 5,
      areaTerrenoJur: 1150.0, areaTerrenoCat: 1150.0, areaConstruidaJur: 5600.0, areaConstruidaCat: 5590.0,
      avaluoCatastral: 8200000000, avaluoComercial: 11000000000, lat: 6.1665, lng: -75.5828,
      uso: 'Mixto', tratamiento: 'Consolidación', destino: 'Habitacional', estadoJuridico: 'Sano',
      pisos: 12, frente: 30, fondo: 38, foto: 'edificio',
      gravamenes: 1, servidumbres: 0, limitaciones: 0,
      naturaleza: 'Propiedad horizontal', chip: '05266AAA0131BBBB', escritura: 'E.P. 4102 de 2020 - Notaría 3 Envigado',
    },
  ];

  const hallazgos = [
    { id: 'H-0091', predio: 'PR-00126', predioNombre: 'Finca La Esperanza', tipo: 'Jurídico', severidad: 'alto', titulo: 'Proceso de sucesión sin liquidar', desc: 'La tradición registra sucesión iniciada en 2019 sin adjudicación. Riesgo sobre la titularidad.', estado: 'Abierto', responsable: 'C. Restrepo', fecha: '2026-06-28' },
    { id: 'H-0090', predio: 'PR-00125', predioNombre: 'Bodega Industrial Guayabal', tipo: 'Catastral', severidad: 'medio', titulo: 'Diferencia de área terreno (-35 m²)', desc: 'Área catastral 2065 m² vs. jurídica 2100 m². Requiere conciliación con gestor catastral.', estado: 'En gestión', responsable: 'L. Muñoz', fecha: '2026-06-25' },
    { id: 'H-0089', predio: 'PR-00128', predioNombre: 'Urbanización Los Cerezos', tipo: 'Urbanístico', severidad: 'medio', titulo: 'Índice de ocupación excede norma POT', desc: 'IO calculado 0.72 supera el 0.65 permitido en tratamiento de desarrollo.', estado: 'Abierto', responsable: 'J. Herrera', fecha: '2026-06-22' },
    { id: 'H-0088', predio: 'PR-00126', predioNombre: 'Finca La Esperanza', tipo: 'Ambiental', severidad: 'alto', titulo: 'Afectación por ronda hídrica', desc: 'Parte del predio se localiza en retiro de quebrada según cartografía POMCA.', estado: 'Abierto', responsable: 'A. Vélez', fecha: '2026-06-20' },
    { id: 'H-0087', predio: 'PR-00130', predioNombre: 'Lote Comercial Itagüí', tipo: 'Catastral', severidad: 'bajo', titulo: 'Diferencia menor de área (+15 m²)', desc: 'Área catastral 655 m² vs. jurídica 640 m². Dentro de tolerancia.', estado: 'Cerrado', responsable: 'L. Muñoz', fecha: '2026-06-15' },
    { id: 'H-0086', predio: 'PR-00125', predioNombre: 'Bodega Industrial Guayabal', tipo: 'Jurídico', severidad: 'medio', titulo: 'Hipoteca abierta vigente', desc: 'Gravamen hipotecario a favor de entidad financiera sin cancelación registrada.', estado: 'En gestión', responsable: 'C. Restrepo', fecha: '2026-06-12' },
    { id: 'H-0085', predio: 'PR-00128', predioNombre: 'Urbanización Los Cerezos', tipo: 'Social', severidad: 'bajo', titulo: 'Ocupación informal en lindero norte', desc: 'Se identifican mejoras de terceros en franja del lindero. Requiere caracterización.', estado: 'Abierto', responsable: 'A. Vélez', fecha: '2026-06-08' },
  ];

  const actuaciones = [
    { id: 'AC-0442', predio: 'PR-00124', predioNombre: 'Lote El Poblado 15', tipo: 'Concepto', titulo: 'Concepto técnico de viabilidad', estado: 'Finalizada', responsable: 'J. Herrera', fecha: '2026-07-02' },
    { id: 'AC-0441', predio: 'PR-00126', predioNombre: 'Finca La Esperanza', tipo: 'Visita', titulo: 'Visita de inspección predial', estado: 'Programada', responsable: 'A. Vélez', fecha: '2026-07-15' },
    { id: 'AC-0440', predio: 'PR-00125', predioNombre: 'Bodega Industrial Guayabal', tipo: 'Oficio', titulo: 'Oficio a gestor catastral', estado: 'En trámite', responsable: 'L. Muñoz', fecha: '2026-07-01' },
    { id: 'AC-0439', predio: 'PR-00128', predioNombre: 'Urbanización Los Cerezos', tipo: 'Resolución', titulo: 'Resolución de ajuste urbanístico', estado: 'En trámite', responsable: 'J. Herrera', fecha: '2026-06-30' },
    { id: 'AC-0438', predio: 'PR-00127', predioNombre: 'Local Comercial Laureles', tipo: 'Licencia', titulo: 'Licencia de construcción - reforma', estado: 'Finalizada', responsable: 'Curaduría 2', fecha: '2026-06-18' },
    { id: 'AC-0437', predio: 'PR-00131', predioNombre: 'Edificio Envigado Central', tipo: 'Seguimiento', titulo: 'Seguimiento a obligaciones urbanísticas', estado: 'Programada', responsable: 'J. Herrera', fecha: '2026-07-20' },
  ];

  const documentos = [
    { id: 'D-1', predio: 'PR-00124', nombre: 'Certificado de Tradición y Libertad', tipo: 'pdf', peso: '1.2 MB', fecha: '2026-06-30', origen: 'ORIP' },
    { id: 'D-2', predio: 'PR-00124', nombre: 'Escritura Pública 3421', tipo: 'pdf', peso: '3.4 MB', fecha: '2021-05-14', origen: 'Notaría 20' },
    { id: 'D-3', predio: 'PR-00124', nombre: 'Plano Predial Catastral', tipo: 'dwg', peso: '890 KB', fecha: '2025-11-02', origen: 'IGAC' },
    { id: 'D-4', predio: 'PR-00124', nombre: 'Levantamiento Topográfico', tipo: 'shp', peso: '2.1 MB', fecha: '2026-01-20', origen: 'Consultor' },
    { id: 'D-5', predio: 'PR-00124', nombre: 'Ficha Catastral', tipo: 'xls', peso: '210 KB', fecha: '2026-02-10', origen: 'Gestor Catastral' },
    { id: 'D-6', predio: 'PR-00124', nombre: 'Concepto Jurídico Preliminar', tipo: 'doc', peso: '540 KB', fecha: '2026-06-10', origen: 'Predio360' },
    { id: 'D-7', predio: 'PR-00124', nombre: 'Registro Fotográfico Fachada', tipo: 'img', peso: '4.8 MB', fecha: '2026-06-28', origen: 'Visita' },
    { id: 'D-8', predio: 'PR-00124', nombre: 'Certificado de Uso del Suelo', tipo: 'pdf', peso: '760 KB', fecha: '2026-05-22', origen: 'Curaduría' },
  ];

  const tradicion = [
    { anio: '2021', acto: 'Compraventa', de: 'Grupo Meridian S.A.', a: 'Inversiones Aurora S.A.S.', esc: 'E.P. 3421 - Not. 20', valor: 3400000000 },
    { anio: '2016', acto: 'Compraventa', de: 'Constructora Del Río', a: 'Grupo Meridian S.A.', esc: 'E.P. 1890 - Not. 7', valor: 2200000000 },
    { anio: '2009', acto: 'Adjudicación', de: 'Sucesión Arango', a: 'Constructora Del Río', esc: 'E.P. 445 - Not. 1', valor: 980000000 },
    { anio: '2001', acto: 'Englobe', de: 'Varios', a: 'Sucesión Arango', esc: 'E.P. 220 - Not. 3', valor: 0 },
  ];

  const notificaciones = [
    { ic: 'alert', tone: 'red', texto: '<b>Nuevo hallazgo alto</b> en Finca La Esperanza (ronda hídrica)', hace: 'Hace 12 min' },
    { ic: 'fileCheck', tone: 'green', texto: '<b>Certificado de Tradición</b> cargado en PR-00124', hace: 'Hace 1 h' },
    { ic: 'compare', tone: 'amber', texto: '<b>Diferencia de área</b> detectada en Bodega Guayabal', hace: 'Hace 3 h' },
    { ic: 'clipboard', tone: 'blue', texto: '<b>Visita programada</b> para el 15 de julio', hace: 'Hace 5 h' },
    { ic: 'cpu', tone: 'blue', texto: '<b>IA</b> finalizó análisis de 3 escrituras', hace: 'Ayer' },
  ];

  const actividad = [
    { ic: 'plus', tone: 'blue', texto: '<b>Ana Vélez</b> registró el predio <b>PR-00131</b>', hace: 'Hace 20 min' },
    { ic: 'cpu', tone: 'navy', texto: '<b>IA</b> generó concepto automático para <b>PR-00124</b>', hace: 'Hace 1 h' },
    { ic: 'alert', tone: 'red', texto: '<b>Carlos Restrepo</b> abrió hallazgo <b>H-0091</b>', hace: 'Hace 2 h' },
    { ic: 'upload', tone: 'green', texto: '<b>Laura Muñoz</b> cargó 4 documentos en <b>PR-00125</b>', hace: 'Hace 4 h' },
    { ic: 'check', tone: 'green', texto: '<b>Julián Herrera</b> cerró la actuación <b>AC-0438</b>', hace: 'Ayer' },
    { ic: 'edit', tone: 'amber', texto: '<b>Sistema</b> actualizó avalúo catastral de <b>PR-00128</b>', hace: 'Ayer' },
  ];

  // Series para gráficas
  const charts = {
    prediosPorMes: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'], data: [42, 58, 71, 63, 88, 104, 124] },
    hallazgosPorMes: { nuevos: [12, 18, 9, 22, 15, 19, 14], cerrados: [8, 14, 11, 16, 18, 12, 20] },
    porUso: { labels: usos, data: [38, 21, 12, 9, 14, 6] },
    porRiesgo: { labels: ['Bajo', 'Medio', 'Alto'], data: [58, 27, 15] },
    avaluos: { labels: ['El Poblado', 'Laureles', 'Envigado', 'Belén', 'Guayabal', 'Rionegro'], data: [3980, 1250, 11000, 5300, 4200, 2600] },
  };

  const kpis = [
    { key: 'predios', label: 'Predios registrados', val: '1,248', trend: '+8.2%', dir: 'up', ic: 'building', tone: 'blue' },
    { key: 'expedientes', label: 'Expedientes completos', val: '842', trend: '+12%', dir: 'up', ic: 'fileCheck', tone: 'green' },
    { key: 'hallazgos', label: 'Hallazgos abiertos', val: '37', trend: '-5.1%', dir: 'down', ic: 'alert', tone: 'amber' },
    { key: 'avaluo', label: 'Avalúo total gestionado', val: '$1.4 B', trend: '+3.4%', dir: 'up', ic: 'coins', tone: 'navy' },
  ];

  const capas = [
    { id: 'predios', nombre: 'Predios', color: '#1E7DD1', on: true },
    { id: 'catastro', nombre: 'Catastro', color: '#2E9BE6', on: true },
    { id: 'vias', nombre: 'Vías', color: '#7E93A8', on: true },
    { id: 'equipamientos', nombre: 'Equipamientos', color: '#16A34A', on: false },
    { id: 'riesgo', nombre: 'Amenaza y riesgo', color: '#DC2626', on: false },
    { id: 'pot', nombre: 'Tratamientos POT', color: '#E8A317', on: false },
    { id: 'hidrico', nombre: 'Red hídrica', color: '#16A9B8', on: false },
  ];

  function predioById(id) { return predios.find(p => p.id === id); }

  return {
    predios, hallazgos, actuaciones, documentos, tradicion,
    notificaciones, actividad, charts, kpis, capas,
    municipios, usos, tratamientos, destinos, predioById,
  };
})();
