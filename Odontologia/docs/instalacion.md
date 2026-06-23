# Instalación y ejecución — OdontoAdmin Pro

## Requisitos
- Node.js 18+ y npm
- MySQL 8+ (o MariaDB 10.5+)

## 1. Base de datos
Desde una terminal con el cliente `mysql` disponible:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Esto crea la base `odontoadmin`, todas las tablas y carga datos iniciales:
- Usuario administrador
  - **Correo:** `admin@odontoadmin.com`
  - **Contraseña:** `Admin123*`
- Roles, especialidades, servicios, FAQs, testimonios, inventario y configuración.

## 2. Backend
```bash
cd backend
cp .env.example .env        # En Windows PowerShell: Copy-Item .env.example .env
# Edita .env con tu usuario/clave de MySQL y un JWT_SECRET propio
npm install
npm run dev                 # arranca en http://localhost:4000
```

Verifica que responda: `GET http://localhost:4000/api/health`

## 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # arranca en http://localhost:5173
```

El frontend usa un proxy de Vite: las llamadas a `/api` se redirigen automáticamente
a `http://localhost:4000`, por lo que no necesitas configurar CORS en desarrollo.

## 4. Acceso
- **Landing pública:** http://localhost:5173/
- **Panel administrativo:** http://localhost:5173/login
  (ingresa con el usuario admin del seed)

## Variables de entorno (backend/.env)
| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del API (4000) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Conexión MySQL |
| `JWT_SECRET` | Secreto para firmar los tokens (cámbialo) |
| `JWT_EXPIRES_IN` | Duración del token (ej. `8h`) |
| `CORS_ORIGIN` | Origen permitido del frontend |

## Build de producción del frontend
```bash
cd frontend
npm run build      # genera dist/
npm run preview    # previsualiza el build
```
