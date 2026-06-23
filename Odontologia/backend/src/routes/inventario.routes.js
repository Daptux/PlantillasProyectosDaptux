// backend/src/routes/inventario.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventario.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

router.use(verificarToken);

const GESTION = ['ADMIN', 'AUXILIAR', 'RECEPCIONISTA'];

// Rutas específicas antes de las dinámicas (:id)
router.get('/alertas/stock-bajo', permitirRoles(...GESTION), ctrl.alertas);
router.post('/movimientos', permitirRoles(...GESTION), ctrl.registrarMovimiento);

router.get('/', permitirRoles(...GESTION), ctrl.listar);
router.get('/:id', permitirRoles(...GESTION), ctrl.obtener);
router.post('/', permitirRoles('ADMIN', 'AUXILIAR'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN', 'AUXILIAR'), ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
