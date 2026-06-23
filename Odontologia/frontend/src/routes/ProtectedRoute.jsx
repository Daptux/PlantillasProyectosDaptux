// frontend/src/routes/ProtectedRoute.jsx
// Protege rutas: exige sesión y opcionalmente un rol permitido.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { autenticado, cargando, tieneRol } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Cargando…
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length && !tieneRol(...roles)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-center px-6">
        <h1 className="text-2xl font-bold text-ink">Acceso denegado</h1>
        <p className="text-slate-500">No tienes permisos para ver este módulo.</p>
      </div>
    );
  }

  return children;
}
