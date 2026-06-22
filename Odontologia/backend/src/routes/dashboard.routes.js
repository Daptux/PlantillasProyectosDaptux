/**
 * backend/src/routes/dashboard.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

router.use(verificarToken);

router.get('/resumen', ctrl.resumen);
router.get('/reportes', permitirRoles('ADMIN', 'CAJA'), ctrl.reportes);
router.get('/seguimiento', permitirRoles('ADMIN', 'RECEPCIONISTA', 'ODONTOLOGO', 'CAJA'), ctrl.seguimiento);

module.exports = router;
