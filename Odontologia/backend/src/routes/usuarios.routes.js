// backend/src/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuarios.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

// Solo ADMIN/SUPERADMIN gestionan usuarios
router.use(verificarToken, permitirRoles('ADMIN'));

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
