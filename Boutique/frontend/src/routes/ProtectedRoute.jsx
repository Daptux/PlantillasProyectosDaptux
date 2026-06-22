import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';

// Requiere que el usuario esté autenticado
export default function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
