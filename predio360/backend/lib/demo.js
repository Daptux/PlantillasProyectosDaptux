/* Datos de respaldo cuando aún no hay Supabase configurado.
   Permite que la API responda "out of the box" para pruebas. */
export const demoPredios = [
  { id: 'PR-00124', matricula: '001-458792', nombre: 'Lote El Poblado 15', direccion: 'Cra. 43A #7-50', municipio: 'Medellín', uso: 'Residencial', riesgo: 'bajo', estado: 'Activo', avaluo_comercial: 3980000000, lat: 6.2088, lng: -75.5673 },
  { id: 'PR-00125', matricula: '001-772104', nombre: 'Bodega Industrial Guayabal', direccion: 'Cl. 10 #52-14', municipio: 'Medellín', uso: 'Industrial', riesgo: 'medio', estado: 'En estudio', avaluo_comercial: 4200000000, lat: 6.2225, lng: -75.5920 },
  { id: 'PR-00126', matricula: '020-118845', nombre: 'Finca La Esperanza', direccion: 'Vereda El Tablazo Km 4', municipio: 'Rionegro', uso: 'Rural', riesgo: 'alto', estado: 'Activo', avaluo_comercial: 2600000000, lat: 6.1554, lng: -75.3738 },
];

export const demoHallazgos = [
  { id: 'H-0091', predio: 'PR-00126', tipo: 'Jurídico', severidad: 'alto', titulo: 'Proceso de sucesión sin liquidar', estado: 'Abierto' },
  { id: 'H-0090', predio: 'PR-00125', tipo: 'Catastral', severidad: 'medio', titulo: 'Diferencia de área terreno', estado: 'En gestión' },
];

export const demoActuaciones = [
  { id: 'AC-0442', predio: 'PR-00124', tipo: 'Concepto', titulo: 'Concepto técnico de viabilidad', estado: 'Finalizada' },
];

export const demoDashboard = {
  kpis: [
    { key: 'predios', label: 'Predios registrados', val: '1,248' },
    { key: 'expedientes', label: 'Expedientes completos', val: '842' },
    { key: 'hallazgos', label: 'Hallazgos abiertos', val: '37' },
    { key: 'avaluo', label: 'Avalúo total gestionado', val: '$1.4 B' },
  ],
};
