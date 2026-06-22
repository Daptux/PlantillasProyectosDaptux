import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';

// Requiere autenticación + uno de los roles permitidos
export default function RoleRoute({ roles = [], children }) {
  const { user, isAuth, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!isAuth) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
