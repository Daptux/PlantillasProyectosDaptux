import { Router } from 'express';
import { register, login, profile, updateProfile } from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateRegister, validateLogin } from '../utils/validators.js';

const router = Router();

router.post('/register', validate(validateRegister), register);
router.post('/login', validate(validateLogin), login);
router.get('/profile', authRequired, profile);
router.put('/profile', authRequired, updateProfile);

export default router;
