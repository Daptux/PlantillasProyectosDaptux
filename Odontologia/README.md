# 🦷 OdontoAdmin Pro

Plataforma web completa para una clínica odontológica: **landing pública** para captar
pacientes y **panel administrativo** para gestionar toda la operación.

> Stack: **React + Vite + Tailwind** (frontend) · **Node.js + Express + JWT** (backend) ·
> **MySQL puro** (sin ORM).

## Estructura

```
Odontologia/
├── frontend/    # React + Vite + Tailwind (landing + panel admin)
├── backend/     # API REST Express + MySQL (mysql2) + JWT
├── database/    # schema.sql + seed.sql
└── docs/        # documentación (instalación, endpoints, roles, flujo)
```

## Inicio rápido

```bash
# 1) Base de datos
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 2) Backend
cd backend && cp .env.example .env && npm install && npm run dev   # :4000

# 3) Frontend
cd frontend && npm install && npm run dev                          # :5173
```

**Acceso al panel:** http://localhost:5173/login
- Correo: `admin@odontoadmin.com`
- Contraseña: `Admin123*`

Ver [docs/instalacion.md](docs/instalacion.md) para el detalle completo.

## Documentación
- [Requerimientos](docs/requerimientos.md)
- [Flujo de la clínica](docs/flujo-clinica.md)
- [Roles y permisos](docs/roles-permisos.md)
- [Endpoints del API](docs/endpoints.md)
- [Instalación](docs/instalacion.md)

## Personalización
El nombre, logo, teléfono, WhatsApp, dirección, horarios y colores se gestionan desde
**Panel → Contenido web → Configuración** (tabla `configuracion_clinica`), sin tocar código.
