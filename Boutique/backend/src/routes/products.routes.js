import { Router } from 'express';
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addImages, deleteImage, addVariant, updateVariant, deleteVariant, filterOptions,
} from '../controllers/products.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateProduct } from '../utils/validators.js';
import { uploadProduct } from '../middlewares/upload.middleware.js';

const router = Router();

// Públicas
router.get('/', listProducts);
router.get('/meta/filters', filterOptions);

// Variantes (admin) - antes de '/:id' para evitar colisión
router.put('/variants/:variantId', authRequired, adminOnly, updateVariant);
router.delete('/variants/:variantId', authRequired, adminOnly, deleteVariant);
router.delete('/images/:imageId', authRequired, adminOnly, deleteImage);

router.get('/:id', getProduct);

// Admin
router.post('/', authRequired, adminOnly, validate(validateProduct), createProduct);
router.put('/:id', authRequired, adminOnly, updateProduct);
router.delete('/:id', authRequired, adminOnly, deleteProduct);
router.post('/:id/images', authRequired, adminOnly, uploadProduct.array('images', 6), addImages);
router.post('/:id/variants', authRequired, adminOnly, addVariant);

export default router;
