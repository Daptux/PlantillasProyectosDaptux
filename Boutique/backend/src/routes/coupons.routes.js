import { Router } from 'express';
import {
  listCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon,
} from '../controllers/coupons.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = Router();

// Cliente: validar cupón en checkout
router.post('/coupons/validate', authRequired, validateCoupon);

// Admin
router.get('/admin/coupons', authRequired, adminOnly, listCoupons);
router.post('/admin/coupons', authRequired, adminOnly, createCoupon);
router.put('/admin/coupons/:id', authRequired, adminOnly, updateCoupon);
router.delete('/admin/coupons/:id', authRequired, adminOnly, deleteCoupon);

export default router;
