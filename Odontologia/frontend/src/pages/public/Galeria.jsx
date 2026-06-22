/**
 * frontend/src/pages/public/Galeria.jsx
 */
import { useEffect, useState } from 'react';
import { contenidoService } from '../../services/contenidoService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function Galeria() {
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    contenidoService.galeria(true).then((r) => setImagenes(r.data)).finally(() => setCargando(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800">Galería</h1>
        <p className="text-slate-500 mt-3">Conoce nuestras instalaciones y resultados.</p>
      </div>

      {cargando ? (
        <Loader />
      ) : imagenes.length === 0 ? (
        <EmptyState mensaje="Pronto compartiremos nuestra galería." icono="🖼️" />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {imagenes.map((img) => (
            <div key={img.id} className="break-inside-avoid card overflow-hidden">
              <img src={img.imagen_url} alt={img.titulo || 'galería'} className="w-full object-cover" />
              {img.titulo && <p className="p-3 text-sm font-medium text-slate-700">{img.titulo}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
