import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products = [], empty = 'No se encontraron productos.' }) {
  if (!products.length) {
    return <p className="py-16 text-center text-neutral-500">{empty}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
