// backend/src/utils/validarCampos.js
// Pequeñas utilidades de validación reutilizables (sin librerías externas).

// Verifica que todos los campos indicados existan y no estén vacíos.
// Devuelve un arreglo con los nombres de los campos faltantes.
function camposFaltantes(obj, requeridos = []) {
  return requeridos.filter((campo) => {
    const valor = obj[campo];
    return valor === undefined || valor === null || String(valor).trim() === '';
  });
}

// Valida formato de correo electrónico.
function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo || '').trim());
}

// Valida que el teléfono tenga entre 7 y 15 dígitos (permite + y espacios).
function esTelefonoValido(tel) {
  const limpio = String(tel || '').replace(/[\s()+-]/g, '');
  return /^\d{7,15}$/.test(limpio);
}

// Valida que un valor numérico no sea negativo.
function esNoNegativo(valor) {
  const n = Number(valor);
  return !Number.isNaN(n) && n >= 0;
}

// Valida que una fecha (YYYY-MM-DD) no esté en el pasado respecto a hoy.
function fechaNoPasada(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(`${fecha}T00:00:00`);
  return f >= hoy;
}

module.exports = {
  camposFaltantes,
  esCorreoValido,
  esTelefonoValido,
  esNoNegativo,
  fechaNoPasada,
};
