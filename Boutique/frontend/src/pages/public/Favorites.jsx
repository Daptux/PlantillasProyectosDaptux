import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoHeartOutline } from 'react-icons/io5';
import { favoriteService } from '../../services/product.service.js';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';

export default function Favorites() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    favoriteService
      .list()
      .then((data) => setProducts(data || []))
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar tus favoritos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-max py-10">
      <div className="mb-8 flex items-center gap-3">
        <IoHeartOutline size={34} className="text-accent-dark" />
        <h1 className="font-display text-3xl font-bold">Mis favoritos</h1>
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      {loading ? (
        <Loader label="Cargando favoritos..." />
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <IoHeartOutline size={48} className="text-neutral-300" />
          <div>
            <p className="font-display text-lg font-semibold">Aún no tienes favoritos</p>
            <p className="mt-1 text-sm text-neutral-500">
              Guarda las prendas que más te gusten para encontrarlas fácilmente.
            </p>
          </div>
          <Button as={Link} to="/tienda" variant="primary">
            Explorar la tienda
          </Button>
        </div>
      ) : (
        <ProductGrid products={products} empty="No tienes productos favoritos." />
      )}
    </div>
  );
}
