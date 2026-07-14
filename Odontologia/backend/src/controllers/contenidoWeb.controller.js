// backend/src/controllers/contenidoWeb.controller.js
// Gestión del contenido visible en la landing: galería, testimonios, FAQs y configuración.
// Los GET de listados son públicos (solo elementos visibles); la edición requiere auth.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

/* ---------------------------- GALERIA ---------------------------- */
// GET /api/contenido/galeria  -> ?todos=1 para admin (incluye no visibles)
async function listarGaleria(req, res, next) {
  try {
    const soloVisibles = req.query.todos !== '1';
    const [rows] = await pool.query(
      `SELECT * FROM galeria ${soloVisibles ? 'WHERE visible = 1' : ''} ORDER BY orden ASC, id DESC`
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// POST /api/contenido/galeria
async function crearGaleria(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['imagen_url']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const { titulo = null, descripcion = null, imagen_url, categoria = null, orden = 0, visible = 1 } = req.body;
    const [result] = await pool.query(
      'INSERT INTO galeria (titulo, descripcion, imagen_url, categoria, orden, visible) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, imagen_url, categoria, orden, visible ? 1 : 0]
    );
    res.status(201).json({ ok: true, mensaje: 'Imagen agregada a la galería.', id: result.insertId });
  } catch (err) { next(err); }
}

// DELETE /api/contenido/galeria/:id
async function eliminarGaleria(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM galeria WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Imagen no encontrada.' });
    res.json({ ok: true, mensaje: 'Imagen eliminada.' });
  } catch (err) { next(err); }
}

/* -------------------------- TESTIMONIOS -------------------------- */
async function listarTestimonios(req, res, next) {
  try {
    const soloVisibles = req.query.todos !== '1';
    const [rows] = await pool.query(
      `SELECT * FROM testimonios ${soloVisibles ? 'WHERE visible = 1' : ''} ORDER BY id DESC`
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

async function crearTestimonio(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['nombre', 'comentario']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const { nombre, comentario, calificacion = 5, servicio = null, foto_url = null, visible = 1 } = req.body;
    const [result] = await pool.query(
      'INSERT INTO testimonios (nombre, comentario, calificacion, servicio, foto_url, visible) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, comentario, calificacion, servicio, foto_url, visible ? 1 : 0]
    );
    res.status(201).json({ ok: true, mensaje: 'Testimonio creado.', id: result.insertId });
  } catch (err) { next(err); }
}

async function eliminarTestimonio(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM testimonios WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Testimonio no encontrado.' });
    res.json({ ok: true, mensaje: 'Testimonio eliminado.' });
  } catch (err) { next(err); }
}

/* ------------------------------ FAQS ----------------------------- */
async function listarFaqs(req, res, next) {
  try {
    const soloVisibles = req.query.todos !== '1';
    const [rows] = await pool.query(
      `SELECT * FROM preguntas_frecuentes ${soloVisibles ? 'WHERE visible = 1' : ''} ORDER BY orden ASC, id ASC`
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

async function crearFaq(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['pregunta', 'respuesta']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const { pregunta, respuesta, orden = 0, visible = 1 } = req.body;
    const [result] = await pool.query(
      'INSERT INTO preguntas_frecuentes (pregunta, respuesta, orden, visible) VALUES (?, ?, ?, ?)',
      [pregunta, respuesta, orden, visible ? 1 : 0]
    );
    res.status(201).json({ ok: true, mensaje: 'Pregunta creada.', id: result.insertId });
  } catch (err) { next(err); }
}

async function eliminarFaq(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM preguntas_frecuentes WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Pregunta no encontrada.' });
    res.json({ ok: true, mensaje: 'Pregunta eliminada.' });
  } catch (err) { next(err); }
}

/* ------------------------ CONFIGURACION -------------------------- */
// GET /api/contenido/configuracion  -> devuelve objeto clave:valor
async function obtenerConfiguracion(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT clave, valor FROM configuracion_clinica');
    const config = {};
    for (const r of rows) config[r.clave] = r.valor;
    res.json({ ok: true, datos: config });
  } catch (err) { next(err); }
}

// PUT /api/contenido/configuracion  -> recibe objeto { clave: valor, ... } y hace upsert
async function actualizarConfiguracion(req, res, next) {
  try {
    const entradas = Object.entries(req.body || {});
    if (!entradas.length) return res.status(400).json({ ok: false, mensaje: 'Sin datos para actualizar.' });
    for (const [clave, valor] of entradas) {
      await pool.query(
        `INSERT INTO configuracion_clinica (clave, valor) VALUES (?, ?)
         ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`,
        [clave, valor]
      );
    }
    res.json({ ok: true, mensaje: 'Configuración actualizada.' });
  } catch (err) { next(err); }
}

module.exports = {
  listarGaleria, crearGaleria, eliminarGaleria,
  listarTestimonios, crearTestimonio, eliminarTestimonio,
  listarFaqs, crearFaq, eliminarFaq,
  obtenerConfiguracion, actualizarConfiguracion,
};
