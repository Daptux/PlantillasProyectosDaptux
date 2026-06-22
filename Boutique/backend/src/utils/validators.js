// Validaciones manuales reutilizables. Devuelven array de errores (vacío = válido).

export function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isNonEmpty(v) {
  return v !== undefined && v !== null && String(v).trim() !== '';
}

export function minLen(v, n) {
  return typeof v === 'string' && v.length >= n;
}

export function validateRegister(body) {
  const errors = [];
  if (!isNonEmpty(body.nombre)) errors.push('El nombre es obligatorio');
  if (!isEmail(body.email)) errors.push('Email inválido');
  if (!minLen(body.password || '', 6)) errors.push('La contraseña debe tener al menos 6 caracteres');
  return errors;
}

export function validateLogin(body) {
  const errors = [];
  if (!isEmail(body.email)) errors.push('Email inválido');
  if (!isNonEmpty(body.password)) errors.push('La contraseña es obligatoria');
  return errors;
}

export function validateProduct(body) {
  const errors = [];
  if (!isNonEmpty(body.nombre)) errors.push('El nombre del producto es obligatorio');
  if (body.precio === undefined || isNaN(Number(body.precio)) || Number(body.precio) < 0)
    errors.push('El precio es inválido');
  return errors;
}
