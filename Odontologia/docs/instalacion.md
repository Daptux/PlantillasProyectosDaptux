# Instalación y ejecución — OdontoAdmin Pro

Sistema administrativo para clínica odontológica con landing pública y panel administrativo.

## Stack

- **Backend:** Node.js + Express + MySQL (mysql2, sin ORM) + JWT
- **Frontend:** React + Vite + Tailwind CSS + Axios + React Router
- **Base de datos:** MySQL 8+ (InnoDB, utf8mb4)

## Requisitos previos

- Node.js 18+ y npm
- MySQL Server 8+ corriendo localmente

---

## 1. Base de datos

Crea el esquema y carga los datos iniciales:

```bash
# Desde la carpeta del proyecto
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Esto crea la base de datos `odontoadmin` con todas las tablas y datos de ejemplo.

**Usuario administrador inicial:**
- Correo: `admin@odontoadmin.com`
- Contraseña: `Admin123*`

> ⚠️ Cambia esta contraseña en producción desde el módulo **Usuarios**.

---

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env       # En Windows: copy .env.example .env
```

Edita `.env` con tus credenciales de MySQL y un `JWT_SECRET` seguro:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=odontoadmin
JWT_SECRET=una_cadena_larga_y_aleatoria
CORS_ORIGIN=http://localhost:5173
```

Arranca el servidor:

```bash
npm run dev      # con nodemon (desarrollo)
# o
npm start        # producción
```

La API quedará en `http://localhost:4000`. Verifica con `GET http://localhost:4000/api/health`.

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La web quedará en `http://localhost:5173`.

- Landing pública: `http://localhost:5173/`
- Panel admin: `http://localhost:5173/login`

> El frontend usa un **proxy de Vite** (`/api` → `http://localhost:4000`), por lo que no necesitas configurar variables de entorno en desarrollo.

### Build de producción

```bash
cd frontend
npm run build      # genera dist/
npm run preview    # previsualiza el build
```

En producción, sirve la carpeta `dist/` con tu servidor estático y ajusta el proxy/baseURL hacia el backend.

---

## Estructura del proyecto

```
Odontologia/
├── backend/      → API REST (Express + MySQL)
├── frontend/     → SPA (React + Vite + Tailwind)
├── database/     → schema.sql y seed.sql
└── docs/         → documentación
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` al iniciar backend | Verifica que MySQL esté corriendo y las credenciales en `.env`. |
| `Access denied for user` | Revisa `DB_USER` / `DB_PASSWORD`. |
| 401 en el panel | El token expiró: vuelve a iniciar sesión. |
| CORS en producción | Ajusta `CORS_ORIGIN` en el `.env` del backend. |
