/**
 * backend/src/routes/auth.routes.js
 */
const express = require('express');
const router = express.Router();
const { login, profile } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.get('/profile', verificarToken, profile);

module.exports = router;
