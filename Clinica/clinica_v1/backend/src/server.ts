import app from "./app";
import { env } from "./config/env";
import { testConnection } from "./config/db";

async function bootstrap() {
  try {
    await testConnection();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 API clinica-app escuchando en http://localhost:${env.port}`);
      console.log(`   Healthcheck: http://localhost:${env.port}/api/health`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ No se pudo iniciar el servidor:", (err as Error).message);
    console.error("   Revisa que MySQL este corriendo y que el .env sea correcto.");
    process.exit(1);
  }
}

bootstrap();
