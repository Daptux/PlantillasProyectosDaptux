import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveImage } from '../../services/api.js';

// Carrusel simple de banners
export default function HeroBanner({ banners = [] }) {
  const [idx, setIdx] = useState(0);
  const slides = banners.length ? banners : [{
    titulo: 'Nueva Colección', subtitulo: 'Descubre lo último en moda',
    imagen: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
    texto_boton: 'Comprar', enlace: '/tienda',
  }];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const b = slides[idx];
  return (
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
      {slides.map((s, i) => (
        <img
          key={i}
          src={resolveImage(s.imagen)}
          alt={s.titulo || 'banner'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
      <div className="container-max relative flex h-full flex-col justify-center">
        <div className="max-w-xl animate-fadeUp text-white">
          {b.subtitulo && <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">{b.subtitulo}</p>}
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{b.titulo}</h1>
          {b.texto_boton && (
            <Link to={b.enlace || '/tienda'} className="btn-accent mt-7 w-fit text-base">{b.texto_boton}</Link>
          )}
        </div>
      </div>

      {/* indicadores */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-accent' : 'w-2 bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
