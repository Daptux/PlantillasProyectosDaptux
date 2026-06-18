# Guía de instalación y prueba

## Requisitos
- Node.js 18+ (probado con Node 22)
- XAMPP con MySQL/MariaDB en ejecución
- (Opcional) Postman o Thunder Client

---

## Paso 1 — Crear la base de datos

### Con phpMyAdmin
1. Abre phpMyAdmin (`http://localhost/phpmyadmin`).
2. Pestaña **SQL** y ejecuta:
   ```sql
   CREATE DATABASE clinica_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE clinica_app;
   ```
3. Selecciona la base `clinica_app` → **Importar** → sube `database/schema.sql` → Continuar.
4. Repite **Importar** con `database/seed.sql`.

### Alternativa por script (recomendada en local)
```bash
cd backend
cp .env.example .env
npm install
node scripts/db-setup.mjs
```
Esto crea la base e importa schema + seed automáticamente usando `mysql2`.

---

## Paso 2 — Backend
```bash
cd backend
cp .env.example .env       # revisa DB_PASSWORD (XAMPP suele ser vacío)
npm install
npm run dev
```
- API: `http://localhost:4000`
- Healthcheck: `http://localhost:4000/api/health`

Variables `.env`:
```
PORT=4000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=clinica_app
JWT_SECRET=cambiar_este_secret
JWT_EXPIRES_IN=1d
```

---

## Paso 3 — Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
- App: `http://localhost:5173`

Variables `.env`:
```
VITE_API_URL=http://localhost:4000/api
VITE_WHATSAPP_NUMBER=573000000000
```

---

## Paso 4 — Probar en el navegador
1. Abre `http://localhost:5173` → landing pública.
2. Clic en **Iniciar sesión** → entra con `admin@clinica.com` / `Admin123*` → panel admin.
3. Cierra sesión y entra como `paciente@clinica.com` / `Paciente123*` → portal paciente.
4. Prueba **Registrarse** para crear un paciente nuevo.

---

## Paso 5 — Probar en Postman
Importa `docs/clinica-app.postman_collection.json` o usa estos ejemplos:

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"Admin123*"}'

# Usuario autenticado (sustituye TOKEN)
curl http://localhost:4000/api/auth/me -H "Authorization: Bearer TOKEN"

# Registro de paciente
curl -X POST http://localhost:4000/api/auth/register-patient \
  -H "Content-Type: application/json" \
  -d '{"nombres":"Ana","apellidos":"Lopez","email":"ana@test.com","password":"Ana12345","numero_documento":"5556667778"}'
```

Respuestas esperadas:
- Login OK → `200` con `token` + `user`.
- `/me` sin token → `401`.
- Acceso a `/api/users` con rol PACIENTE → `403`.
- Email duplicado en registro → `409`.
- Datos inválidos → `422` con detalle de campos.
- Módulos aún no implementados → `501` (stub).
