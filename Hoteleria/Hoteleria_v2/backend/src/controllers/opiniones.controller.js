const pool = require('../config/db');

// Listado público de opiniones (las más recientes)
const obtenerOpiniones = async (req, res) => {
  try {
    const limite = Math.min(Number(req.query.limite) || 12, 50);

    const [opiniones] = await pool.query(
      `SELECT
        o.id_opinion,
        o.calificacion,
        o.comentario,
        DATE_FORMAT(o.fecha_creacion, '%Y-%m-%d') AS fecha,
        u.nombre,
        u.apellido
      FROM opiniones o
      INNER JOIN usuarios u ON o.id_usuario = u.id_usuario
      ORDER BY o.fecha_creacion DESC
      LIMIT ?`,
      [limite]
    );

    res.json(opiniones);
  } catch (error) {
    console.error('Error al obtener opiniones:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Un cliente escribe una opinión
const crearOpinion = async (req, res) => {
  try {
    const { calificacion, comentario } = req.body;
    const id_usuario = req.user.id_usuario;

    const cal = Number(calificacion);
    if (!cal || cal < 1 || cal > 5) {
      return res.status(400).json({ mensaje: 'La calificación debe estar entre 1 y 5 estrellas' });
    }
    if (!comentario || comentario.trim().length < 5) {
      return res.status(400).json({ mensaje: 'El comentario debe tener al menos 5 caracteres' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO opiniones (id_usuario, calificacion, comentario) VALUES (?, ?, ?)',
      [id_usuario, cal, comentario.trim()]
    );

    res.status(201).json({
      mensaje: 'Gracias por tu opinión',
      opinion: {
        id_opinion: resultado.insertId,
        calificacion: cal,
        comentario: comentario.trim(),
        nombre: req.user.nombre
      }
    });
  } catch (error) {
    console.error('Error al crear opinión:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

module.exports = { obtenerOpiniones, crearOpinion };
