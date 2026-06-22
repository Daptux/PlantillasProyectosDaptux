/**
 * backend/src/controllers/contenidoWeb.controller.js
 * Gestión del contenido visible en la landing: galería, testimonios, FAQs y configuración.
 * Incluye endpoints públicos (solo registros visibles) y administrativos.
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');

// ----------------------- GALERÍA -----------------------
const listarGaleria = asyncHandler(async (req, res) => {
  const soloVisibles = req.query.publico === '1';
  const [rows] = await pool.query(
    `SELECT * FROM galeria ${soloVisibles ? 'WHERE visible = 1' : ''} ORDER BY orden, id`
  );
  res.json({ ok: true, data: rows });
});

const crearGaleria = asyncHandler(async (req, res) => {
  const { titulo, descripcion, imagen_url, categoria, orden, visible } = req.body;
  if (!imagen_url) return badRequest(res, 'imagen_url es requerida.');
  const [result] = await pool.query(
    `INSERT INTO galeria (titulo, descripcion, imagen_url, categoria, orden, visible)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [titulo || null, descripcion || null, imagen_url, categoria || 'general', orden || 0, visible === undefined ? 1 : (visible ? 1 : 0)]
  );
  res.status(201).json({ ok: true, mensaje: 'Imagen agregada.', id: result.insertId });
});

const eliminarGaleria = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM galeria WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Imagen no encontrada.' });
  res.json({ ok: true, mensaje: 'Imagen eliminada.' });
});

// ----------------------- TESTIMONIOS -----------------------
const listarTestimonios = asyncHandler(async (req, res) => {
  const soloVisibles = req.query.publico === '1';
  const [rows] = await pool.query(
    `SELECT * FROM testimonios ${soloVisibles ? 'WHERE visible = 1' : ''} ORDER BY created_at DESC`
  );
  res.json({ ok: true, data: rows });
});

const crearTestimonio = asyncHandler(async (req, res) => {
  const { nombre, comentario, calificacion, servicio, foto_url, visible } = req.body;
  const faltantes = camposRequeridos(req.body, ['nombre', 'comentario']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  const cal = Math.min(5, Math.max(1, Number(calificacion) || 5));
  const [result] = await pool.query(
    `INSERT INTO testimonios (nombre, comentario, calificacion, servicio, foto_url, visible)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, comentario, cal, servicio || null, foto_url || null, visible === undefined ? 1 : (visible ? 1 : 0)]
  );
  res.status(201).json({ ok: true, mensaje: 'Testimonio agregado.', id: result.insertId });
});

const eliminarTestimonio = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM testimonios WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Testimonio no encontrado.' });
  res.json({ ok: true, mensaje: 'Testimonio eliminado.' });
});

// ----------------------- FAQS -----------------------
const listarFaqs = asyncHandler(async (req, res) => {
  const soloVisibles = req.query.publico === '1';
  const [rows] = await pool.query(
    `SELECT * FROM preguntas_frecuentes ${soloVisibles ? 'WHERE visible = 1' : ''} ORDER BY orden, id`
  );
  res.json({ ok: true, data: rows });
});

const crearFaq = asyncHandler(async (req, res) => {
  const { pregunta, respuesta, orden, visible } = req.body;
  const faltantes = camposRequeridos(req.body, ['pregunta', 'respuesta']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  const [result] = await pool.query(
    'INSERT INTO preguntas_frecuentes (pregunta, respuesta, orden, visible) VALUES (?, ?, ?, ?)',
    [pregunta, respuesta, orden || 0, visible === undefined ? 1 : (visible ? 1 : 0)]
  );
  res.status(201).json({ ok: true, mensaje: 'Pregunta agregada.', id: result.insertId });
});

const eliminarFaq = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM preguntas_frecuentes WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Pregunta no encontrada.' });
  res.json({ ok: true, mensaje: 'Pregunta eliminada.' });
});

// ----------------------- CONFIGURACIÓN CLÍNICA (singleton) -----------------------
const obtenerConfiguracion = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM configuracion_clinica ORDER BY id LIMIT 1');
  res.json({ ok: true, data: rows[0] || null });
});

const actualizarConfiguracion = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id FROM configuracion_clinica ORDER BY id LIMIT 1');
  const editables = ['nombre_clinica', 'logo_url', 'telefono', 'whatsapp', 'correo', 'direccion',
    'ciudad', 'mapa_embed', 'horarios', 'color_primario', 'color_secundario', 'facebook',
    'instagram', 'tiktok', 'hero_titulo', 'hero_subtitulo', 'hero_imagen_url',
    'stat_pacientes', 'stat_experiencia', 'stat_tratamientos', 'stat_calificacion'];

  const campos = [];
  const valores = [];
  for (const c of editables) {
    if (req.body[c] !== undefined) { campos.push(`${c} = ?`); valores.push(req.body[c]); }
  }
  if (!campos.length) return badRequest(res, 'Nada que actualizar.');

  if (rows[0]) {
    valores.push(rows[0].id);
    await pool.query(`UPDATE configuracion_clinica SET ${campos.join(', ')} WHERE id = ?`, valores);
  } else {
    const cols = editables.filter((c) => req.body[c] !== undefined);
    await pool.query(
      `INSERT INTO configuracion_clinica (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      cols.map((c) => req.body[c])
    );
  }
  res.json({ ok: true, mensaje: 'Configuración actualizada.' });
});

module.exports = {
  listarGaleria, crearGaleria, eliminarGaleria,
  listarTestimonios, crearTestimonio, eliminarTestimonio,
  listarFaqs, crearFaq, eliminarFaq,
  obtenerConfiguracion, actualizarConfiguracion,
};
