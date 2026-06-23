// frontend/src/pages/public/Galeria.jsx
import { useEffect, useState } from 'react';
import { contenidoService } from '../../services/contenidoService';
import Loader from '../../components/common/Loader';

export default function Galeria() {
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    contenidoService.listarGaleria()
      .then(({ data }) => setImagenes(data.datos || []))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-ink">Galería</h1>
        <p className="mt-2 text-slate-500">Conoce nuestras instalaciones y resultados.</p>
      </div>
      {cargando ? (
        <Loader />
      ) : imagenes.length === 0 ? (
        <p className="text-center text-slate-500">Aún no hay imágenes publicadas.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {imagenes.map((g) => (
            <div key={g.id} className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <img src={g.imagen_url} alt={g.titulo || 'Galería'} className="h-full w-full object-cover transition hover:scale-105" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
