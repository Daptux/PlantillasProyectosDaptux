const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  crearHabitacion,
  obtenerHabitaciones,
  obtenerHabitacionesDisponibles,
  verificarDisponibilidad,
  obtenerFechasOcupadas,
  obtenerHabitacionPublica,
  obtenerHabitacionPorId,
  actualizarHabitacion,
  eliminarHabitacion
} = require('../controllers/habitaciones.controller');

// Rutas públicas (sin token)
router.get('/disponibles', obtenerHabitacionesDisponibles);
router.get('/publica/:id/disponibilidad', verificarDisponibilidad);
router.get('/publica/:id/ocupadas', obtenerFechasOcupadas);
router.get('/publica/:id', obtenerHabitacionPublica);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  obtenerHabitaciones
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  obtenerHabitacionPorId
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  crearHabitacion
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  actualizarHabitacion
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  eliminarHabitacion
);

module.exports = router;