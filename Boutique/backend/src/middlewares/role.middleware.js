// Restringe el acceso a roles específicos.
// Uso: router.get('/x', authRequired, requireRole('ADMIN'), handler)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

// Atajos
export const adminOnly = requireRole('ADMIN');
export const staffOnly = requireRole('ADMIN', 'EMPLOYEE'); // admin o empleado
