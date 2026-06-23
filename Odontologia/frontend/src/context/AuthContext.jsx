// frontend/src/context/AuthContext.jsx
// Maneja sesión: token, usuario, login, logout y verificación.

import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, restaura la sesión desde localStorage.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const guardado = localStorage.getItem('usuario');
    if (token && guardado) {
      setUsuario(JSON.parse(guardado));
    }
    setCargando(false);
  }, []);

  async function login(correo, password) {
    const { data } = await authService.login(correo, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  // Verifica si el usuario tiene alguno de los roles indicados (SUPERADMIN siempre pasa).
  function tieneRol(...roles) {
    if (!usuario) return false;
    if (usuario.rol === 'SUPERADMIN') return true;
    return roles.includes(usuario.rol);
  }

  const valor = { usuario, cargando, login, logout, tieneRol, autenticado: !!usuario };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
