const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const { obtenerOpiniones, crearOpinion } = require('../controllers/opiniones.controller');

// Listado público (para mostrar en la web)
router.get('/', obtenerOpiniones);

// Solo clientes pueden escribir opiniones
router.post('/', authMiddleware, roleMiddleware('CLIENTE'), crearOpinion);

module.exports = router;
