const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  registrarPago,
  obtenerPagos,
  obtenerPagosPorReserva
} = require('../controllers/pagos.controller');

// Pagos los gestionan ADMIN y EMPLEADO
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
