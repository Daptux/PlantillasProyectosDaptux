/**
 * frontend/src/hooks/useConfig.js
 * Carga la configuración pública de la clínica (nombre, contacto, colores, etc.).
 */
import { useEffect, useState } from 'react';
import { contenidoService } from '../services/contenidoService';

export function useConfig() {
  const [config, setConfig] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    contenidoService
      .configuracion()
      .then((res) => setConfig(res.data))
      .catch(() => setConfig(null))
      .finally(() => setCargando(false));
  }, []);

  return { config, cargando };
}
