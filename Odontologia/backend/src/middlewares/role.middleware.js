// backend/src/middlewares/role.middleware.js
// Restringe el acceso a una ruta según el rol del usuario autenticado.
// Uso: router.get('/', verificarToken, permitirRoles('ADMIN', 'SUPERADMIN'), handler)
// SUPERADMIN siempre tiene acceso total.

function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado.' });
    }

    const rol = req.usuario.rol;
    if (rol === 'SUPERADMIN' || rolesPermitidos.includes(rol)) {
      return next();
    }

    return res.status(403).json({
      ok: false,
      mensaje: 'No tienes permisos para realizar esta acción.',
    });
  };
}

module.exports = permitirRoles;
