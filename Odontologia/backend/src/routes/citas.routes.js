/**
 * backend/src/routes/citas.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/citas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

// Pública: solicitud de cita desde la landing
router.post('/solicitud', ctrl.solicitudPublica);

// Protegidas
router.use(verificarToken);
const gestion = permitirRoles('ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR');

router.get('/', gestion, ctrl.listar);
router.get('/:id', gestion, ctrl.obtener);
router.post('/', permitirRoles('ADMIN', 'RECEPCIONISTA', 'AUXILIAR'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN', 'RECEPCIONISTA', 'AUXILIAR'), ctrl.actualizar);
router.patch('/:id/estado', gestion, ctrl.cambiarEstado);
router.delete('/:id', permitirRoles('ADMIN', 'RECEPCIONISTA'), ctrl.eliminar);

module.exports = router;
