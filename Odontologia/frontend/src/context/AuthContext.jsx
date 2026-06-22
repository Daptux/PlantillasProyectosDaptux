/**
 * frontend/src/context/AuthContext.jsx
 * Maneja el estado de autenticación: token, usuario, login, logout y verificación.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  // Al montar, si hay token verifica que siga siendo válido
  useEffect(() => {
    async function verificar() {
      if (token) {
        try {
          const res = await authService.profile();
          setUsuario(res.usuario);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
        } catch {
          cerrarSesion();
        }
      }
      setCargando(false);
    }
    verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(correo, password) {
    const res = await authService.login(correo, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(res.usuario));
    setToken(res.token);
    setUsuario(res.usuario);
    return res;
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }

  const tieneRol = (...roles) =>
    usuario && (usuario.rol === 'SUPERADMIN' || roles.includes(usuario.rol));

  const value = {
    usuario,
    token,
    cargando,
    estaAutenticado: !!token && !!usuario,
    login,
    cerrarSesion,
    tieneRol,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
