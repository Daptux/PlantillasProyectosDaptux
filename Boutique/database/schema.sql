-- ============================================================
--  BOUTIQUE E-COMMERCE  -  ESQUEMA DE BASE DE DATOS (MySQL/MariaDB)
--  Motor: InnoDB  |  Charset: utf8mb4
--  No se usa ningún ORM. SQL puro.
-- ============================================================

DROP DATABASE IF EXISTS boutique_ecommerce;
CREATE DATABASE boutique_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE boutique_ecommerce;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL UNIQUE,          -- ADMIN | EMPLOYEE | CUSTOMER
  descripcion VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) DEFAULT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  telefono      VARCHAR(30)  DEFAULT NULL,
  rol_id        INT NOT NULL,
  estado        TINYINT(1) NOT NULL DEFAULT 1,      -- 1 activo, 0 inactivo
  avatar        VARCHAR(255) DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_users_rol FOREIGN KEY (rol_id) REFERENCES roles(id),
  INDEX idx_users_email (email),
  INDEX idx_users_rol (rol_id),
  INDEX idx_users_estado (estado)
) ENGINE=InnoDB;

-- ============================================================
-- ADDRESSES (direcciones del cliente)
-- ============================================================
CREATE TABLE addresses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  nombre       VARCHAR(100) DEFAULT NULL,           -- nombre de quien recibe
  telefono     VARCHAR(30)  DEFAULT NULL,
  direccion    VARCHAR(255) NOT NULL,
  ciudad       VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) DEFAULT NULL,
  codigo_postal VARCHAR(20) DEFAULT NULL,
  referencia   VARCHAR(255) DEFAULT NULL,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_addresses_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  imagen      VARCHAR(255) DEFAULT NULL,
  estado      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_categories_slug (slug),
  INDEX idx_categories_estado (estado)
) ENGINE=InnoDB;

