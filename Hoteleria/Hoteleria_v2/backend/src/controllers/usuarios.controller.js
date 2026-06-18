const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const obtenerPerfil = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id_usuario,
        nombre,
        apellido,
        email,
        telefono,
        documento,
        rol,
        cargo,
        estado,
        fecha_creacion
      FROM usuarios
      WHERE id_usuario = ?`,
      [req.user.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Actualiza los datos del PROPIO usuario autenticado (cualquier rol).
// No permite cambiar rol, cargo ni estado desde aquí.
const actualizarPerfil = async (req, res) => {
  try {
    const id = req.user.id_usuario;
    const { nombre, apellido, email, telefono, documento, password } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        mensaje: 'Nombre y email son obligatorios'
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const [emailExiste] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
      [email, id]
    );
    if (emailExiste.length > 0) {
      return res.status(409).json({
        mensaje: 'El email ya está en uso por otro usuario'
      });
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

    // Solo se actualiza la contraseña si se envía una nueva
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    await pool.query(
      `UPDATE usuarios SET
        nombre = ?,
        apellido = ?,
        email = ?,
        telefono = ?,
        documento = ?,
        password = COALESCE(?, password)
      WHERE id_usuario = ?`,
      [
        nombre,
        apellido || null,
        email,
        telefono || null,
        documento || null,
        passwordHash,
        id
      ]
    );

    const [usuarios] = await pool.query(
      `SELECT id_usuario, nombre, apellido, email, telefono, documento, rol, cargo, estado, fecha_creacion
       FROM usuarios WHERE id_usuario = ?`,
      [id]
    );

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      usuario: usuarios[0]
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

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

    const [existeUsuario] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (existeUsuario.length > 0) {
      return res.status(409).json({
        mensaje: 'El email ya está registrado'
      });
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
        cargo: cargo || null
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

const obtenerUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id_usuario,
        nombre,
        apellido,
        email,
        telefono,
        documento,
        rol,
        cargo,
        estado,
        fecha_creacion
      FROM usuarios
      ORDER BY fecha_creacion DESC`
    );

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query(
      `SELECT
        id_usuario,
        nombre,
        apellido,
        email,
        telefono,
        documento,
        rol,
        cargo,
        estado,
        fecha_creacion
      FROM usuarios
      WHERE id_usuario = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const actualizarUsuario = async (req, res) => {
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

    const [usuarioExiste] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
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

    if (estado && !['ACTIVO', 'INACTIVO'].includes(estado)) {
      return res.status(400).json({
        mensaje: 'Estado inválido. Use ACTIVO o INACTIVO'
      });
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
      mensaje: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Desactivación lógica. Un ADMIN no puede desactivarse a sí mismo.
const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id_usuario) {
      return res.status(400).json({
        mensaje: 'No puedes desactivar tu propia cuenta'
      });
    }

    const [usuarioExiste] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    await pool.query(
      "UPDATE usuarios SET estado = 'INACTIVO' WHERE id_usuario = ?",
      [id]
    );

    res.json({
      mensaje: 'Usuario desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  crearEmpleado,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  desactivarUsuario
};