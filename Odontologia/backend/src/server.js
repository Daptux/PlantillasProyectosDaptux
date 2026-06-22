/**
 * backend/src/server.js
 * Punto de entrada: arranca el servidor HTTP tras verificar la conexión a la BD.
 */
require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor OdontoAdmin Pro escuchando en http://localhost:${PORT}`);
      console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ No se pudo iniciar el servidor (revisa la conexión a MySQL):', err.message);
    process.exit(1);
  }
})();
