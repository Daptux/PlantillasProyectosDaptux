// backend/src/routes/odontograma.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/odontograma.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

router.use(verificarToken);

router.get('/:pacienteId', permitirRoles('ODONTOLOGO', 'ADMIN', 'AUXILIAR'), ctrl.obtenerPorPaciente);
router.post('/', permitirRoles('ODONTOLOGO', 'ADMIN'), ctrl.guardar);
router.put('/:id', permitirRoles('ODONTOLOGO', 'ADMIN'), ctrl.actualizar);

module.exports = router;
