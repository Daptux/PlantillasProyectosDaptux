// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { login, perfil } = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Público
router.post('/login', login);

// Protegido
router.get('/profile', verificarToken, perfil);

module.exports = router;
