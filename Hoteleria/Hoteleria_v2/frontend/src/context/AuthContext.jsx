import { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Cargamos el usuario guardado en localStorage al iniciar
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // Actualiza los datos del usuario en memoria + localStorage (tras editar perfil)
  const actualizarUsuarioLocal = (datos) => {
    setUsuario((prev) => {
      const nuevo = { ...prev, ...datos };
      localStorage.setItem('usuario', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const estaAutenticado = !!usuario && !!localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{ usuario, login, logout, estaAutenticado, actualizarUsuarioLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
