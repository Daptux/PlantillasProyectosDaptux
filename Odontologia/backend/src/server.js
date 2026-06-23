// backend/src/server.js
// Punto de entrada: verifica la conexión a MySQL y levanta el servidor HTTP.

require('dotenv').config();
const app = require('./app');
const { verificarConexion } = require('./config/db');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await verificarConexion();
    app.listen(PORT, () => {
      console.log(`🚀 OdontoAdmin Pro API escuchando en http://localhost:${PORT}`);
      console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
})();
