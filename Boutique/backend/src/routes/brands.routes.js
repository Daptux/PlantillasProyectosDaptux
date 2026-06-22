import { Router } from 'express';
import { listBrands, createBrand, updateBrand, deleteBrand } from '../controllers/brands.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', listBrands);
router.post('/', authRequired, adminOnly, createBrand);
router.put('/:id', authRequired, adminOnly, updateBrand);
router.delete('/:id', authRequired, adminOnly, deleteBrand);

export default router;
