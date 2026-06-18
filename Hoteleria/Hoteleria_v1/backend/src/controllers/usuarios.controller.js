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

module.exports = {
  obtenerPerfil,
  crearEmpleado,
  obtenerUsuarios
};