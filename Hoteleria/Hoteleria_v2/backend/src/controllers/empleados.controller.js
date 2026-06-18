const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const CAMPOS_EMPLEADO = `
  id_usuario,
  nombre,
  apellido,
  email,
  telefono,
  documento,
  rol,
  cargo,
  estado,
  fecha_creacion`;

const crearEmpleado = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      telefono,
      documento,
      cargo
    } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        mensaje: 'Nombre, email y contraseña son obligatorios'
      });
    }

    const [existeEmail] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (existeEmail.length > 0) {
      return res.status(409).json({
        mensaje: 'El email ya está registrado'
      });
    }

    if (documento) {
      const [existeDoc] = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE documento = ?',
        [documento]
      );
      if (existeDoc.length > 0) {
        return res.status(409).json({
          mensaje: 'El documento ya está registrado'
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultado] = await pool.query(
      `INSERT INTO usuarios
      (nombre, apellido, email, password, telefono, documento, rol, cargo)
      VALUES (?, ?, ?, ?, ?, ?, 'EMPLEADO', ?)`,
      [
        nombre,
        apellido || null,
        email,
        passwordHash,
        telefono || null,
        documento || null,
        cargo || null
      ]
    );

    res.status(201).json({
      mensaje: 'Empleado creado correctamente',
      empleado: {
        id_usuario: resultado.insertId,
        nombre,
        apellido: apellido || null,
        email,
        telefono: telefono || null,
        documento: documento || null,
        rol: 'EMPLEADO',
        cargo: cargo || null,
        estado: 'ACTIVO'
      }
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerEmpleados = async (req, res) => {
  try {
    const [empleados] = await pool.query(
      `SELECT ${CAMPOS_EMPLEADO}
       FROM usuarios
       WHERE rol = 'EMPLEADO'
       ORDER BY fecha_creacion DESC`
    );

    res.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerEmpleadoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [empleados] = await pool.query(
      `SELECT ${CAMPOS_EMPLEADO}
       FROM usuarios
       WHERE id_usuario = ? AND rol = 'EMPLEADO'`,
      [id]
    );

    if (empleados.length === 0) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json(empleados[0]);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      documento,
      cargo,
      estado
    } = req.body;

    const [empleadoExiste] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'EMPLEADO'",
      [id]
    );

    if (empleadoExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    if (estado && !['ACTIVO', 'INACTIVO'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido (ACTIVO o INACTIVO)' });
    }

    if (email) {
      const [emailExiste] = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
        [email, id]
      );
      if (emailExiste.length > 0) {
        return res.status(409).json({
          mensaje: 'El email ya está en uso por otro usuario'
        });
      }
    }

    if (documento) {
      const [docExiste] = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE documento = ? AND id_usuario != ?',
        [documento, id]
      );
      if (docExiste.length > 0) {
        return res.status(409).json({
          mensaje: 'El documento ya está en uso por otro usuario'
        });
      }
    }

    await pool.query(
      `UPDATE usuarios SET
        nombre = COALESCE(?, nombre),
        apellido = COALESCE(?, apellido),
        email = COALESCE(?, email),
        telefono = COALESCE(?, telefono),
        documento = COALESCE(?, documento),
        cargo = COALESCE(?, cargo),
        estado = COALESCE(?, estado)
       WHERE id_usuario = ?`,
      [
        nombre || null,
        apellido || null,
        email || null,
        telefono || null,
        documento || null,
        cargo || null,
        estado || null,
        id
      ]
    );

    res.json({
      mensaje: 'Empleado actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const desactivarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const [empleadoExiste] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'EMPLEADO'",
      [id]
    );

    if (empleadoExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    await pool.query(
      "UPDATE usuarios SET estado = 'INACTIVO' WHERE id_usuario = ?",
      [id]
    );

    res.json({
      mensaje: 'Empleado desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al desactivar empleado:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Eliminación REAL de la base de datos (no se puede deshacer)
const eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const [empleadoExiste] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'EMPLEADO'",
      [id]
    );

    if (empleadoExiste.length === 0) {
      return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    }

    await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

    res.json({ mensaje: 'Empleado eliminado permanentemente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  crearEmpleado,
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  desactivarEmpleado,
  eliminarEmpleado
};
