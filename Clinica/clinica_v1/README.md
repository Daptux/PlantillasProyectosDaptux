# 🏥 clinica-app

Plataforma web completa para clínicas: landing pública, portal del paciente, panel
administrativo, panel médico, API backend y base de datos **MySQL puro** (sin ORM).

## Stack

| Capa      | Tecnologías |
|-----------|-------------|
| Frontend  | React · Vite · TypeScript · Tailwind CSS · shadcn/ui (estilo) · React Router · Axios · TanStack Query · React Hook Form · Zod · Lucide React |
| Backend   | Node.js · Express · TypeScript · **mysql2/promise** · JWT · Bcrypt · Zod · Multer · Helmet · CORS · Morgan · Dotenv |
| Base datos| MySQL 8 / MariaDB (XAMPP + phpMyAdmin) — `database/schema.sql` y `database/seed.sql` |

## Estructura

```
clinica-app/
├── frontend/    # React + Vite + TS
├── backend/     # Express + TS + mysql2
├── database/    # schema.sql + seed.sql
└── docs/        # documentación técnica
```

## Puesta en marcha rápida

> Requisitos: Node 18+ y MySQL corriendo (XAMPP).

### 1) Base de datos

**Opción A — phpMyAdmin / MySQL Workbench:**
```sql
CREATE DATABASE clinica_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinica_app;
```
Luego importa `database/schema.sql` y después `database/seed.sql`.

**Opción B — script automático (usa mysql2, no requiere cliente mysql):**
```bash
cd backend
cp .env.example .env      # ajusta credenciales si tu MySQL tiene password
npm install
node scripts/db-setup.mjs
```

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000  (healthcheck: /api/health)
```

### 3) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

## Credenciales demo

| Rol         | Email                  | Password       |
|-------------|------------------------|----------------|
| SUPER_ADMIN | admin@clinica.com      | `Admin123*`    |
| MEDICO      | medico@clinica.com     | `Medico123*`   |
| PACIENTE    | paciente@clinica.com   | `Paciente123*` |

## Estado de esta entrega (entrega 1)

✅ Arquitectura limpia (MVC) · ✅ MySQL con mysql2/promise · ✅ Auth completa (login,
registro paciente, /me) con JWT + Bcrypt · ✅ Middlewares (auth, role, error, upload,
audit) · ✅ Rutas protegidas y por rol · ✅ Auditoría · ✅ Frontend conectado (landing,
login, registro, dashboards admin/médico/paciente).

🔜 **Próxima entrega:** módulos de citas (calendario), documentos, resultados, pagos,
PQRSF, gestión de usuarios y edición de landing.

Más detalle en [`docs/`](./docs/).
