/**
 * backend/src/routes/pagos.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pagos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

router.use(verificarToken);
const finanzas = permitirRoles('ADMIN', 'CAJA', 'RECEPCIONISTA');

router.get('/', finanzas, ctrl.listar);
router.post('/', finanzas, ctrl.crear);
router.get('/paciente/:pacienteId', finanzas, ctrl.porPaciente);
router.get('/saldo/:pacienteId', finanzas, ctrl.saldoPaciente);

module.exports = router;
