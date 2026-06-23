import { Router } from 'express';
import { initWompi, verifyWompi, wompiWebhook, wompiConfig } from '../controllers/payments.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/config', wompiConfig);                       // público
router.post('/wompi/init', authRequired, initWompi);      // cliente: iniciar pago
router.get('/wompi/verify/:transactionId', authRequired, verifyWompi); // verificar tras redirect
router.post('/wompi/webhook', wompiWebhook);              // público: lo llama Wompi (firma verificada)

export default router;
