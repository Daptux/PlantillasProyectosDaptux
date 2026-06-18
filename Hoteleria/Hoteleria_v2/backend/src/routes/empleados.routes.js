const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  crearEmpleado,
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  eliminarEmpleado
} = require('../controllers/empleados.controller');

// Todo el módulo de empleados es exclusivo de ADMIN
router.post('/', authMiddleware, roleMiddleware('ADMIN'), crearEmpleado);
router.get('/', authMiddleware, roleMiddleware('ADMIN'), obtenerEmpleados);
router.get('/:id', authMiddleware, roleMiddleware('ADMIN'), obtenerEmpleadoPorId);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), actualizarEmpleado);
// DELETE = eliminación REAL de la BD (activar/inhabilitar se hace con PUT estado)
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), eliminarEmpleado);

module.exports = router;
