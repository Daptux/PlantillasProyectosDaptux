import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import productsRoutes from './routes/products.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import brandsRoutes from './routes/brands.routes.js';
import cartRoutes from './routes/cart.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import couponsRoutes from './routes/coupons.routes.js';
import bannersRoutes from './routes/banners.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middlewares globales
// CORS: permite las URLs de env.frontendUrls (una o varias separadas por coma en FRONTEND_URL).
// También permite peticiones sin origin (Postman, curl, apps móviles).
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendUrls.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'boutique-api' }));

// Montaje de rutas (cada router define sus paths públicos y /admin internamente)
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api', ordersRoutes);     // /api/orders/* y /api/admin/orders/*
app.use('/api', couponsRoutes);    // /api/coupons/validate y /api/admin/coupons/*
app.use('/api', bannersRoutes);    // /api/banners y /api/admin/banners/*
app.use('/api', settingsRoutes);   // /api/settings y /api/admin/settings
app.use('/api/admin', usersRoutes);   // /api/admin/users/* y /api/admin/employees/*
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/reports', reportsRoutes);

// 404 + manejo de errores
app.use(notFound);
app.use(errorHandler);

export default app;
