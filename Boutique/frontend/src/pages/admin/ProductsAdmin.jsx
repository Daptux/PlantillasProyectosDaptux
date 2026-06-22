import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoAddOutline, IoSearchOutline, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { productService } from '../../services/product.service.js';
import { resolveImage } from '../../services/api.js';
import { formatPrice } from '../../utils/format.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

export default function ProductsAdmin() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [toDelete, setToDelete] = useState(null);

  function load() {
    setLoading(true);
    productService
      .list({ incluir_inactivos: '1', limit: 50 })
      .then((res) => setProducts(res?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los productos'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q) ||
        p.marca?.toLowerCase().includes(q)
    );
  }, [products, search]);

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await productService.remove(toDelete.id);
      setFeedback(`Producto "${toDelete.nombre}" eliminado`);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el producto');
      setToDelete(null);
    }
  }

  const columns = [
    {
      key: 'imagen',
      label: '',
      render: (r) => (
        <img src={resolveImage(r.imagen)} alt={r.nombre} className="h-12 w-12 rounded-lg object-cover" />
      ),
    },
    {
      key: 'nombre',
      label: 'Producto',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">{r.nombre}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {r.destacado && <span className="badge bg-purple-100 text-purple-700">Destacado</span>}
            {r.es_nuevo && <span className="badge bg-blue-100 text-blue-700">Nuevo</span>}
            {r.en_oferta && <span className="badge bg-red-100 text-red-700">Oferta</span>}
          </div>
        </div>
      ),
    },
    { key: 'categoria', label: 'Categoría', render: (r) => r.categoria || '—' },
    { key: 'precio', label: 'Precio', render: (r) => formatPrice(r.precio) },
    { key: 'stock_total', label: 'Stock', render: (r) => r.stock_total ?? 0 },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) =>
        r.estado ? (
          <span className="badge bg-emerald-100 text-emerald-700">Activo</span>
        ) : (
          <span className="badge bg-neutral-200 text-neutral-700">Inactivo</span>
        ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/productos/${r.id}`}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
            title="Editar"
          >
            <IoCreateOutline size={18} />
          </Link>
          <button
            onClick={() => setToDelete(r)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
            title="Eliminar"
          >
            <IoTrashOutline size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold">Productos</h1>
        <Button as={Link} to="/admin/productos/nuevo" variant="primary" className="inline-flex items-center gap-2">
          <IoAddOutline size={20} /> Nuevo producto
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      <div className="relative max-w-md">
        <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
        <input
          className="input pl-10"
          placeholder="Buscar por nombre, categoría o marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader label="Cargando productos..." />
      ) : (
        <DataTable columns={columns} rows={filtered} empty="No hay productos" />
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message={`¿Seguro que deseas eliminar "${toDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
