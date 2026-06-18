const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  obtenerPerfil,
  crearEmpleado,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  desactivarUsuario
} = require('../controllers/usuarios.controller');

// Perfil del usuario autenticado (cualquier rol)
router.get('/perfil', authMiddleware, obtenerPerfil);

// Listado y gestión de usuarios: solo ADMIN
router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  obtenerUsuarios
);

// Se mantiene por compatibilidad: crear empleado desde /api/usuarios/empleados
router.post(
  '/empleados',
  authMiddleware,
  roleMiddleware('ADMIN'),
  crearEmpleado
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  obtenerUsuarioPorId
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  actualizarUsuario
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  desactivarUsuario
);

module.exports = router;
