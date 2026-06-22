/**
 * backend/src/routes/historias.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/historias.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

router.use(verificarToken);
const clinico = permitirRoles('ADMIN', 'ODONTOLOGO');
const lectura = permitirRoles('ADMIN', 'ODONTOLOGO', 'AUXILIAR', 'RECEPCIONISTA');

router.get('/paciente/:pacienteId', lectura, ctrl.obtenerPorPaciente);
router.get('/evoluciones/:pacienteId', lectura, ctrl.listarEvoluciones);
router.post('/', clinico, ctrl.crearOActualizar);
router.post('/evoluciones', clinico, ctrl.crearEvolucion);

module.exports = router;
