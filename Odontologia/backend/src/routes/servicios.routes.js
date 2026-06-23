// backend/src/routes/servicios.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/servicios.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

// Público: servicios visibles en la landing
router.get('/publicos', ctrl.listarPublicos);

// Protegido (lectura para cualquier rol autenticado; escritura solo ADMIN)
router.use(verificarToken);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', permitirRoles('ADMIN'), ctrl.crear);
router.put('/:id', permitirRoles('ADMIN'), ctrl.actualizar);
router.delete('/:id', permitirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
