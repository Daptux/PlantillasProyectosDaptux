# 📡 Endpoints de la API

Base URL: `http://localhost:4000/api`

Autenticación: header `Authorization: Bearer <token>`.

Leyenda de acceso: 🌐 público · 👤 autenticado · 🛠️ ADMIN+EMPLOYEE · 👑 solo ADMIN.

---

## Auth

| Método | Ruta | Acceso | Descripción |
|--------|------|:------:|-------------|
| POST | `/auth/register` | 🌐 | Registro de cliente |
| POST | `/auth/login` | 🌐 | Inicio de sesión (devuelve `user` + `token`) |
| GET | `/auth/profile` | 👤 | Perfil + direcciones |
| PUT | `/auth/profile` | 👤 | Actualizar perfil (incluye cambio de contraseña) |

## Productos

| Método | Ruta | Acceso | Descripción |
|--------|------|:------:|-------------|
| GET | `/products` | 🌐 | Listado con filtros y paginación |
| GET | `/products/meta/filters` | 🌐 | Opciones de filtros (tallas, colores, precio) |
| GET | `/products/:id` | 🌐 | Detalle (acepta id o slug) + imágenes, variantes, relacionados |
| POST | `/products` | 👑 | Crear producto |
| PUT | `/products/:id` | 👑 | Editar producto |
| DELETE | `/products/:id` | 👑 | Eliminar (soft delete) |
| POST | `/products/:id/images` | 👑 | Subir imágenes (multipart `images`) |
| DELETE | `/products/images/:imageId` | 👑 | Eliminar imagen |
| POST | `/products/:id/variants` | 👑 | Crear variante |
| PUT | `/products/variants/:variantId` | 👑 | Editar variante |
| DELETE | `/products/variants/:variantId` | 👑 | Eliminar variante |

**Query params de `/products`:** `search, categoria, marca, genero, talla, color, precio_min, precio_max, oferta, destacado, nuevo, coleccion, sort, page, limit, incluir_inactivos`.
`sort`: `recientes | precio_asc | precio_desc | vendidos | destacados`.

## Categorías y Marcas

| Método | Ruta | Acceso |
|--------|------|:------:|
| GET | `/categories` | 🌐 |
| POST/PUT/DELETE | `/categories(/:id)` | 👑 |
| GET | `/brands` | 🌐 |
| POST/PUT/DELETE | `/brands(/:id)` | 👑 |

## Carrito  (👤)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/cart` | Carrito del usuario |
| POST | `/cart/items` | Agregar `{product_id, variant_id, cantidad}` |
| PUT | `/cart/items/:id` | Cambiar cantidad |
| DELETE | `/cart/items/:id` | Quitar item |
| DELETE | `/cart/clear` | Vaciar carrito |

## Favoritos  (👤)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/favorites` | Lista de productos favoritos |
| GET | `/favorites/ids` | IDs de productos favoritos |
| POST | `/favorites/:productId` | Alternar favorito |

## Pedidos

| Método | Ruta | Acceso | Descripción |
|--------|------|:------:|-------------|
| POST | `/orders` | 👤 | Crear pedido desde el carrito |
| GET | `/orders/my-orders` | 👤 | Mis pedidos |
| GET | `/orders/:id` | 👤 | Detalle (cliente: solo el suyo) |
| GET | `/admin/orders` | 🛠️ | Todos los pedidos (filtros) |
| PUT | `/admin/orders/:id/status` | 🛠️ | Cambiar estado del pedido |
| PUT | `/admin/orders/:id/payment-status` | 🛠️ | Cambiar estado de pago |

**Estados de pedido:** `PENDIENTE, CONFIRMADO, PREPARANDO, ENVIADO, ENTREGADO, CANCELADO`.
**Estados de pago:** `PENDIENTE, PAGADO, RECHAZADO, REEMBOLSADO`.
El inventario se descuenta al pasar a `CONFIRMADO` y se reintegra al `CANCELADO`.

## Cupones

| Método | Ruta | Acceso |
|--------|------|:------:|
| POST | `/coupons/validate` | 👤 |
| GET/POST/PUT/DELETE | `/admin/coupons(/:id)` | 👑 |

## Usuarios y Empleados

| Método | Ruta | Acceso | Descripción |
|--------|------|:------:|-------------|
| GET | `/admin/users` | 🛠️ | Clientes (filtros) |
| GET | `/admin/users/:id` | 🛠️ | Detalle + historial de compras |
| PUT | `/admin/users/:id` | 👑 | Editar / activar / desactivar |
| DELETE | `/admin/users/:id` | 👑 | Eliminar (soft delete) |
| GET | `/admin/employees` | 👑 | Listar empleados |
| POST | `/admin/employees` | 👑 | Crear empleado |
| PUT | `/admin/employees/:id` | 👑 | Editar empleado |
| DELETE | `/admin/employees/:id` | 👑 | Eliminar empleado |

## Inventario  (🛠️)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/inventory` | Stock por variante |
| GET | `/admin/inventory/low-stock` | Variantes bajo stock |
| GET | `/admin/inventory/movements` | Historial de movimientos |
| POST | `/admin/inventory/movement` | Registrar `{variant_id, tipo, cantidad, motivo}` |

## Banners

| Método | Ruta | Acceso |
|--------|------|:------:|
| GET | `/banners` | 🌐 (solo activos) |
| GET/POST/PUT/DELETE | `/admin/banners(/:id)` | 👑 |

## Reportes

| Método | Ruta | Acceso | Descripción |
|--------|------|:------:|-------------|
| GET | `/admin/reports/dashboard` | 🛠️ | KPIs, últimos pedidos, top productos |
| GET | `/admin/reports/sales` | 👑 | Ventas por mes y por estado (rango de fechas) |
| GET | `/admin/reports/best-products` | 🛠️ | Productos más vendidos |
| GET | `/admin/reports/low-stock` | 🛠️ | Productos con bajo stock |
| GET | `/admin/reports/top-customers` | 👑 | Clientes con más compras |

## Configuración y Uploads

| Método | Ruta | Acceso | Descripción |
|--------|------|:------:|-------------|
| GET | `/settings` | 🌐 | Datos públicos de la tienda |
| PUT | `/admin/settings` | 👑 | Actualizar configuración |
| POST | `/uploads/product` | 👑 | Subir imagen de producto (campo `image`) |
| POST | `/uploads/banner` | 👑 | Subir imagen de banner |
| POST | `/uploads/user` | 👤 | Subir avatar |

---

## Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 / 201 | OK / Creado |
| 400 | Petición inválida (p.ej. stock insuficiente) |
| 401 | No autenticado / token inválido |
| 403 | Sin permisos para el rol |
| 404 | No encontrado |
| 409 | Conflicto (duplicado, p.ej. email ya registrado) |
| 422 | Datos inválidos (validación) |
| 500 | Error interno |
