/* PREDIO360 · Configuración de entorno
   -------------------------------------------------------------
   La plantilla funciona 100% con datos mock (USE_MOCK = true).
   Para conectar a Supabase / backend:
     1. Pon USE_MOCK = false
     2. Completa SUPABASE_URL y SUPABASE_ANON_KEY  (deploy Supabase)
        y/o API_BASE (backend Node en Vercel).
   En Vercel puedes inyectar estos valores en build o dejarlos aquí. */
window.PREDIO_CONFIG = {
  APP_NAME: 'Predio360',
  VERSION: '1.0.0',
  USE_MOCK: true,

  // Backend Node (Vercel serverless) — ej: 'https://predio360-api.vercel.app'
  API_BASE: '',

  // Supabase (opcional, acceso directo desde el frontend)
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Integraciones externas (solo referencia UI)
  INTEGRACIONES: ['VUR', 'IGAC', 'ORIP', 'ArcGIS', 'Google Maps', 'OpenStreetMap', 'OpenAI'],
  MAPA_CENTRO: [6.2442, -75.5812], // Medellín
  MAPA_ZOOM: 12,
};
