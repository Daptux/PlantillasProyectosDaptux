const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
};

const register = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      telefono,
      documento
    } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        mensaje: 'Nombre, email y contraseña son obligatorios'
      });
    }

    const [usuarioExistente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({
        mensaje: 'El email ya está registrado'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

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
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        id_usuario: resultado.insertId,
        nombre,
        apellido: apellido || null,
        email,
        telefono: telefono || null,
        documento: documento || null,
        rol: 'CLIENTE'
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        mensaje: 'Email y contraseña son obligatorios'
      });
    }

    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND estado = "ACTIVO"',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    const usuario = usuarios[0];

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        documento: usuario.documento,
        rol: usuario.rol,
        cargo: usuario.cargo
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

module.exports = {
  register,
  login
};