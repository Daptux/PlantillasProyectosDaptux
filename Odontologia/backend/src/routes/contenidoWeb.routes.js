// backend/src/routes/contenidoWeb.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contenidoWeb.controller');
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');

// ---- Rutas PÚBLICAS (solo lectura de elementos visibles) ----
router.get('/galeria', ctrl.listarGaleria);
router.get('/testimonios', ctrl.listarTestimonios);
router.get('/faqs', ctrl.listarFaqs);
router.get('/configuracion', ctrl.obtenerConfiguracion);

// ---- Rutas PROTEGIDAS (edición, solo ADMIN) ----
router.use(verificarToken, permitirRoles('ADMIN'));

router.post('/galeria', ctrl.crearGaleria);
router.delete('/galeria/:id', ctrl.eliminarGaleria);

router.post('/testimonios', ctrl.crearTestimonio);
router.delete('/testimonios/:id', ctrl.eliminarTestimonio);

router.post('/faqs', ctrl.crearFaq);
router.delete('/faqs/:id', ctrl.eliminarFaq);

router.put('/configuracion', ctrl.actualizarConfiguracion);

module.exports = router;