-- ============================================================
-- BRANDS (marcas)
-- ============================================================
CREATE TABLE brands (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  logo        VARCHAR(255) DEFAULT NULL,
  estado      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_brands_slug (slug),
  INDEX idx_brands_estado (estado)
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(180) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  descripcion     TEXT DEFAULT NULL,
  categoria_id    INT DEFAULT NULL,
  marca_id        INT DEFAULT NULL,
  genero          ENUM('HOMBRE','MUJER','UNISEX','NINO') NOT NULL DEFAULT 'UNISEX',
  precio          DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_descuento DECIMAL(12,2) DEFAULT NULL,        -- precio final si está en oferta
  coleccion       VARCHAR(100) DEFAULT NULL,
  destacado       TINYINT(1) NOT NULL DEFAULT 0,
  es_nuevo        TINYINT(1) NOT NULL DEFAULT 0,
  en_oferta       TINYINT(1) NOT NULL DEFAULT 0,
  ventas          INT NOT NULL DEFAULT 0,             -- contador de unidades vendidas
  estado          TINYINT(1) NOT NULL DEFAULT 1,      -- 1 activo / publicado, 0 inactivo
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_products_categoria FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_marca     FOREIGN KEY (marca_id)     REFERENCES brands(id)     ON DELETE SET NULL,
  INDEX idx_products_slug (slug),
  INDEX idx_products_categoria (categoria_id),
  INDEX idx_products_marca (marca_id),
  INDEX idx_products_estado (estado),
  INDEX idx_products_destacado (destacado),
  INDEX idx_products_oferta (en_oferta),
  INDEX idx_products_precio (precio)
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  url         VARCHAR(255) NOT NULL,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  orden       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_images_product (product_id)
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCT VARIANTS (talla / color / stock)
-- ============================================================
CREATE TABLE product_variants (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    INT NOT NULL,
  talla         VARCHAR(30) DEFAULT NULL,
  color         VARCHAR(50) DEFAULT NULL,
  color_hex     VARCHAR(10) DEFAULT NULL,
  sku           VARCHAR(80) DEFAULT NULL UNIQUE,
  stock         INT NOT NULL DEFAULT 0,
  stock_minimo  INT NOT NULL DEFAULT 3,
  estado        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_variants_product (product_id),
  INDEX idx_variants_stock (stock)
) ENGINE=InnoDB;

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fav_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_fav_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_fav (user_id, product_id),
  INDEX idx_fav_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- CARTS
-- ============================================================
CREATE TABLE carts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  cart_id     INT NOT NULL,
  product_id  INT NOT NULL,
  variant_id  INT DEFAULT NULL,
  cantidad    INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,   -- snapshot del precio al agregar
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_citems_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id)            ON DELETE CASCADE,
  CONSTRAINT fk_citems_product FOREIGN KEY (product_id) REFERENCES products(id)         ON DELETE CASCADE,
  CONSTRAINT fk_citems_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  INDEX idx_citems_cart (cart_id),
  UNIQUE KEY uq_cart_variant (cart_id, product_id, variant_id)
) ENGINE=InnoDB;

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE coupons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(50) NOT NULL UNIQUE,
  descripcion     VARCHAR(255) DEFAULT NULL,
  tipo            ENUM('PORCENTAJE','FIJO') NOT NULL DEFAULT 'PORCENTAJE',
  valor           DECIMAL(12,2) NOT NULL DEFAULT 0,
  monto_minimo    DECIMAL(12,2) NOT NULL DEFAULT 0,
  usos_maximos    INT DEFAULT NULL,                  -- null = ilimitado
  usos_actuales   INT NOT NULL DEFAULT 0,
  fecha_inicio    DATE DEFAULT NULL,
  fecha_fin       DATE DEFAULT NULL,
  estado          TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_codigo (codigo),
  INDEX idx_coupons_estado (estado)
) ENGINE=InnoDB;

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  numero            VARCHAR(30) NOT NULL UNIQUE,      -- ej: ORD-2026-000123
  user_id           INT NOT NULL,
  -- datos de envío (snapshot)
  nombre_cliente    VARCHAR(150) NOT NULL,
  email_cliente     VARCHAR(150) DEFAULT NULL,
  telefono          VARCHAR(30)  DEFAULT NULL,
  direccion         VARCHAR(255) NOT NULL,
  ciudad            VARCHAR(100) NOT NULL,
  departamento      VARCHAR(100) DEFAULT NULL,
  observaciones     VARCHAR(500) DEFAULT NULL,
  -- montos
  subtotal          DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento         DECIMAL(12,2) NOT NULL DEFAULT 0,
  costo_envio       DECIMAL(12,2) NOT NULL DEFAULT 0,
  total             DECIMAL(12,2) NOT NULL DEFAULT 0,
  cupon_id          INT DEFAULT NULL,
  cupon_codigo      VARCHAR(50) DEFAULT NULL,
  -- estados
  metodo_pago       ENUM('CONTRA_ENTREGA','TRANSFERENCIA','NEQUI','DAVIPLATA','TARJETA') NOT NULL DEFAULT 'CONTRA_ENTREGA',
  estado            ENUM('PENDIENTE','CONFIRMADO','PREPARANDO','ENVIADO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  estado_pago       ENUM('PENDIENTE','PAGADO','RECHAZADO','REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user  FOREIGN KEY (user_id)  REFERENCES users(id),
  CONSTRAINT fk_orders_cupon FOREIGN KEY (cupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_estado (estado),
  INDEX idx_orders_pago (estado_pago),
  INDEX idx_orders_fecha (created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_id        INT NOT NULL,
  product_id      INT DEFAULT NULL,
  variant_id      INT DEFAULT NULL,
  -- snapshot del producto
  nombre_producto VARCHAR(180) NOT NULL,
  talla           VARCHAR(30) DEFAULT NULL,
  color           VARCHAR(50) DEFAULT NULL,
  imagen          VARCHAR(255) DEFAULT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  cantidad        INT NOT NULL DEFAULT 1,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_oitems_order   FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oitems_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_oitems_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  INDEX idx_oitems_order (order_id)
) ENGINE=InnoDB;

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  metodo        VARCHAR(50) NOT NULL,
  monto         DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado        ENUM('PENDIENTE','PAGADO','RECHAZADO','REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
  referencia    VARCHAR(120) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_payments_order (order_id)
) ENGINE=InnoDB;

-- ============================================================
-- COUPON USAGES
-- ============================================================
CREATE TABLE coupon_usages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id   INT NOT NULL,
  user_id     INT NOT NULL,
  order_id    INT DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cusage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_cusage_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_cusage_order  FOREIGN KEY (order_id)  REFERENCES orders(id)  ON DELETE SET NULL,
  INDEX idx_cusage_coupon (coupon_id)
) ENGINE=InnoDB;

-- ============================================================
-- BANNERS
-- ============================================================
CREATE TABLE banners (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(150) DEFAULT NULL,
  subtitulo   VARCHAR(255) DEFAULT NULL,
  imagen      VARCHAR(255) NOT NULL,
  texto_boton VARCHAR(60)  DEFAULT NULL,
  enlace      VARCHAR(255) DEFAULT NULL,
  orden       INT NOT NULL DEFAULT 0,
  estado      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banners_estado (estado)
) ENGINE=InnoDB;

-- ============================================================
-- INVENTORY MOVEMENTS
-- ============================================================
CREATE TABLE inventory_movements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  variant_id  INT NOT NULL,
  tipo        ENUM('ENTRADA','SALIDA','AJUSTE','VENTA') NOT NULL,
  cantidad    INT NOT NULL,
  stock_anterior INT NOT NULL DEFAULT 0,
  stock_nuevo    INT NOT NULL DEFAULT 0,
  motivo      VARCHAR(255) DEFAULT NULL,
  user_id     INT DEFAULT NULL,                       -- quién realizó el movimiento
  order_id    INT DEFAULT NULL,                       -- referencia si fue por venta
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invmov_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  CONSTRAINT fk_invmov_user    FOREIGN KEY (user_id)    REFERENCES users(id)            ON DELETE SET NULL,
  CONSTRAINT fk_invmov_order   FOREIGN KEY (order_id)   REFERENCES orders(id)           ON DELETE SET NULL,
  INDEX idx_invmov_variant (variant_id),
  INDEX idx_invmov_fecha (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- STORE SETTINGS (una sola fila)
-- ============================================================
CREATE TABLE store_settings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tienda   VARCHAR(150) NOT NULL DEFAULT 'Boutique',
  logo            VARCHAR(255) DEFAULT NULL,
  telefono        VARCHAR(30)  DEFAULT NULL,
  whatsapp        VARCHAR(30)  DEFAULT NULL,
  email           VARCHAR(150) DEFAULT NULL,
  direccion       VARCHAR(255) DEFAULT NULL,
  ciudad          VARCHAR(100) DEFAULT NULL,
  instagram       VARCHAR(255) DEFAULT NULL,
  facebook        VARCHAR(255) DEFAULT NULL,
  tiktok          VARCHAR(255) DEFAULT NULL,
  costo_envio     DECIMAL(12,2) NOT NULL DEFAULT 0,
  moneda          VARCHAR(10) NOT NULL DEFAULT 'COP',
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
