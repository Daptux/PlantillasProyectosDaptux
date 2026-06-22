import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authRequired, adminOnly, createCategory);
router.put('/:id', authRequired, adminOnly, updateCategory);
router.delete('/:id', authRequired, adminOnly, deleteCategory);

export default router;
