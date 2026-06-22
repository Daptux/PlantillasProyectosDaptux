/**
 * backend/src/routes/odontologos.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/odontologos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

// Públicas (landing)
router.get('/publicos', ctrl.listarPublicos);

// Protegidas
router.use(verificarToken);
router.get('/especialidades/all', ctrl.listarEspecialidades);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', permitirRoles('ADMIN'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN'), ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
