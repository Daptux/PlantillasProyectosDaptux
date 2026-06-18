const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const clientesRoutes = require('./routes/clientes.routes');
const empleadosRoutes = require('./routes/empleados.routes');
const habitacionesRoutes = require('./routes/habitaciones.routes');
const reservasRoutes = require('./routes/reservas.routes');
const pagosRoutes = require('./routes/pagos.routes');
const opinionesRoutes = require('./routes/opiniones.routes');
const uploadRoutes = require('./routes/upload.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { uploadDir } = require('./config/upload');


const app = express();

app.use(cors());
app.use(express.json());

// Servir las imágenes subidas (carpeta física backend/uploads)
app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de hotelería funcionando correctamente'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/opiniones', opinionesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);


module.exports = app;