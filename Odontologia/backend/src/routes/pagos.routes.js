// backend/src/routes/pagos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pagos.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

router.use(verificarToken);

const FINANZAS = ['CAJA', 'ADMIN', 'RECEPCIONISTA'];

router.get('/', permitirRoles(...FINANZAS), ctrl.listar);
router.post('/', permitirRoles(...FINANZAS), ctrl.crear);
router.get('/paciente/:pacienteId', permitirRoles(...FINANZAS), ctrl.porPaciente);
router.get('/saldo/:pacienteId', permitirRoles(...FINANZAS, 'ODONTOLOGO'), ctrl.saldo);

module.exports = router;
