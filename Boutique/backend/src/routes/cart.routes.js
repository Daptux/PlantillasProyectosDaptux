import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cart.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authRequired); // todo el carrito requiere sesión

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', removeItem);
router.delete('/clear', clearCart);

export default router;
