-- ============================================================
--  BOUTIQUE E-COMMERCE  -  DATOS INICIALES (SEED)
--  Ejecutar DESPUÉS de schema.sql
--  Passwords de prueba:
--    admin@boutique.com    -> Admin12345
--    empleado@boutique.com -> Empleado12345
--    cliente@boutique.com  -> Cliente12345
-- ============================================================
USE boutique_ecommerce;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE inventory_movements;
TRUNCATE TABLE coupon_usages;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE favorites;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE brands;
TRUNCATE TABLE categories;
TRUNCATE TABLE coupons;
TRUNCATE TABLE banners;
TRUNCATE TABLE store_settings;
TRUNCATE TABLE addresses;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------- ROLES ----------------
INSERT INTO roles (id, nombre, descripcion) VALUES
  (1, 'ADMIN',    'Dueño / administrador con acceso total'),
  (2, 'EMPLOYEE', 'Empleado con acceso limitado'),
  (3, 'CUSTOMER', 'Cliente de la tienda');

-- ---------------- USERS ----------------
-- hashes bcrypt generados con bcryptjs (cost 10)
INSERT INTO users (id, nombre, apellido, email, password, telefono, rol_id, estado) VALUES
  (1, 'Admin', 'Boutique', 'admin@boutique.com',    '$2a$10$5AfOs3TX5pTLxf5AHykSh.asZ6318Yr9QAzXgX4e3YyT4JhWKFytO', '3001112233', 1, 1),
  (2, 'Empleado', 'Tienda',  'empleado@boutique.com', '$2a$10$5AfOs3TX5pTLxf5AHykSh.qkt0y7T.JHhqz15hkNKsRrCM4FQU02y', '3002223344', 2, 1),
  (3, 'Cliente', 'Demo',     'cliente@boutique.com',  '$2a$10$5AfOs3TX5pTLxf5AHykSh.L./DpzCw0nNIKhokXZ00Imt4r5cw45W', '3003334455', 3, 1);

-- ---------------- ADDRESSES ----------------
INSERT INTO addresses (user_id, nombre, telefono, direccion, ciudad, departamento, es_principal) VALUES
  (3, 'Cliente Demo', '3003334455', 'Calle 10 # 20-30', 'Medellín', 'Antioquia', 1);

-- ---------------- CATEGORIES ----------------
INSERT INTO categories (id, nombre, slug, descripcion, estado) VALUES
  (1, 'Ropa',        'ropa',        'Prendas de vestir para toda ocasión', 1),
  (2, 'Zapatos',     'zapatos',     'Calzado urbano y deportivo',          1),
  (3, 'Accesorios',  'accesorios',  'Complementa tu estilo',               1),
  (4, 'Bolsos',      'bolsos',      'Bolsos y carteras',                   1),
  (5, 'Perfumes',    'perfumes',    'Fragancias premium',                  1),
  (6, 'Ofertas',     'ofertas',     'Los mejores descuentos',              1);

-- ---------------- BRANDS ----------------
INSERT INTO brands (id, nombre, slug, estado) VALUES
  (1, 'Boutique',      'boutique',      1),
  (2, 'Urban Style',   'urban-style',   1),
  (3, 'Elegance',      'elegance',      1),
  (4, 'Sport Fashion', 'sport-fashion', 1);

-- ---------------- PRODUCTS ----------------
INSERT INTO products
  (id, nombre, slug, descripcion, categoria_id, marca_id, genero, precio, precio_descuento, coleccion, destacado, es_nuevo, en_oferta, ventas, estado)
VALUES
  (1, 'Camiseta Oversize Negra', 'camiseta-oversize-negra',
   'Camiseta oversize de algodón premium, corte holgado y cómodo. Ideal para un look urbano y moderno.',
   1, 2, 'UNISEX', 79900, 59900, 'Urban 2026', 1, 1, 1, 42, 1),

  (2, 'Jean Clásico Slim', 'jean-clasico-slim',
   'Jean de mezclilla con corte slim fit. Tela resistente con ligero stretch para mayor comodidad.',
   1, 1, 'HOMBRE', 129900, NULL, 'Esenciales', 1, 0, 0, 30, 1),

  (3, 'Tenis Urbanos Blancos', 'tenis-urbanos-blancos',
   'Tenis urbanos en color blanco, suela acolchada y diseño minimalista que combina con todo.',
   2, 4, 'UNISEX', 199900, 169900, 'Urban 2026', 1, 1, 1, 55, 1),

  (4, 'Bolso Elegante Cuero', 'bolso-elegante-cuero',
   'Bolso elegante en cuero sintético de alta calidad. Espacioso y con acabados premium.',
   4, 3, 'MUJER', 159900, NULL, 'Elegance', 1, 0, 0, 18, 1),

  (5, 'Gorra Street', 'gorra-street',
   'Gorra estilo street con visera curva y ajuste trasero. El accesorio perfecto para tu outfit.',
   3, 2, 'UNISEX', 49900, 39900, 'Urban 2026', 0, 1, 1, 25, 1),

  (6, 'Perfume Deluxe 100ml', 'perfume-deluxe-100ml',
   'Fragancia Deluxe de larga duración, notas amaderadas y cítricas. Presentación de 100ml.',
   5, 3, 'UNISEX', 249900, NULL, 'Elegance', 1, 0, 0, 12, 1);

