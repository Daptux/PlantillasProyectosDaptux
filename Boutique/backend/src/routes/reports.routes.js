import { Router } from 'express';
import {
  dashboard, sales, bestProducts, lowStockReport, topCustomers,
} from '../controllers/reports.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly, staffOnly } from '../middlewares/role.middleware.js';

const router = Router();
router.use(authRequired);

router.get('/dashboard', staffOnly, dashboard);
router.get('/sales', adminOnly, sales);
router.get('/best-products', staffOnly, bestProducts);
router.get('/low-stock', staffOnly, lowStockReport);
router.get('/top-customers', adminOnly, topCustomers);

export default router;
