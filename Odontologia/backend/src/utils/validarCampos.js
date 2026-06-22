/**
 * backend/src/utils/validarCampos.js
 * Utilidades de validación reutilizables en los controladores.
 */

/** Valida que los campos requeridos estén presentes y no vacíos. */
function camposRequeridos(body, campos) {
  const faltantes = [];
  for (const campo of campos) {
    const valor = body[campo];
    if (valor === undefined || valor === null || String(valor).trim() === '') {
      faltantes.push(campo);
    }
  }
  return faltantes;
}

/** Valida formato de correo electrónico. */
function esCorreoValido(correo) {
  if (!correo) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).trim());
}

/** Valida un teléfono (7 a 15 dígitos, permite +, espacios y guiones). */
function esTelefonoValido(telefono) {
  if (!telefono) return false;
  const limpio = String(telefono).replace(/[\s\-()]/g, '');
  return /^\+?\d{7,15}$/.test(limpio);
}

/** Valida que una fecha (YYYY-MM-DD) no sea anterior a hoy. */
function fechaNoPasada(fecha) {
  if (!fecha) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(`${fecha}T00:00:00`);
  return f >= hoy;
}

/** Error helper para responder de forma uniforme. */
function badRequest(res, mensaje, extra = {}) {
  return res.status(400).json({ ok: false, mensaje, ...extra });
}

module.exports = {
  camposRequeridos,
  esCorreoValido,
  esTelefonoValido,
  fechaNoPasada,
  badRequest,
};
