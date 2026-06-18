/**
 * Crea (o reactiva) el usuario ADMIN inicial del sistema.
 * Uso:  npm run create-admin
 *
 * Puedes sobreescribir los datos por variables de entorno:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE, ADMIN_APELLIDO
 */
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const ADMIN = {
  nombre: process.env.ADMIN_NOMBRE || 'Admin',
  apellido: process.env.ADMIN_APELLIDO || 'Principal',
  email: process.env.ADMIN_EMAIL || 'admin@hoteleria.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123*'
};

(async () => {
  try {
    const [existe] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [ADMIN.email]
    );

    const passwordHash = await bcrypt.hash(ADMIN.password, 10);

    if (existe.length > 0) {
      await pool.query(
        "UPDATE usuarios SET password = ?, rol = 'ADMIN', estado = 'ACTIVO' WHERE email = ?",
        [passwordHash, ADMIN.email]
      );
      console.log(`✔ Admin ya existía. Password reiniciado para: ${ADMIN.email}`);
    } else {
      await pool.query(
        `INSERT INTO usuarios (nombre, apellido, email, password, rol, estado)
         VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVO')`,
        [ADMIN.nombre, ADMIN.apellido, ADMIN.email, passwordHash]
      );
      console.log(`✔ Admin creado: ${ADMIN.email}`);
    }

    console.log(`  Email:    ${ADMIN.email}`);
    console.log(`  Password: ${ADMIN.password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear admin:', error.message);
    process.exit(1);
  }
})();
