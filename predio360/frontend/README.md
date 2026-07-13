# Frontend · Predio360

SPA sin build (HTML + CSS + JavaScript vanilla). Sin dependencias de compilación.

## Ejecutar

```bash
cd frontend
python -m http.server 5173   # o: npx serve .
```

Abre <http://localhost:5173>.

## Configuración

Edita **`js/config.js`**:

```js
window.PREDIO_CONFIG = {
  USE_MOCK: true,          // true = datos demo; false = usa backend/Supabase
  API_BASE: '',            // p.ej. 'https://predio360-api.vercel.app'
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
};
```

## Estructura

| Archivo | Rol |
|---------|-----|
| `css/styles.css` | Sistema de diseño (tema, layout, componentes, responsivo, dark mode) |
| `js/icons.js` | Iconos SVG de línea |
| `js/data.js` | Datos de demostración |
| `js/api.js` | Capa de acceso a datos (mock ↔ REST) |
| `js/ui.js` | Modales, toasts, formato, helpers |
| `js/views.js` | Vistas de cada módulo |
| `js/app.js` | Shell (sidebar/topbar), router hash, eventos globales |

## Dependencias (CDN)

- [Leaflet](https://leafletjs.com) — mapas
- [Chart.js](https://www.chartjs.org) — gráficas
- [Inter](https://fonts.google.com/specimen/Inter) — tipografía

## Deploy en Vercel

Importa `frontend/` (Root Directory = `frontend`, framework = *Other*). No requiere build command.
