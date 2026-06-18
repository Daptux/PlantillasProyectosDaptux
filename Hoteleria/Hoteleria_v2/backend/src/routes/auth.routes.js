const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

const {
  register,
  login
} = require('../controllers/auth.controller');

const { obtenerPerfil, actualizarPerfil } = require('../controllers/usuarios.controller');

router.post('/register', register);
router.post('/login', login);

// Perfil del usuario autenticado (cualquier rol)
router.get('/perfil', authMiddleware, obtenerPerfil);
router.put('/perfil', authMiddleware, actualizarPerfil);

module.exports = router;
