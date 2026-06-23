// backend/src/routes/odontologos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/odontologos.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

// Público: equipo para la landing
router.get('/publicos', ctrl.listarPublicos);

// Protegido
router.use(verificarToken);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', permitirRoles('ADMIN'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN'), ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
