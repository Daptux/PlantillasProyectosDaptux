# 🗄️ Base de datos

Motor: **MySQL / MariaDB**, InnoDB, charset `utf8mb4`. Sin ORM — SQL puro vía `mysql2/promise`.

Archivos:
- `database/schema.sql` — estructura (crea la base `boutique_ecommerce`).
- `database/seed.sql` — datos iniciales (roles, usuarios, catálogo, banners, settings).

---

## Diagrama de relaciones (resumen)

```
roles ──< users ──< addresses
               │
               ├──< carts ──< cart_items >── products
               ├──< favorites >── products
               ├──< orders ──< order_items >── products / product_variants
               │        ├──< payments
               │        └──> coupons ──< coupon_usages
               └──< inventory_movements

categories ──< products ──< product_images
brands      ──< products ──< product_variants ──< inventory_movements

banners            (independiente)
store_settings     (fila única de configuración)
```

`──<` = uno a muchos · `>──` = referencia (FK).

---

## Tablas

### roles
Roles del sistema. `nombre` ∈ {ADMIN, EMPLOYEE, CUSTOMER}.

### users
Usuarios (clientes, empleados, admin). Campos clave: `nombre, apellido, email (único), password (bcrypt), telefono, rol_id (FK roles), estado (1/0), fecha_creacion, deleted_at`.

### addresses
Direcciones de envío del cliente. FK `user_id`.

### categories / brands
Catálogo base. Cada una con `nombre, slug (único), estado, deleted_at`. `categories` tiene `imagen`, `brands` tiene `logo`.

### products
Producto. Campos: `nombre, slug, descripcion, categoria_id (FK), marca_id (FK), genero (ENUM HOMBRE/MUJER/UNISEX/NINO), precio, precio_descuento, coleccion, destacado, es_nuevo, en_oferta, ventas, estado, deleted_at`.

### product_images
Imágenes del producto. `url, es_principal, orden`. FK `product_id` (ON DELETE CASCADE).

### product_variants
**Inventario real por talla/color.** `talla, color, color_hex, sku (único), stock, stock_minimo, estado`. FK `product_id`. El stock vive aquí, no en `products`.

### favorites
Relación usuario ↔ producto (único por par). FK `user_id`, `product_id`.

### carts / cart_items
Carrito por usuario (único). `cart_items` referencia `product_id`, `variant_id` y guarda `cantidad` y `precio_unitario` (snapshot). Único por `(cart_id, product_id, variant_id)`.

### orders
Pedido. Snapshot de datos de envío + montos (`subtotal, descuento, costo_envio, total`), `cupon_id/cupon_codigo`, `metodo_pago` (ENUM), `estado` (ENUM de pedido) y `estado_pago` (ENUM de pago). `numero` legible único (ej. `ORD-2026-000001`).

### order_items
Líneas del pedido con **snapshot** del producto (`nombre_producto, talla, color, imagen, precio_unitario, cantidad, subtotal`). Así el pedido conserva sus datos aunque el producto cambie luego.

### payments
Registro de pago por pedido. `metodo, monto, estado (ENUM), referencia`.

### coupons / coupon_usages
Cupones (`tipo` PORCENTAJE/FIJO, `valor, monto_minimo, usos_maximos, usos_actuales, fecha_inicio, fecha_fin, estado`) y registro de cada uso por usuario/pedido.

### banners
Banners del home. `titulo, subtitulo, imagen, texto_boton, enlace, orden, estado`.

### inventory_movements
Auditoría de stock. `tipo` ∈ {ENTRADA, SALIDA, AJUSTE, VENTA}, `cantidad, stock_anterior, stock_nuevo, motivo, user_id, order_id`. Se genera automáticamente en ventas/cancelaciones y manualmente desde el panel.

### store_settings
Configuración única de la tienda: `nombre_tienda, logo, telefono, whatsapp, email, direccion, ciudad, instagram, facebook, tiktok, costo_envio, moneda`.

---

## Flujo de inventario

1. Cliente crea un pedido → estado `PENDIENTE`. **No** se descuenta stock todavía.
2. Admin/empleado pasa el pedido a `CONFIRMADO` → se descuenta el `stock` de cada variante, se registra un movimiento `VENTA` y se incrementa `products.ventas`.
3. Si el pedido se `CANCELA` después de haber descontado, el stock se **reintegra** (movimiento `ENTRADA`).

Todas estas operaciones usan **transacciones** (`BEGIN/COMMIT/ROLLBACK`) y `SELECT ... FOR UPDATE` para evitar condiciones de carrera.

---

## Convenciones

- Claves primarias `id INT AUTO_INCREMENT`.
- `created_at` / `updated_at` automáticos donde aplica.
- Borrado lógico con `deleted_at` y/o `estado` en tablas de catálogo y usuarios.
- Índices en columnas de filtro/búsqueda frecuentes (slug, estado, fechas, FKs).
- Montos en `DECIMAL(12,2)`; el backend los lee como número (`decimalNumbers: true`).