-- ---------------- PRODUCT IMAGES ----------------
INSERT INTO product_images (product_id, url, es_principal, orden) VALUES
  (1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 1, 0),
  (1, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', 0, 1),
  (2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', 1, 0),
  (2, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800', 0, 1),
  (3, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', 1, 0),
  (3, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800', 0, 1),
  (4, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 1, 0),
  (5, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800', 1, 0),
  (6, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', 1, 0);

-- ---------------- PRODUCT VARIANTS ----------------
-- Camiseta Oversize Negra (color negro)
INSERT INTO product_variants (product_id, talla, color, color_hex, sku, stock, stock_minimo) VALUES
  (1, 'S', 'Negro', '#111111', 'CAM-NEG-S', 5, 3),
  (1, 'M', 'Negro', '#111111', 'CAM-NEG-M', 8, 3),
  (1, 'L', 'Negro', '#111111', 'CAM-NEG-L', 3, 3),
  (1, 'XL','Negro', '#111111', 'CAM-NEG-XL', 6, 3);

-- Jean Clásico Slim
INSERT INTO product_variants (product_id, talla, color, color_hex, sku, stock, stock_minimo) VALUES
  (2, '30', 'Azul', '#2b3a67', 'JEAN-AZ-30', 4, 2),
  (2, '32', 'Azul', '#2b3a67', 'JEAN-AZ-32', 7, 2),
  (2, '34', 'Azul', '#2b3a67', 'JEAN-AZ-34', 5, 2);

-- Tenis Urbanos Blancos
INSERT INTO product_variants (product_id, talla, color, color_hex, sku, stock, stock_minimo) VALUES
  (3, '38', 'Blanco', '#ffffff', 'TEN-BL-38', 2, 2),
  (3, '39', 'Blanco', '#ffffff', 'TEN-BL-39', 4, 2),
  (3, '40', 'Blanco', '#ffffff', 'TEN-BL-40', 1, 2),
  (3, '41', 'Blanco', '#ffffff', 'TEN-BL-41', 3, 2);

-- Bolso Elegante (talla única)
INSERT INTO product_variants (product_id, talla, color, color_hex, sku, stock, stock_minimo) VALUES
  (4, 'Única', 'Negro', '#111111', 'BOL-NEG-U', 6, 2),
  (4, 'Única', 'Café',  '#6b4423', 'BOL-CAF-U', 4, 2);

-- Gorra Street
INSERT INTO product_variants (product_id, talla, color, color_hex, sku, stock, stock_minimo) VALUES
  (5, 'Única', 'Negro', '#111111', 'GOR-NEG-U', 10, 3),
  (5, 'Única', 'Beige', '#d8c3a5', 'GOR-BEI-U', 8, 3);

-- Perfume Deluxe (talla única)
INSERT INTO product_variants (product_id, talla, color, color_hex, sku, stock, stock_minimo) VALUES
  (6, '100ml', 'N/A', NULL, 'PERF-DLX-100', 15, 3);

-- ---------------- COUPONS ----------------
INSERT INTO coupons (codigo, descripcion, tipo, valor, monto_minimo, usos_maximos, fecha_inicio, fecha_fin, estado) VALUES
  ('BIENVENIDA10', '10% en tu primera compra', 'PORCENTAJE', 10, 50000, 100, '2026-01-01', '2026-12-31', 1),
  ('ENVIOGRATIS',  'Descuento fijo de $10.000', 'FIJO', 10000, 100000, 50, '2026-01-01', '2026-12-31', 1);

-- ---------------- BANNERS ----------------
INSERT INTO banners (titulo, subtitulo, imagen, texto_boton, enlace, orden, estado) VALUES
  ('Nueva Colección 2026', 'Descubre las últimas tendencias urbanas',
   'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600', 'Comprar ahora', '/tienda?coleccion=Urban%202026', 0, 1),
  ('Hasta 30% OFF', 'Las mejores ofertas en moda y calzado',
   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600', 'Ver ofertas', '/tienda?oferta=1', 1, 1);

-- ---------------- STORE SETTINGS ----------------
INSERT INTO store_settings
  (id, nombre_tienda, telefono, whatsapp, email, direccion, ciudad, instagram, facebook, costo_envio, moneda)
VALUES
  (1, 'Boutique', '3001112233', '573001112233', 'contacto@boutique.com',
   'Calle 10 # 20-30', 'Medellín', 'https://instagram.com/boutique', 'https://facebook.com/boutique', 12000, 'COP');
