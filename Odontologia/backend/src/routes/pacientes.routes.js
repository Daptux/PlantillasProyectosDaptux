/**
 * backend/src/routes/pacientes.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pacientes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

router.use(verificarToken);

const gestion = permitirRoles('ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR');

router.get('/', gestion, ctrl.listar);
router.get('/:id', gestion, ctrl.obtener);
router.post('/', permitirRoles('ADMIN', 'RECEPCIONISTA', 'AUXILIAR'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN', 'RECEPCIONISTA', 'AUXILIAR'), ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
