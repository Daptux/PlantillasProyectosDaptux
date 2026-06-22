import { Router } from 'express';
import { listFavorites, toggleFavorite, favoriteIds } from '../controllers/favorites.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authRequired);

router.get('/', listFavorites);
router.get('/ids', favoriteIds);
router.post('/:productId', toggleFavorite);

export default router;
