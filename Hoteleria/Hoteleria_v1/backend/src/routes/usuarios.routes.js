const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  obtenerPerfil,
  crearEmpleado,
  obtenerUsuarios
} = require('../controllers/usuarios.controller');

router.get('/perfil', authMiddleware, obtenerPerfil);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  obtenerUsuarios
);

router.post(
  '/empleados',
  authMiddleware,
  roleMiddleware('ADMIN'),
  crearEmpleado
);

module.exports = router;