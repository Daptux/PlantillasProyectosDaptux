import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protege rutas: exige token y (opcionalmente) un rol permitido.
// Uso: <ProtectedRoute roles={['ADMIN','EMPLEADO']}><Pagina/></ProtectedRoute>
export default function ProtectedRoute({ children, roles }) {
  const { usuario, estaAutenticado } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    // Autenticado pero sin permiso para esta ruta
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
