# 📦 Guía de instalación

## Requisitos

- **Node.js 18+** y **npm**
- **MySQL 5.7+ / MariaDB 10.4+** (XAMPP incluye MariaDB y funciona perfecto)
- Git (opcional)

---

## 1. Clonar / ubicar el proyecto

```
boutique-ecommerce/
├── frontend/
├── backend/
├── database/
└── docs/
```

---

## 2. Crear la base de datos

### Opción A — Línea de comandos

Con MySQL/XAMPP corriendo:

```bash
cd database

# Windows + XAMPP  (el flag utf8mb4 evita que las tildes/ñ se corrompan)
"C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 < schema.sql
"C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 < seed.sql

# Linux / Mac / MySQL en PATH
mysql -u root --default-character-set=utf8mb4 < schema.sql
mysql -u root --default-character-set=utf8mb4 < seed.sql
```

Si tu `root` tiene contraseña, agrega `-p` y escríbela cuando la pida.

> ⚠️ Si importas **sin** `--default-character-set=utf8mb4` en Windows, las tildes pueden guardarse
> mal (verás cosas como `algod├│n`). Si te pasó, vuelve a importar con el flag.

### Opción B — phpMyAdmin

1. Abre `http://localhost/phpmyadmin`.
2. Importa primero `schema.sql` y luego `seed.sql`.

`schema.sql` ya crea la base `boutique_ecommerce` (la elimina si existía).

---

## 3. Backend

```bash
cd backend
npm install
```

Crea el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

Contenido de `.env` (ajusta `DB_PASSWORD` si tu MySQL tiene contraseña):

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=boutique_ecommerce
DB_PORT=3306
JWT_SECRET=super_secret_key_change_this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Arranca el servidor:

```bash
npm run dev      # modo watch
# o
npm start
```

Deberías ver:

```
✅ MySQL conectado -> boutique_ecommerce@localhost:3306
🚀 API escuchando en http://localhost:4000
```

Verifica: `http://localhost:4000/api/health` → `{"ok":true,"service":"boutique-api"}`

---

## 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

`.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_UPLOADS_URL=http://localhost:4000/uploads
```

Arranca:

```bash
npm run dev
```

Abre **http://localhost:5173**.

---

## 5. Probar

Inicia sesión con un usuario de prueba (ver README). El admin/empleado entra al panel en `/admin`.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` / no conecta MySQL | Verifica que MySQL/XAMPP esté activo y que `.env` tenga el puerto correcto (XAMPP usa 3306). |
| `ER_ACCESS_DENIED` | Revisa `DB_USER`/`DB_PASSWORD` en `.env`. |
| Puerto 4000 ocupado | Cambia `PORT` en `.env` o cierra el proceso que lo usa. |
| CORS bloqueado | Asegúrate de que `FRONTEND_URL` coincida con la URL del frontend. |
| Imágenes subidas no se ven | Confirma `VITE_UPLOADS_URL` y que la carpeta `backend/src/uploads` exista. |

---

## Build de producción

```bash
# Frontend
cd frontend && npm run build   # genera dist/

# Backend
cd backend && npm start
```

Sirve el contenido de `frontend/dist` con cualquier servidor estático (o detrás de Nginx) apuntando la API a tu backend.
