import { Router } from 'express';
import {
  listActiveBanners, listBanners, createBanner, updateBanner, deleteBanner,
} from '../controllers/banners.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/banners', listActiveBanners); // público
router.get('/admin/banners', authRequired, adminOnly, listBanners);
router.post('/admin/banners', authRequired, adminOnly, createBanner);
router.put('/admin/banners/:id', authRequired, adminOnly, updateBanner);
router.delete('/admin/banners/:id', authRequired, adminOnly, deleteBanner);

export default router;
