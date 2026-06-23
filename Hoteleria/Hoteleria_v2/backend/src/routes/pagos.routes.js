const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  registrarPago,
  obtenerPagos,
  obtenerPagosPorReserva,
  crearCheckout,
  confirmarPago,
  webhookWompi,
  obtenerEstadoIntento
} = require('../controllers/pagos.controller');

// ----- Pasarela Wompi -----

// Webhook de eventos de Wompi (público, sin autenticación: la firma valida el origen)
router.post('/webhook', webhookWompi);

// Crear intento de pago / abrir checkout (cliente autenticado)
router.post('/checkout', authMiddleware, crearCheckout);

// Confirmar pago tras pagar en el widget (cliente autenticado)
router.post('/confirmar', authMiddleware, confirmarPago);

// Consultar estado de un intento de pago (cliente autenticado)
router.get('/estado/:referencia', authMiddleware, obtenerEstadoIntento);

// ----- Gestión de pagos por ADMIN y EMPLEADO -----
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  registrarPago
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  obtenerPagos
);

router.get(
  '/reserva/:id_reserva',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  obtenerPagosPorReserva
);

module.exports = router;
