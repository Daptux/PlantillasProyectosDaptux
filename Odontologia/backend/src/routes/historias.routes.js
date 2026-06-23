// backend/src/routes/historias.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/historias.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

router.use(verificarToken);

const CLINICO = ['ODONTOLOGO', 'ADMIN'];

router.get('/paciente/:pacienteId', permitirRoles('ODONTOLOGO', 'ADMIN', 'AUXILIAR'), ctrl.obtenerPorPaciente);
router.get('/evoluciones/:pacienteId', permitirRoles('ODONTOLOGO', 'ADMIN', 'AUXILIAR'), ctrl.listarEvoluciones);
router.post('/', permitirRoles(...CLINICO), ctrl.crear);
router.post('/evoluciones', permitirRoles(...CLINICO), ctrl.crearEvolucion);

module.exports = router;
