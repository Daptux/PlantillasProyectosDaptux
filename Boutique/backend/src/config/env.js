import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'boutique_ecommerce',
    port: Number(process.env.DB_PORT) || 3306,
  },
  jwtSecret: process.env.JWT_SECRET || 'cambia_esta_clave',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
