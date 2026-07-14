// backend/src/app.js
// Configuración de la aplicación Express: middlewares, rutas y manejo de errores.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { noEncontrado, manejadorErrores } = require('./middlewares/error.middleware');

// Rutas
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const odontologosRoutes = require('./routes/odontologos.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const citasRoutes = require('./routes/citas.routes');
const historiasRoutes = require('./routes/historias.routes');
const odontogramaRoutes = require('./routes/odontograma.routes');
const planesRoutes = require('./routes/planesTratamiento.routes');
const pagosRoutes = require('./routes/pagos.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const contenidoRoutes = require('./routes/contenidoWeb.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// ----- Middlewares globales -----
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true, mensaje: 'OdontoAdmin Pro API en línea 🦷' }));

// ----- Rutas de la API -----
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/odontologos', odontologosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/odontograma', odontogramaRoutes);
app.use('/api/planes', planesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/contenido', contenidoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ----- Manejo de errores -----
app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;
