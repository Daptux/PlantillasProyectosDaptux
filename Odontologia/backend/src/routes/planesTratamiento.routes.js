// backend/src/routes/planesTratamiento.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/planesTratamiento.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

router.use(verificarToken);

const GESTION = ['ODONTOLOGO', 'ADMIN'];
const LECTURA = ['ODONTOLOGO', 'ADMIN', 'RECEPCIONISTA', 'CAJA', 'AUXILIAR'];

router.get('/', permitirRoles(...LECTURA), ctrl.listar);
router.get('/:id', permitirRoles(...LECTURA), ctrl.obtener);
router.post('/', permitirRoles(...GESTION), ctrl.crear);
router.put('/:id', permitirRoles(...GESTION), ctrl.actualizar);
router.post('/:id/detalles', permitirRoles(...GESTION), ctrl.agregarDetalle);
router.put('/detalles/:id', permitirRoles(...GESTION), ctrl.actualizarDetalle);

module.exports = router;
