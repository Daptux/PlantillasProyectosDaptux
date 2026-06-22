import { createContext, useContext, useEffect, useState } from 'react';
import { adminService } from '../services/admin.service.js';

const StoreContext = createContext(null);

// Configuración pública de la tienda (nombre, whatsapp, redes, envío)
export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    adminService.getSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <StoreContext.Provider value={{ settings, setSettings }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
