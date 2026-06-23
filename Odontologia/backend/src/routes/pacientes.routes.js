// backend/src/routes/pacientes.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pacientes.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

router.use(verificarToken);

const GESTION = ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR'];

router.get('/', permitirRoles(...GESTION, 'CAJA'), ctrl.listar);
router.get('/:id', permitirRoles(...GESTION, 'CAJA'), ctrl.obtener);
router.post('/', permitirRoles('ADMIN', 'RECEPCIONISTA', 'AUXILIAR'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN', 'RECEPCIONISTA', 'AUXILIAR'), ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
