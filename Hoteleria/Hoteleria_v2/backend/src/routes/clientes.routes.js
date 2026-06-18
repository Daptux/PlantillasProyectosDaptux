const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clientes.controller');

// ADMIN y EMPLEADO gestionan clientes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  crearCliente
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  obtenerClientes
);

// CLIENTE puede ver su propia info (el controlador valida la propiedad)
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO', 'CLIENTE'),
  obtenerClientePorId
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  actualizarCliente
);

// Eliminación REAL de la BD: solo ADMIN (activar/inhabilitar se hace con PUT estado)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  eliminarCliente
);

module.exports = router;
