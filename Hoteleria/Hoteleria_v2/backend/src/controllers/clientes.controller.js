const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Campos públicos que siempre devolvemos de un cliente (nunca el password)
const CAMPOS_CLIENTE = `
  id_usuario,
  nombre,
  apellido,
  email,
  telefono,
  documento,
  rol,
  estado,
  fecha_creacion`;

// ADMIN / EMPLEADO crean un cliente. El password es opcional:
// si no lo mandan, se genera uno temporal con el documento o el email.
const crearCliente = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      telefono,
      documento
    } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        mensaje: 'Nombre y email son obligatorios'
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

    const passwordPlano = password || documento || email;
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const [resultado] = await pool.query(
      `INSERT INTO usuarios
      (nombre, apellido, email, password, telefono, documento, rol)
      VALUES (?, ?, ?, ?, ?, ?, 'CLIENTE')`,
      [
        nombre,
        apellido || null,
        email,
        passwordHash,
        telefono || null,
        documento || null
      ]
    );

    res.status(201).json({
      mensaje: 'Cliente creado correctamente',
      cliente: {
        id_usuario: resultado.insertId,
        nombre,
        apellido: apellido || null,
        email,
        telefono: telefono || null,
        documento: documento || null,
        rol: 'CLIENTE',
        estado: 'ACTIVO'
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query(
      `SELECT ${CAMPOS_CLIENTE}
       FROM usuarios
       WHERE rol = 'CLIENTE'
       ORDER BY fecha_creacion DESC`
    );

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Un CLIENTE solo puede consultar su propia información
    if (
      req.user.rol === 'CLIENTE' &&
      Number(id) !== req.user.id_usuario
    ) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para ver este cliente'
      });
    }

    const [clientes] = await pool.query(
      `SELECT ${CAMPOS_CLIENTE}
       FROM usuarios
       WHERE id_usuario = ? AND rol = 'CLIENTE'`,
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json(clientes[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      documento,
      estado
    } = req.body;

    const [clienteExiste] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'CLIENTE'",
      [id]
    );

    if (clienteExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
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
        estado = COALESCE(?, estado)
       WHERE id_usuario = ?`,
      [
        nombre || null,
        apellido || null,
        email || null,
        telefono || null,
        documento || null,
        estado || null,
        id
      ]
    );

    res.json({
      mensaje: 'Cliente actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Desactivación lógica (no se borra el registro)
const desactivarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const [clienteExiste] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'CLIENTE'",
      [id]
    );

    if (clienteExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    await pool.query(
      "UPDATE usuarios SET estado = 'INACTIVO' WHERE id_usuario = ?",
      [id]
    );

    res.json({
      mensaje: 'Cliente desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Eliminación REAL de la base de datos (borra también sus reservas y opiniones por cascada)
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const [clienteExiste] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'CLIENTE'",
      [id]
    );

    if (clienteExiste.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

    res.json({ mensaje: 'Cliente eliminado permanentemente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  desactivarCliente,
  eliminarCliente
};
