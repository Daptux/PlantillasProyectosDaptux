/**
 * backend/src/routes/inventario.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventario.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

router.use(verificarToken);
const gestion = permitirRoles('ADMIN', 'AUXILIAR');
const lectura = permitirRoles('ADMIN', 'AUXILIAR', 'RECEPCIONISTA', 'ODONTOLOGO');

router.get('/proveedores/all', lectura, ctrl.listarProveedores);
router.get('/alertas/stock-bajo', lectura, ctrl.alertas);
router.get('/', lectura, ctrl.listar);
router.get('/:id', lectura, ctrl.obtener);
router.post('/', gestion, ctrl.crear);
router.put('/:id', gestion, ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);
router.post('/movimientos', gestion, ctrl.registrarMovimiento);

module.exports = router;
