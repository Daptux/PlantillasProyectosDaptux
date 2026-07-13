# Predio360

**Plataforma integral para la gestión jurídica, catastral y urbanística de bienes inmuebles.**

Predio360 convierte cada predio en un **expediente digital único** que concentra su información jurídica, catastral, urbanística, documental, cartográfica y técnica, reemplazando el manejo disperso en Excel, carpetas físicas, PDF y SIG desconectados.

> Plantilla base para proyectos Daptux — profesional, 100% responsiva, interactiva y funcional desde el primer momento.

---

## Tabla de contenido

- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Inicio rápido (local)](#inicio-rápido-local)
- [Despliegue en Vercel + Supabase](#despliegue-en-vercel--supabase)
- [Módulos](#módulos)
- [Sistema de diseño](#sistema-de-diseño)
- [API REST](#api-rest)

---

## Arquitectura

| Capa | Tecnología | Deploy |
|------|-----------|--------|
| **Frontend** | HTML + CSS + JavaScript (SPA sin build), Leaflet, Chart.js | Vercel (estático) |
| **Backend** | Node.js (funciones serverless), API REST | Vercel |
| **Base de datos** | PostgreSQL + Supabase (Auth, Storage, RLS) | Supabase |
| **Mapas** | Leaflet + OpenStreetMap / CARTO / ArcGIS | — |
| **IA** | OpenAI (conectable) | — |

El frontend funciona **100% con datos de demostración** (mock) sin necesidad de backend. Cuando configuras Supabase/Backend, la capa de datos (`frontend/js/api.js`) cambia de origen de forma transparente.

---

## Estructura del proyecto

```
predio360/
├── frontend/               # SPA — deploy en Vercel (estático)
│   ├── index.html
│   ├── vercel.json
│   ├── assets/             # logo, favicon
│   ├── css/styles.css      # sistema de diseño completo
│   └── js/
│       ├── config.js       # ← conmutador mock / Supabase / backend
│       ├── icons.js        # librería de iconos SVG (sin emojis)
│       ├── data.js         # datos de demostración
│       ├── api.js          # capa de acceso a datos
│       ├── ui.js           # modales, toasts, formato
│       ├── views.js        # vistas de cada módulo
│       └── app.js          # shell + router
│
├── backend/                # API REST Node.js — deploy en Vercel
│   ├── package.json
│   ├── vercel.json
│   ├── .env.example
│   ├── lib/                # supabase, http, demo
│   └── api/                # endpoints serverless
│       ├── health.js
│       ├── dashboard.js
│       ├── hallazgos.js
│       ├── actuaciones.js
│       └── predios/
│           ├── index.js    # GET (listar) · POST (crear)
│           └── [id].js     # GET · PUT · DELETE
│
├── database/               # Supabase / PostgreSQL
│   ├── schema.sql          # tablas, enums, índices, triggers, vistas
│   ├── policies.sql        # Row Level Security
│   └── seed.sql            # datos de ejemplo
│
└── README.md
```

---

## Inicio rápido (local)

El frontend no requiere instalación ni build. Sirve la carpeta `frontend/` con cualquier servidor estático:

```bash
cd frontend

# Opción A — Python
python -m http.server 5173

# Opción B — Node
npx serve .
```

Abre <http://localhost:5173>. Verás la plataforma completa con datos de demostración.

> Abrir `index.html` con doble clic también funciona, aunque se recomienda un servidor local para que los mapas y las fuentes carguen correctamente.

---

## Despliegue en Vercel + Supabase

### 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta en orden:
   - `database/schema.sql`
   - `database/policies.sql`
   - `database/seed.sql` *(opcional, datos de ejemplo)*
3. Copia de **Project Settings → API**: `Project URL`, `anon key` y `service_role key`.

### 2. Backend (Vercel)

1. Importa la carpeta `backend/` como proyecto en Vercel (Root Directory = `backend`).
2. En **Environment Variables** agrega:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGIN` = URL del frontend
   - `OPENAI_API_KEY` *(opcional)*
3. Deploy. Verifica en `https://tu-backend.vercel.app/api/health`.

### 3. Frontend (Vercel)

1. Importa la carpeta `frontend/` como proyecto (Root Directory = `frontend`, framework = *Other*).
2. Edita `frontend/js/config.js`:
   ```js
   USE_MOCK: false,
   API_BASE: 'https://tu-backend.vercel.app',
   // o acceso directo a Supabase:
   SUPABASE_URL: 'https://xxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJ...'
   ```
3. Deploy.

---

## Módulos

- **Dashboard Ejecutivo** — KPIs, gráficas, semáforo de riesgos, mapa y actividad.
- **Gestión de Predios** — inventario, filtros y expediente digital por predio.
- **Módulo Jurídico** — matrícula, tradición, gravámenes, servidumbres, estado jurídico.
- **Módulo Catastral** — cédula catastral, áreas, avalúo y comparación jurídica vs. catastral.
- **Módulo Urbanístico** — uso del suelo, tratamiento POT, índices, afectaciones y riesgos.
- **Módulo GIS** — mapa interactivo con capas (predios, catastro, vías, riesgo, POT, hídrico).
- **Gestión Documental** — PDF, Word, Excel, DWG, SHP, imágenes por predio.
- **Hallazgos** — jurídicos, catastrales, urbanísticos, ambientales y sociales.
- **Actuaciones** — visitas, conceptos, oficios, resoluciones, licencias, seguimiento.
- **Reportes** — fichas prediales, conceptos técnicos, informes PDF/Excel.
- **Inteligencia Artificial** — lectura de escrituras y certificados, comparación documental y generación de hallazgos, conceptos y estudios.

---

## Sistema de diseño

| Token | Valor | Uso |
|-------|-------|-----|
| Azul oscuro | `#0A2540` | Sidebar, encabezados, marca |
| Azul | `#1E7DD1` | Acciones primarias |
| Azul claro | `#2E9BE6` | Acentos, gráficas |
| Blanco | `#FFFFFF` | Superficies |
| Verde / Ámbar / Rojo | semáforo | Estados de riesgo |

- Tipografía **Inter**. Iconos **SVG de línea** (sin emojis).
- Modo **claro/oscuro** conmutable. Layout **100% responsivo** (sidebar colapsable + drawer móvil).
- Componentes: KPIs, tablas con filtros, badges/semáforos, modales, toasts, timeline, mapas y gráficas.

---

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado del servicio |
| `GET` | `/api/dashboard` | Indicadores agregados |
| `GET` `POST` | `/api/predios` | Listar / crear predios |
| `GET` `PUT` `DELETE` | `/api/predios/:id` | Detalle / actualizar / eliminar |
| `GET` `POST` | `/api/hallazgos` | Listar / crear hallazgos |
| `GET` `POST` | `/api/actuaciones` | Listar / crear actuaciones |

La API responde con datos demo si Supabase no está configurado, para pruebas inmediatas.

---

## Roadmap

- **Fase 1 (incluida):** MVP · registro de predios · dashboard · GIS · reportes.
- **Fase 2:** historial, alertas, indicadores, comparación automática.
- **Fase 3:** IA avanzada, integraciones (VUR, IGAC, ORIP), app móvil, SaaS multiempresa.

---

© Daptux · Plantilla Predio360 · v1.0.0
