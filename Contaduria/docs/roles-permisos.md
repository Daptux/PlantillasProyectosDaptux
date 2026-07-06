# Roles y permisos

## Roles

| Rol             | Acceso al panel | Alcance de datos                          |
|-----------------|-----------------|-------------------------------------------|
| **Superadmin**  | Total (SaaS)    | Todas las firmas (soporte controlado)     |
| **Contador**    | Completo        | Su firma completa                         |
| **Auxiliar**    | Operativo       | Clientes asignados de su firma            |
| **Revisor**     | Revision        | Su firma (lectura + aprobaciones/cierres) |
| **Cliente externo** | Sin panel   | Solo su link `/subir/[token]`             |

## Matriz de permisos (`lib/permissions.ts`)

Formato `modulo:accion`. `modulo:*` cubre todas las acciones del modulo; `*` cubre todo.

### Superadmin
- `*` (todo)

### Contador principal
- `clients:*`, `users:*`, `documents:*`, `requests:*`, `tasks:*`,
  `checklists:*`, `deadlines:*`, `reports:*`, `obligations:*`,
  `templates:*`, `settings:*`
- `audit:read`, `dashboard:read`, `notifications:read`

### Auxiliar contable
- `clients:read`
- `documents:read`, `documents:create`, `documents:comment`
- `requests:read`, `requests:create`
- `tasks:read`, `tasks:update`
- `checklists:read`, `checklists:update`
- `deadlines:read`, `dashboard:read`, `notifications:read`

### Revisor / Auditor
- `clients:read`
- `documents:read`, `documents:approve`, `documents:reject`, `documents:comment`
- `checklists:read`, `checklists:close`
- `reports:read`, `audit:read`, `dashboard:read`, `notifications:read`

## Reglas de negocio

- Un contador solo ve informacion de **su** firma.
- Un auxiliar solo ve **clientes asignados**.
- El cliente externo nunca ve el dashboard ni datos internos: solo el formulario del link seguro.
- Los links publicos tienen **token unico**, pueden **expirar** y pueden **desactivarse**.
- No se elimina fisicamente: se usa **soft delete** (estado `inactive`/`cancelada`).
- Toda accion critica genera **auditoria**.
