// backend/src/routes/citas.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/citas.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

// Público: reserva desde la landing (queda en estado SOLICITADA)
router.post('/publica', ctrl.crearPublica);

// Protegido
router.use(verificarToken);

const GESTION = ['ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'AUXILIAR'];

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', permitirRoles(...GESTION), ctrl.crear);
router.put('/:id', permitirRoles(...GESTION), ctrl.actualizar);
router.patch('/:id/estado', permitirRoles(...GESTION), ctrl.cambiarEstado);
router.delete('/:id', permitirRoles('ADMIN', 'RECEPCIONISTA'), ctrl.eliminar);

module.exports = router;
