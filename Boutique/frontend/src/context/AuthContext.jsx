import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Verifica el token al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authService
      .profile()
      .then(({ user }) => persist(user))
      .catch(() => logout())
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(u) {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }

  async function login(email, password) {
    const { user, token } = await authService.login({ email, password });
    localStorage.setItem('token', token);
    persist(user);
    return user;
  }

  async function register(data) {
    const { user, token } = await authService.register(data);
    localStorage.setItem('token', token);
    persist(user);
    return user;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const isAuth = !!user;
  const isAdmin = user?.rol === 'ADMIN';
  const isStaff = user?.rol === 'ADMIN' || user?.rol === 'EMPLOYEE';

  return (
    <AuthContext.Provider value={{ user, loading, isAuth, isAdmin, isStaff, login, register, logout, setUser: persist }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
