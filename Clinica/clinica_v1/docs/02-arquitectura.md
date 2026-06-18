# Arquitectura

## Backend (MVC + servicios)

```
routes  →  middlewares (auth/role)  →  controller  →  validation (Zod)  →  service  →  MySQL (mysql2)
                                                                   ↘ audit (acciones sensibles)
```

- **routes/**: definen endpoints y aplican middlewares (`authenticate`, `authorize`, `upload`).
- **controllers/**: parsean/validan entrada (Zod), llaman al servicio y devuelven respuesta uniforme.
- **services/**: lógica de negocio + acceso a datos con **consultas preparadas** (`pool.execute(sql, [params])`).
- **middlewares/**: `auth` (JWT), `role`, `error` (global + Zod + MySQL), `upload` (Multer), `audit`.
- **utils/**: `jwt`, `password` (bcrypt), `response` (JSON uniforme), `dates`.
- **config/**: `env` (variables) y `db` (pool mysql2/promise).

### Respuesta JSON uniforme
```json
{ "success": true, "message": "OK", "data": { } }
{ "success": false, "message": "Error", "errors": null }
```

### Seguridad
- JWT en header `Authorization: Bearer <token>`.
- Passwords con **bcrypt** (cost 10).
- **Consultas preparadas** con `?` (anti SQL-injection).
- Multi-tenant: el payload del JWT lleva `clinicaId`; toda consulta sensible debe filtrar por `clinica_id`.
- `helmet`, `cors` (restringido a `FRONTEND_URL`), `morgan`.

## Frontend

```
main.tsx → App (QueryClient + BrowserRouter + AuthProvider) → AppRoutes
```

- **services/api.ts**: instancia Axios central; interceptores inyectan el JWT y manejan 401.
- **context/AuthContext**: estado global de sesión (`user`, `login`, `logout`, restauración con `/me`).
- **routes/**: `ProtectedRoute` (sesión) y `RoleRoute` (rol). `AppRoutes` mapea layouts y páginas.
- **components/layout**: `PublicLayout` (navbar + footer + WhatsApp) y `DashboardLayout` (sidebar por rol).
- **components/ui**: primitivas estilo shadcn (`button`, `input`, `card`, `badge`) con `cn()`.

## Roles y permisos

| Rol           | Alcance |
|---------------|---------|
| SUPER_ADMIN   | Varias clínicas |
| ADMIN_CLINICA | Toda su clínica |
| RECEPCION     | Pacientes, citas, documentos |
| MEDICO        | Su agenda y pacientes asignados |
| LABORATORIO   | Carga resultados |
| FACTURACION   | Pagos y facturas |
| PACIENTE      | Solo su propia información |

## Endpoints (entrega actual)

| Estado | Endpoint |
|--------|----------|
| ✅ | `POST /api/auth/login` |
| ✅ | `POST /api/auth/register-patient` |
| ✅ | `GET /api/auth/me` |
| ✅ | `GET /api/health` |
| 🔜 (501) | `/api/users`, `/api/clinics`, `/api/patients`, `/api/doctors`, `/api/services`, `/api/appointments`, `/api/documents`, `/api/results`, `/api/payments`, `/api/pqrsf`, `/api/landing`, `/api/dashboard` |

Las rutas 🔜 ya existen con su middleware de auth/rol y devuelven `501` hasta su
implementación en la siguiente entrega.
