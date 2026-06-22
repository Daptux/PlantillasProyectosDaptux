// Ejecuta una función validadora (body) => string[] y corta si hay errores.
export function validate(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body || {});
    if (errors.length) {
      return res.status(422).json({ message: 'Datos inválidos', errors });
    }
    next();
  };
}
