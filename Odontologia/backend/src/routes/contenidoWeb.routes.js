/**
 * backend/src/routes/contenidoWeb.routes.js
 * Endpoints públicos (con ?publico=1) y administrativos del contenido web.
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contenidoWeb.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/role.middleware');

const admin = [verificarToken, permitirRoles('ADMIN')];

// ---- GALERÍA ----
router.get('/galeria', ctrl.listarGaleria);                 // ?publico=1 para landing
router.post('/galeria', admin, ctrl.crearGaleria);
router.delete('/galeria/:id', admin, ctrl.eliminarGaleria);

// ---- TESTIMONIOS ----
router.get('/testimonios', ctrl.listarTestimonios);
router.post('/testimonios', admin, ctrl.crearTestimonio);
router.delete('/testimonios/:id', admin, ctrl.eliminarTestimonio);

// ---- FAQS ----
router.get('/faqs', ctrl.listarFaqs);
router.post('/faqs', admin, ctrl.crearFaq);
router.delete('/faqs/:id', admin, ctrl.eliminarFaq);

// ---- CONFIGURACIÓN ----
router.get('/configuracion', ctrl.obtenerConfiguracion);     // pública (landing)
router.put('/configuracion', admin, ctrl.actualizarConfiguracion);

module.exports = router;
