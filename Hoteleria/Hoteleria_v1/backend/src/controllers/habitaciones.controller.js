const pool = require('../config/db');

const crearHabitacion = async (req, res) => {
  try {
    const {
      numero,
      tipo,
      descripcion,
      precio_noche,
      capacidad,
      estado
    } = req.body;

    if (!numero || !tipo || !precio_noche || !capacidad) {
      return res.status(400).json({
        mensaje: 'Número, tipo, precio por noche y capacidad son obligatorios'
      });
    }

    const [existeHabitacion] = await pool.query(
      'SELECT id_habitacion FROM habitaciones WHERE numero = ?',
      [numero]
    );

    if (existeHabitacion.length > 0) {
      return res.status(409).json({
        mensaje: 'Ya existe una habitación con ese número'
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO habitaciones 
      (numero, tipo, descripcion, precio_noche, capacidad, estado)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        numero,
        tipo,
        descripcion || null,
        precio_noche,
        capacidad,
        estado || 'DISPONIBLE'
      ]
    );

    res.status(201).json({
      mensaje: 'Habitación creada correctamente',
      habitacion: {
        id_habitacion: resultado.insertId,
        numero,
        tipo,
        descripcion: descripcion || null,
        precio_noche,
        capacidad,
        estado: estado || 'DISPONIBLE'
      }
    });
  } catch (error) {
    console.error('Error al crear habitación:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerHabitaciones = async (req, res) => {
  try {
    const [habitaciones] = await pool.query(
      `SELECT 
        id_habitacion,
        numero,
        tipo,
        descripcion,
        precio_noche,
        capacidad,
        estado,
        fecha_creacion
      FROM habitaciones
      ORDER BY numero ASC`
    );

    res.json(habitaciones);
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerHabitacionesDisponibles = async (req, res) => {
  try {
    const [habitaciones] = await pool.query(
      `SELECT 
        id_habitacion,
        numero,
        tipo,
        descripcion,
        precio_noche,
        capacidad,
        estado
      FROM habitaciones
      WHERE estado = 'DISPONIBLE'
      ORDER BY precio_noche ASC`
    );

    res.json(habitaciones);
  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const obtenerHabitacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [habitaciones] = await pool.query(
      `SELECT 
        id_habitacion,
        numero,
        tipo,
        descripcion,
        precio_noche,
        capacidad,
        estado,
        fecha_creacion
      FROM habitaciones
      WHERE id_habitacion = ?`,
      [id]
    );

    if (habitaciones.length === 0) {
      return res.status(404).json({
        mensaje: 'Habitación no encontrada'
      });
    }

    res.json(habitaciones[0]);
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

const actualizarHabitacion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      numero,
      tipo,
      descripcion,
      precio_noche,
      capacidad,
      estado
    } = req.body;

    const [habitacionExiste] = await pool.query(
      'SELECT id_habitacion FROM habitaciones WHERE id_habitacion = ?',
      [id]
    );

    if (habitacionExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Habitación no encontrada'
      });
    }

    if (numero) {
      const [numeroExiste] = await pool.query(
        'SELECT id_habitacion FROM habitaciones WHERE numero = ? AND id_habitacion != ?',
        [numero, id]
      );

      if (numeroExiste.length > 0) {
        return res.status(409).json({
          mensaje: 'Ya existe otra habitación con ese número'
        });
      }
    }

    await pool.query(
      `UPDATE habitaciones SET
        numero = COALESCE(?, numero),
        tipo = COALESCE(?, tipo),
        descripcion = COALESCE(?, descripcion),
        precio_noche = COALESCE(?, precio_noche),
        capacidad = COALESCE(?, capacidad),
        estado = COALESCE(?, estado)
      WHERE id_habitacion = ?`,
      [
        numero || null,
        tipo || null,
        descripcion || null,
        precio_noche || null,
        capacidad || null,
        estado || null,
        id
      ]
    );

    res.json({
      mensaje: 'Habitación actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar habitación:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarHabitacion = async (req, res) => {
  try {
    const { id } = req.params;

    const [habitacionExiste] = await pool.query(
      'SELECT id_habitacion FROM habitaciones WHERE id_habitacion = ?',
      [id]
    );

    if (habitacionExiste.length === 0) {
      return res.status(404).json({
        mensaje: 'Habitación no encontrada'
      });
    }

    await pool.query(
      'DELETE FROM habitaciones WHERE id_habitacion = ?',
      [id]
    );

    res.json({
      mensaje: 'Habitación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearHabitacion,
  obtenerHabitaciones,
  obtenerHabitacionesDisponibles,
  obtenerHabitacionPorId,
  actualizarHabitacion,
  eliminarHabitacion
};