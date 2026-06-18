const pool = require('../config/db');

const crearHabitacion = async (req, res) => {
  try {
    const {
      numero,
      tipo,
      descripcion,
      precio_noche,
      capacidad,
      estado,
      imagen_url
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
      (numero, tipo, descripcion, precio_noche, capacidad, estado, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        numero,
        tipo,
        descripcion || null,
        precio_noche,
        capacidad,
        estado || 'DISPONIBLE',
        imagen_url || null
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
        estado: estado || 'DISPONIBLE',
        imagen_url: imagen_url || null
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
        imagen_url,
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

// Lista habitaciones disponibles. Acepta filtros opcionales por query:
//   ?tipo=SUITE&capacidad=2&fecha_entrada=2026-07-01&fecha_salida=2026-07-04
// Si se envían fechas, excluye las que ya tienen reserva activa en ese rango.
const obtenerHabitacionesDisponibles = async (req, res) => {
  try {
    const { fecha_entrada, fecha_salida, tipo, capacidad } = req.query;

    // Se muestran todas las habitaciones EXCEPTO las INACTIVA.
    // (OCUPADA, MANTENIMIENTO y LIMPIEZA también aparecen en la web)
    let sql = `
      SELECT
        id_habitacion, numero, tipo, descripcion,
        precio_noche, capacidad, estado, imagen_url
      FROM habitaciones
      WHERE estado <> 'INACTIVA'`;
    const params = [];

    if (tipo) {
      sql += ' AND tipo = ?';
      params.push(tipo);
    }
    if (capacidad) {
      sql += ' AND capacidad >= ?';
      params.push(Number(capacidad));
    }
    if (fecha_entrada && fecha_salida) {
      sql += `
        AND id_habitacion NOT IN (
          SELECT id_habitacion FROM reservas
          WHERE estado IN ('PENDIENTE','CONFIRMADA','EN_CURSO')
          AND fecha_entrada < ? AND fecha_salida > ?
        )`;
      params.push(fecha_salida, fecha_entrada);
    }

    sql += ' ORDER BY precio_noche ASC';

    const [habitaciones] = await pool.query(sql, params);
    res.json(habitaciones);
  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Verifica si una habitación está libre en un rango de fechas (público).
const verificarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_entrada, fecha_salida } = req.query;

    if (!fecha_entrada || !fecha_salida) {
      return res.status(400).json({
        mensaje: 'Debes indicar fecha_entrada y fecha_salida'
      });
    }
    if (new Date(fecha_salida) <= new Date(fecha_entrada)) {
      return res.status(400).json({
        mensaje: 'La fecha de salida debe ser posterior a la de entrada'
      });
    }

    const [habitaciones] = await pool.query(
      'SELECT id_habitacion, estado FROM habitaciones WHERE id_habitacion = ?',
      [id]
    );
    if (habitaciones.length === 0) {
      return res.status(404).json({ mensaje: 'Habitación no encontrada' });
    }

    const [solapadas] = await pool.query(
      `SELECT id_reserva FROM reservas
       WHERE id_habitacion = ?
       AND estado IN ('PENDIENTE','CONFIRMADA','EN_CURSO')
       AND fecha_entrada < ? AND fecha_salida > ?`,
      [id, fecha_salida, fecha_entrada]
    );

    // Reservable si no está INACTIVA y no hay fechas solapadas
    const disponible = habitaciones[0].estado !== 'INACTIVA' && solapadas.length === 0;
    res.json({ disponible });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Devuelve los rangos de fechas ocupados de una habitación (público),
// para pintarlos en rojo / deshabilitarlos en el calendario del cliente.
const obtenerFechasOcupadas = async (req, res) => {
  try {
    const { id } = req.params;

    const [rangos] = await pool.query(
      `SELECT
        DATE_FORMAT(fecha_entrada, '%Y-%m-%d') AS fecha_entrada,
        DATE_FORMAT(fecha_salida, '%Y-%m-%d')  AS fecha_salida
       FROM reservas
       WHERE id_habitacion = ?
       AND estado IN ('PENDIENTE','CONFIRMADA','EN_CURSO')
       ORDER BY fecha_entrada`,
      [id]
    );

    res.json(rangos);
  } catch (error) {
    console.error('Error al obtener fechas ocupadas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Detalle PÚBLICO de una habitación (para la página de detalle del sitio web).
// No requiere autenticación. No muestra habitaciones INACTIVA.
const obtenerHabitacionPublica = async (req, res) => {
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
        imagen_url
      FROM habitaciones
      WHERE id_habitacion = ? AND estado <> 'INACTIVA'`,
      [id]
    );

    if (habitaciones.length === 0) {
      return res.status(404).json({
        mensaje: 'Habitación no encontrada'
      });
    }

    res.json(habitaciones[0]);
  } catch (error) {
    console.error('Error al obtener habitación pública:', error);
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
        imagen_url,
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
      estado,
      imagen_url
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
        estado = COALESCE(?, estado),
        imagen_url = COALESCE(?, imagen_url)
      WHERE id_habitacion = ?`,
      [
        numero || null,
        tipo || null,
        descripcion || null,
        precio_noche || null,
        capacidad || null,
        estado || null,
        imagen_url || null,
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

// Eliminación REAL de la BD (borra también sus reservas y pagos por cascada).
// Para sólo inhabilitar sin borrar, usa el estado INACTIVA (PUT).
const eliminarHabitacion = async (req, res) => {
  try {
    const { id } = req.params;

    const [habitaciones] = await pool.query(
      'SELECT id_habitacion FROM habitaciones WHERE id_habitacion = ?',
      [id]
    );

    if (habitaciones.length === 0) {
      return res.status(404).json({ mensaje: 'Habitación no encontrada' });
    }

    await pool.query('DELETE FROM habitaciones WHERE id_habitacion = ?', [id]);

    res.json({ mensaje: 'Habitación eliminada permanentemente' });
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  crearHabitacion,
  obtenerHabitaciones,
  obtenerHabitacionesDisponibles,
  verificarDisponibilidad,
  obtenerFechasOcupadas,
  obtenerHabitacionPublica,
  obtenerHabitacionPorId,
  actualizarHabitacion,
  eliminarHabitacion
};