# 🛍️ Boutique E-Commerce

Tienda online completa para una boutique de moda, con experiencia tipo tienda oficial (Nike / Zara / Adidas). Incluye tienda pública, carrito, checkout, favoritos, historial de pedidos y un **panel administrativo completo** con control de roles.

Construido con **React + Vite** (frontend), **Node.js + Express** (backend) y **MySQL puro** con `mysql2/promise` (sin ORM, sin Prisma, sin Sequelize).

---

## ✨ Características

- 🏠 Landing page tipo tienda oficial (banners, categorías, destacados, ofertas, beneficios, WhatsApp flotante).
- 🛒 Catálogo con filtros (categoría, marca, género, talla, color, precio, ofertas) y ordenamiento.
- 👕 Detalle de producto con galería, variantes (talla/color), stock por variante y relacionados.
- ❤️ Favoritos y carrito asociados al usuario.
- 💳 Checkout con cupones, métodos de pago y costo de envío.
- 📦 Historial de pedidos con estados de pedido y de pago.
- 🔐 Autenticación JWT + roles (ADMIN / EMPLOYEE / CUSTOMER).
- 📊 Panel admin: dashboard, productos, variantes, inventario, pedidos, clientes, empleados, categorías, marcas, cupones, banners, reportes y configuración de tienda.

---

## 🧱 Tecnologías

| Capa | Stack |
|------|-------|
| Frontend | React 18, Vite, React Router DOM, Axios, Tailwind CSS, React Icons, Context API |
| Backend | Node.js, Express, mysql2/promise, JWT, bcryptjs, dotenv, CORS, Multer, Morgan |
| Base de datos | MySQL / MariaDB (SQL puro, sin ORM) |

---

## 📁 Estructura

```
boutique-ecommerce/
├── frontend/      # React + Vite
├── backend/       # Express + mysql2
├── database/      # schema.sql + seed.sql
├── docs/          # ENDPOINTS, ROLES, INSTALLATION, DATABASE
└── README.md
```

Detalle completo en [docs/INSTALLATION.md](docs/INSTALLATION.md).

---

## 🚀 Instalación rápida

> Requisitos: **Node.js 18+** y **MySQL/MariaDB** (XAMPP funciona perfecto).

### 1. Base de datos

Con XAMPP/MySQL corriendo, importa el esquema y los datos:

```bash
# Desde la carpeta database/ (ajusta la ruta de mysql según tu instalación)
# IMPORTANTE: usa --default-character-set=utf8mb4 para que las tildes/ñ se guarden bien
mysql -u root --default-character-set=utf8mb4 < schema.sql
mysql -u root --default-character-set=utf8mb4 < seed.sql
```

> En XAMPP el binario suele estar en `C:\xampp\mysql\bin\mysql.exe`.
> También puedes importar ambos archivos desde **phpMyAdmin**.

Esto crea la base `boutique_ecommerce` con datos de ejemplo.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # ajusta credenciales si tu MySQL tiene contraseña
npm run dev               # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

Abre **http://localhost:5173** 🎉

---

## 👥 Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Dueño / Admin | `admin@boutique.com` | `Admin12345` |
| Empleado | `empleado@boutique.com` | `Empleado12345` |
| Cliente | `cliente@boutique.com` | `Cliente12345` |

El admin y el empleado, al iniciar sesión, son redirigidos a **/admin**.

---

## 🔑 Roles

| Acción | ADMIN | EMPLOYEE | CUSTOMER |
|--------|:-----:|:--------:|:--------:|
| Comprar / favoritos / perfil | – | – | ✅ |
| Ver y atender pedidos | ✅ | ✅ | propio |
| Actualizar stock / inventario | ✅ | ✅ | – |
| Crear/editar/eliminar productos | ✅ | – | – |
| Categorías, marcas, cupones, banners | ✅ | – | – |
| Gestionar empleados | ✅ | – | – |
| Configuración y reportes financieros | ✅ | – | – |

Más detalle en [docs/ROLES.md](docs/ROLES.md).

---

## 📡 Endpoints

Listado completo en [docs/ENDPOINTS.md](docs/ENDPOINTS.md). Resumen:

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- **Productos**: `/api/products`, `/api/products/:id`, variantes e imágenes
- **Carrito**: `/api/cart`, `/api/cart/items`
- **Pedidos**: `/api/orders`, `/api/orders/my-orders`, `/api/admin/orders`
- **Admin**: `/api/admin/...` (usuarios, empleados, inventario, cupones, banners, reportes, settings)

---

## 🗄️ Base de datos

Modelo entidad-relación y diccionario de tablas en [docs/DATABASE.md](docs/DATABASE.md).
Tablas: `roles, users, addresses, categories, brands, products, product_images, product_variants, favorites, carts, cart_items, orders, order_items, payments, coupons, coupon_usages, banners, inventory_movements, store_settings`.

---

## 📜 Licencia

MIT — úsalo y modifícalo libremente.
