/**
 * backend/src/routes/odontograma.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/odontograma.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

router.use(verificarToken);
const clinico = permitirRoles('ADMIN', 'ODONTOLOGO');

router.get('/:pacienteId', permitirRoles('ADMIN', 'ODONTOLOGO', 'AUXILIAR', 'RECEPCIONISTA'), ctrl.obtenerPorPaciente);
router.post('/', clinico, ctrl.guardar);
router.put('/:id', clinico, ctrl.actualizar);

module.exports = router;
