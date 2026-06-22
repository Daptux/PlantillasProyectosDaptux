# Roles y permisos — OdontoAdmin Pro

El control de acceso se aplica en dos capas:

- **Backend:** middleware `verificarToken` (JWT) + `permitirRoles(...)` por ruta.
- **Frontend:** `ProtectedRoute` + filtrado de módulos del sidebar según rol.

> **SUPERADMIN** tiene acceso total a todo, sin restricciones.

## Roles

| Rol | Descripción |
|-----|-------------|
| **SUPERADMIN** | Acceso total. |
| **ADMIN** | Gestiona usuarios, pacientes, citas, servicios, pagos, inventario, contenido web y reportes. |
| **RECEPCIONISTA** | Citas, pacientes, check-in, confirmaciones y pagos básicos. |
| **ODONTOLOGO** | Su agenda, atención de pacientes, historia clínica, evoluciones, odontograma y planes. |
| **AUXILIAR** | Apoyo en pacientes, agenda e inventario. |
| **CAJA** | Pagos, abonos, saldos y reportes financieros. |
| **PACIENTE** | Reservado para un portal futuro (ver citas, pagos, documentos). |

## Matriz de acceso por módulo

| Módulo | ADMIN | RECEPCIONISTA | ODONTOLOGO | AUXILIAR | CAJA |
|--------|:-----:|:-------------:|:----------:|:--------:|:----:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Citas | ✅ | ✅ | ✅ | ✅ | — |
| Pacientes | ✅ | ✅ | ✅ (lectura) | ✅ | — |
| Odontólogos | ✅ | — | — | — | — |
| Servicios | ✅ | — | — | — | — |
| Historias clínicas | ✅ | lectura | ✅ | lectura | — |
| Odontograma | ✅ | lectura | ✅ | lectura | — |
| Planes de tratamiento | ✅ | lectura | ✅ | — | lectura |
| Pagos | ✅ | ✅ | — | — | ✅ |
| Inventario | ✅ | lectura | lectura | ✅ | — |
| Contenido web | ✅ | — | — | — | — |
| Reportes | ✅ | — | — | — | ✅ |
| Usuarios | ✅ | — | — | — | — |

> "lectura" = puede consultar pero no modificar. La capa final de validación está en el backend (`role.middleware.js`).

## Notas de seguridad

- Las contraseñas se almacenan con **bcrypt** (hash + salt).
- Los tokens JWT expiran según `JWT_EXPIRES_IN` (por defecto 8h).
- La **historia clínica no se elimina físicamente**: las correcciones se hacen mediante nuevas evoluciones.
- Pacientes, usuarios, servicios, odontólogos e insumos usan **soft delete** (estado activo/inactivo).
- Las acciones importantes se registran en `logs_actividad`.
