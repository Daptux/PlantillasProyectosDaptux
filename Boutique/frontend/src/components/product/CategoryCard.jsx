import { Link } from 'react-router-dom';
import { resolveImage } from '../../services/api.js';

const FALLBACK = {
  ropa: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
  zapatos: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  accesorios: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600',
  bolsos: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
  perfumes: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
  ofertas: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
};

export default function CategoryCard({ category }) {
  const img = category.imagen ? resolveImage(category.imagen) : (FALLBACK[category.slug] || FALLBACK.ropa);
  return (
    <Link to={`/tienda?categoria=${category.slug}`} className="group relative block h-56 overflow-hidden rounded-2xl">
      <img src={img} alt={category.nombre} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5">
        <h3 className="font-display text-xl font-semibold text-white">{category.nombre}</h3>
        <span className="text-sm text-neutral-200">{category.total_productos ?? ''} productos</span>
      </div>
    </Link>
  );
}
