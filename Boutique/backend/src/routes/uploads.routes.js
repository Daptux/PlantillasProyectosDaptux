import { Router } from 'express';
import { uploadProductImage, uploadBannerImage, uploadUserImage } from '../controllers/uploads.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { uploadProduct, uploadBanner, uploadUser } from '../middlewares/upload.middleware.js';

const router = Router();

// Subida de una sola imagen (campo "image") -> devuelve { url }
router.post('/product', authRequired, adminOnly, uploadProduct.single('image'), uploadProductImage);
router.post('/banner', authRequired, adminOnly, uploadBanner.single('image'), uploadBannerImage);
router.post('/user', authRequired, uploadUser.single('image'), uploadUserImage);

export default router;
