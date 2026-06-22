import { Router } from 'express';
import {
  createOrder, myOrders, getOrder, adminListOrders, updateOrderStatus, updatePaymentStatus,
} from '../controllers/orders.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { staffOnly } from '../middlewares/role.middleware.js';

const router = Router();

// Cliente
router.post('/orders', authRequired, createOrder);
router.get('/orders/my-orders', authRequired, myOrders);
router.get('/orders/:id', authRequired, getOrder);

// Admin / empleado
router.get('/admin/orders', authRequired, staffOnly, adminListOrders);
router.put('/admin/orders/:id/status', authRequired, staffOnly, updateOrderStatus);
router.put('/admin/orders/:id/payment-status', authRequired, staffOnly, updatePaymentStatus);

export default router;
