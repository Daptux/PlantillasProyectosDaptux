// frontend/src/hooks/useConfiguracion.js
// Carga la configuración pública de la clínica (nombre, teléfono, colores, etc.).

import { useEffect, useState } from 'react';
import { contenidoService } from '../services/contenidoService';

// Valores por defecto para que la landing nunca se vea vacía si la API falla.
const DEFAULTS = {
  nombre_clinica: 'OdontoAdmin Pro',
  eslogan: 'Sonrisas saludables, tratamientos confiables y atención personalizada',
  telefono: '+57 300 000 0000',
  whatsapp: '573000000000',
  correo: 'contacto@odontoadmin.com',
  direccion: 'Calle 123 #45-67, Bogotá, Colombia',
  horarios: 'Lun-Vie 8:00-18:00, Sáb 8:00-13:00',
  instagram_url: '',
  facebook_url: '',
};

export function useConfiguracion() {
  const [config, setConfig] = useState(DEFAULTS);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    contenidoService
      .obtenerConfiguracion()
      .then(({ data }) => {
        if (activo && data?.datos) setConfig({ ...DEFAULTS, ...data.datos });
      })
      .catch(() => {})
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  return { config, cargando };
}
