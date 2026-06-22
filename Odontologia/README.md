# 🦷 OdontoAdmin Pro

Plataforma completa para clínicas odontológicas: **landing pública** para captar pacientes
y **panel administrativo** para gestionar toda la operación de la clínica.

> Nombre temporal: **OdontoAdmin Pro**. La marca (nombre, logo, colores, teléfono,
> WhatsApp, dirección) es configurable desde el panel → *Contenido web → Configuración*.

## ✨ Características

**Web pública**
- Hero, servicios, equipo, galería, testimonios, proceso de atención, FAQ y contacto.
- Reserva de citas en línea + botón de WhatsApp.
- Todo el contenido es editable desde el panel.

**Panel administrativo**
- Dashboard con métricas y agenda del día.
- Gestión de citas (con estados y validación de agenda), pacientes, odontólogos y servicios.
- Historia clínica + evoluciones, odontograma visual, planes de tratamiento con presupuesto.
- Pagos, abonos y saldos. Inventario con movimientos y alertas.
- Reportes, seguimiento de pacientes y gestión de usuarios con roles.

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js, Express, MySQL (mysql2, **sin ORM**), JWT, bcrypt |
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Base de datos | MySQL 8+ (InnoDB, utf8mb4) |

## 📁 Estructura

```
Odontologia/
├── backend/      → API REST (Express + MySQL)
│   └── src/ → config, controllers, routes, middlewares, utils
├── frontend/     → SPA (React + Vite + Tailwind)
│   └── src/ → pages (public/auth/admin), components, layouts, services, context, routes
├── database/     → schema.sql + seed.sql
└── docs/         → instalacion, endpoints, roles-permisos, flujo-clinica, requerimientos
```

## 🚀 Inicio rápido

```bash
# 1) Base de datos
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 2) Backend
cd backend && npm install && cp .env.example .env   # edita .env
npm run dev                                          # http://localhost:4000

# 3) Frontend
cd frontend && npm install && npm run dev            # http://localhost:5173
```

**Acceso inicial:** `admin@odontoadmin.com` / `Admin123*`

📖 Detalles completos en [`docs/instalacion.md`](docs/instalacion.md).

## 📚 Documentación

- [Instalación y ejecución](docs/instalacion.md)
- [Endpoints de la API + pruebas en Postman](docs/endpoints.md)
- [Roles y permisos](docs/roles-permisos.md)
- [Flujo de la clínica](docs/flujo-clinica.md)
- [Requerimientos](docs/requerimientos.md)

## 🔐 Roles

SUPERADMIN · ADMIN · RECEPCIONISTA · ODONTOLOGO · AUXILIAR · CAJA · PACIENTE (futuro)

Ver la matriz de permisos en [`docs/roles-permisos.md`](docs/roles-permisos.md).
