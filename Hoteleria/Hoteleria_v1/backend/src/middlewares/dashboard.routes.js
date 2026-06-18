const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
  obtenerResumenDashboard
} = require('../controllers/dashboard.controller');

router.get(
  '/resumen',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  obtenerResumenDashboard
);

module.exports = router;