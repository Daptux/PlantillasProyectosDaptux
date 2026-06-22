/**
 * backend/src/routes/usuarios.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

// Todas las rutas requieren autenticación y rol administrativo
router.use(verificarToken);

router.get('/roles/all', ctrl.listarRoles);
router.get('/', permitirRoles('ADMIN'), ctrl.listar);
router.get('/:id', permitirRoles('ADMIN'), ctrl.obtener);
router.post('/', permitirRoles('ADMIN'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN'), ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
