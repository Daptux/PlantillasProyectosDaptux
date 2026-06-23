# Roles y permisos — OdontoAdmin Pro

El control de acceso se aplica en dos capas:
- **Backend:** middlewares `auth.middleware.js` (valida JWT) y `role.middleware.js` (valida rol).
- **Frontend:** `ProtectedRoute` y filtrado de módulos en el `Sidebar`.

> **SUPERADMIN** siempre tiene acceso total (se evalúa primero en ambos middlewares).

## Roles

| Rol | Descripción |
|-----|-------------|
| **SUPERADMIN** | Acceso total al sistema. |
| **ADMIN** | Usuarios, pacientes, citas, servicios, pagos, inventario, contenido web y reportes. |
| **RECEPCIONISTA** | Citas, pacientes, check-in, confirmaciones y pagos básicos. |
| **ODONTOLOGO** | Su agenda, atención, historia clínica, evoluciones, odontograma y planes. |
| **AUXILIAR** | Apoyo en pacientes, agenda e inventario. |
| **CAJA** | Pagos, abonos, saldos y reportes financieros. |
| **PACIENTE** | (Portal futuro) ver sus citas, pagos y documentos. |

## Matriz de acceso por módulo

| Módulo | SUPERADMIN | ADMIN | RECEPCIÓN | ODONTÓLOGO | AUXILIAR | CAJA |
|--------|:--:|:--:|:--:|:--:|:--:|:--:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Citas | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Pacientes | ✅ | ✅ | ✅ | ✅ (lectura) | ✅ | lectura |
| Odontólogos | ✅ | ✅ (CRUD) | lectura | — | lectura | — |
| Servicios | ✅ | ✅ | lectura | lectura | lectura | — |
| Historias / Evoluciones | ✅ | ✅ | — | ✅ | lectura | — |
| Odontograma | ✅ | ✅ | — | ✅ | lectura | — |
| Planes de tratamiento | ✅ | ✅ | lectura | ✅ | lectura | lectura |
| Pagos | ✅ | ✅ | ✅ | saldo | — | ✅ |
| Inventario | ✅ | ✅ | ✅ | — | ✅ | — |
| Reportes | ✅ | ✅ | — | — | — | ✅ |
| Contenido web | ✅ | ✅ | — | — | — | — |
| Usuarios | ✅ | ✅ | — | — | — | — |

> "lectura" = solo puede consultar (GET); "saldo" = solo el endpoint de saldo.
> La matriz refleja las reglas declaradas en los archivos `*.routes.js` del backend
> y en `Sidebar.jsx` del frontend. Ajusta ambos si cambias los permisos.
