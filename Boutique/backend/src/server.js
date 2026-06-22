import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';

async function start() {
  try {
    await testConnection();
    app.listen(env.port, () => {
      console.log(`🚀 API escuchando en http://localhost:${env.port}`);
      console.log(`   Frontend permitido: ${env.frontendUrl}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a MySQL. Revisa tu .env y que XAMPP/MySQL esté activo.');
    console.error(err.message);
    process.exit(1);
  }
}

start();
