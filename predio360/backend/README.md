# Backend · Predio360 (Node.js serverless + Supabase)

API REST desplegable en Vercel como funciones serverless.

## Requisitos

- Node.js 18+
- Cuenta de Supabase (opcional para pruebas: la API responde con datos demo sin base de datos)

## Desarrollo local

```bash
cd backend
npm install
cp .env.example .env.local   # completa tus credenciales
npx vercel dev               # levanta las funciones en http://localhost:3000
```

Prueba: `curl http://localhost:3000/api/health`

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `SUPABASE_URL` | sí* | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | sí* | Service role key (solo backend) |
| `CORS_ORIGIN` | recomendada | Dominio del frontend (evita `*` en producción) |
| `OPENAI_API_KEY` | opcional | Módulo de IA |
| `JWT_SECRET` | opcional | Auth propia |

\* Sin ellas, la API funciona en **modo demo** (datos de `lib/demo.js`).

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado y modo (supabase/demo) |
| `GET` | `/api/dashboard` | Indicadores agregados |
| `GET` `POST` | `/api/predios` | Listar / crear |
| `GET` `PUT` `DELETE` | `/api/predios/[id]` | Detalle / actualizar / eliminar |
| `GET` `POST` | `/api/hallazgos` | Listar / crear (filtro `?predio=`) |
| `GET` `POST` | `/api/actuaciones` | Listar / crear (filtro `?predio=`) |

## Deploy en Vercel

1. Importa este directorio (`backend/`) como proyecto — Root Directory = `backend`.
2. Configura las variables de entorno.
3. Deploy. Las rutas quedan bajo `https://<tu-backend>.vercel.app/api/*`.
