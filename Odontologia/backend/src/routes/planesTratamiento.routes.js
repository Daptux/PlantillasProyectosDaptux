/**
 * backend/src/routes/planesTratamiento.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/planesTratamiento.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

router.use(verificarToken);
const clinico = permitirRoles('ADMIN', 'ODONTOLOGO');
const lectura = permitirRoles('ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA', 'CAJA');

router.get('/', lectura, ctrl.listar);
router.get('/:id', lectura, ctrl.obtener);
router.post('/', clinico, ctrl.crear);
router.put('/:id', clinico, ctrl.actualizar);
router.post('/:id/detalles', clinico, ctrl.agregarDetalle);
router.put('/detalles/:id', clinico, ctrl.actualizarDetalle);
router.delete('/detalles/:id', clinico, ctrl.eliminarDetalle);

module.exports = router;
