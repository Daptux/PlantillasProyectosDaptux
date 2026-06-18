# Hotelería App

Sistema de gestión hotelera con 3 roles: **ADMIN**, **EMPLEADO**, **CLIENTE**.

- **Backend:** Node.js + Express + MySQL + JWT + bcryptjs
- **Frontend:** React + Vite + Axios + React Router
- **Base de datos:** MySQL (`hoteleria_db`)

## Estructura

```
Hoteleria_v2/
├── backend/        API REST (Express)
├── frontend/       SPA (React + Vite)
└── database/       schema.sql, seed.sql, migracion.sql
```

## 1. Base de datos

En phpMyAdmin / MySQL Workbench:

- **Instalación nueva:** ejecuta `database/schema.sql` y luego `database/seed.sql`.
- **BD existente:** ejecuta `database/migracion.sql` (solo agrega lo nuevo).

## 2. Backend

```bash
cd backend
npm install
npm run create-admin     # crea admin@hoteleria.com / Admin123*
npm run dev              # http://localhost:3000
```

Variables en `backend/.env` (DB y JWT).

## 3. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

La URL del API se configura en `frontend/.env` (`VITE_API_URL`).

## Credenciales de prueba (seed)

| Rol | Email | Password |
|-----|-------|----------|
| ADMIN | admin@hoteleria.com | Admin123* |
| CLIENTE | cliente1@test.com | Cliente123* |

## Pruebas Postman

Importa `backend/postman_collection.json`.

## Permisos por rol

| Recurso | ADMIN | EMPLEADO | CLIENTE |
|---------|:-----:|:--------:|:-------:|
| Dashboard | ✅ | ✅ | ❌ |
| Empleados | ✅ | ❌ | ❌ |
| Clientes | ✅ | ✅ | ❌ |
| Habitaciones | ✅ (todo) | ✅ (gestión) | 👁 disponibles |
| Reservas | ✅ todas | ✅ todas | 👁 propias |
| Pagos | ✅ | ✅ | ❌ |
