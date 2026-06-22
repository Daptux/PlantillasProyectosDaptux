import { Router } from 'express';
import { listInventory, lowStock, registerMovement, listMovements } from '../controllers/inventory.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { staffOnly } from '../middlewares/role.middleware.js';

const router = Router();
router.use(authRequired, staffOnly); // admin y empleado pueden gestionar stock

router.get('/', listInventory);
router.get('/low-stock', lowStock);
router.get('/movements', listMovements);
router.post('/movement', registerMovement);

export default router;
