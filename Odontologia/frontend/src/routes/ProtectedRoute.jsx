/**
 * frontend/src/routes/ProtectedRoute.jsx
 * Protege rutas: exige sesión activa y, opcionalmente, ciertos roles.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { estaAutenticado, cargando, tieneRol } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!estaAutenticado) return <Navigate to="/login" replace />;

  if (roles && roles.length && !tieneRol(...roles)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-bold text-slate-800">Acceso denegado</h1>
        <p className="text-slate-500 mt-2">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return <Outlet />;
}
