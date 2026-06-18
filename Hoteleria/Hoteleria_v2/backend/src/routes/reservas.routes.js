const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  crearReserva,
  obtenerMisReservas,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarEstadoReserva,
  cancelarMiReserva,
  hacerCheckIn,
  hacerCheckOut
} = require('../controllers/reservas.controller');

router.post(
  '/',
  authMiddleware,
  crearReserva
);

router.get(
  '/mis-reservas',
  authMiddleware,
  obtenerMisReservas
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  obtenerReservas
);

router.get(
  '/:id',
  authMiddleware,
  obtenerReservaPorId
);

router.put(
  '/:id/estado',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  actualizarEstadoReserva
);

router.put(
  '/:id/cancelar',
  authMiddleware,
  cancelarMiReserva
);

router.put(
  '/:id/check-in',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  hacerCheckIn
);

router.put(
  '/:id/check-out',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  hacerCheckOut
);

module.exports = router;