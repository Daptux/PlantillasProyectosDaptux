# 🔐 Roles y permisos

El sistema maneja 3 roles, almacenados en la tabla `roles` y asignados a cada usuario vía `users.rol_id`.

| ID | Rol | Descripción |
|----|-----|-------------|
| 1 | `ADMIN` | Dueño / administrador. Acceso total. |
| 2 | `EMPLOYEE` | Empleado. Acceso operativo limitado. |
| 3 | `CUSTOMER` | Cliente de la tienda. |

La autorización se aplica en el backend mediante dos middlewares:

- `authRequired` → valida el JWT y carga `req.user`.
- `requireRole(...roles)` → restringe por rol. Atajos: `adminOnly` (solo ADMIN) y `staffOnly` (ADMIN o EMPLOYEE).

En el frontend se refuerza con `<ProtectedRoute>` y `<RoleRoute roles={[...]}>`, además de ocultar opciones del sidebar según el rol.

---

## 1. ADMIN / Dueño

Acceso total. Puede:

- Ver el dashboard general y **todos los reportes** (incluye ingresos y mejores clientes).
- Crear, editar y eliminar **productos**, **variantes** e **imágenes**.
- Gestionar **categorías** y **marcas**.
- Gestionar **inventario** (entradas, salidas, ajustes).
- Ver y cambiar estado de **todos los pedidos** y su estado de pago.
- Ver **clientes**, activarlos/desactivarlos y ver su historial.
- Crear, editar y desactivar **empleados** (nunca con rol de dueño).
- Crear y gestionar **cupones** y **banners**.
- Configurar los **datos de la tienda** (nombre, contacto, redes, costo de envío).

## 2. EMPLOYEE / Empleado

Acceso operativo. Puede:

- Ver el **dashboard** (operativo).
- Ver **pedidos** y **cambiar su estado** (atenderlos).
- Ver **productos**.
- Actualizar **stock / inventario** (movimientos).
- Ver **clientes** (solo lectura).

**No puede:**

- Crear/editar/eliminar productos, categorías, marcas, cupones, banners.
- Crear ni gestionar **otros empleados**.
- Acceder a **configuración** de la tienda ni a reportes financieros sensibles.

## 3. CUSTOMER / Cliente

Puede:

- Registrarse e iniciar sesión.
- Navegar y **filtrar** el catálogo, ver detalles.
- Agregar a **carrito** y **favoritos**.
- **Comprar** (checkout) y generar pedidos.
- Ver **su** historial de pedidos y el estado de cada uno.
- Editar su **perfil**.

Un cliente **solo** puede ver y modificar su propia información (carrito, pedidos, favoritos, perfil).

---

## Matriz resumida

| Recurso / acción | ADMIN | EMPLOYEE | CUSTOMER |
|------------------|:-----:|:--------:|:--------:|
| Tienda / catálogo (lectura) | ✅ | ✅ | ✅ |
| Carrito / favoritos / checkout | – | – | ✅ |
| Pedidos propios | – | – | ✅ |
| Ver todos los pedidos | ✅ | ✅ | – |
| Cambiar estado de pedido / pago | ✅ | ✅ | – |
| Inventario / stock | ✅ | ✅ | – |
| CRUD productos / variantes | ✅ | – | – |
| CRUD categorías / marcas | ✅ | – | – |
| CRUD cupones / banners | ✅ | – | – |
| Gestionar clientes | ✅ | ver | – |
| Gestionar empleados | ✅ | – | – |
| Reportes (ventas, clientes top) | ✅ | dashboard/básicos | – |
| Configuración de tienda | ✅ | – | – |

---

## Reglas de seguridad clave

- Las contraseñas se almacenan cifradas con **bcrypt** (cost 10) y **nunca** se devuelven en las respuestas.
- Los tokens **JWT** expiran (`JWT_EXPIRES_IN`, por defecto 7 días).
- Las rutas administrativas viven bajo `/api/admin/...` y exigen `authRequired` + rol.
- El endpoint de creación de empleados fuerza el rol `EMPLOYEE`: un empleado **no** puede escalar a dueño.
- Validación de datos de entrada y manejo de errores global centralizado.
