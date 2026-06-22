import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/settings', getSettings); // público
router.put('/admin/settings', authRequired, adminOnly, updateSettings);

export default router;
