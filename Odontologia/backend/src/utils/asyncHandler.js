/**
 * backend/src/utils/asyncHandler.js
 * Envuelve controladores async y reenvía cualquier error al error middleware.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
