// backend/api/index.js
// Entrada serverless para Vercel (proyecto API). Expone la app Express.
// Vercel enruta todo a esta función (ver backend/vercel.json). La app monta
// sus rutas bajo /api, por lo que la URL original se preserva.

module.exports = require('../src/app');
