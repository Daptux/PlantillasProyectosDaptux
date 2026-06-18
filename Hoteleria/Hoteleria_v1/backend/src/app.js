const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const habitacionesRoutes = require('./routes/habitaciones.routes');
const reservasRoutes = require('./routes/reservas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de hotelería funcionando correctamente'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/dashboard', dashboardRoutes);


module.exports = app;