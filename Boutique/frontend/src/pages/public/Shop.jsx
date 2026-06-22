import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IoOptionsOutline, IoChevronBack, IoChevronForward, IoClose } from 'react-icons/io5';
import { productService, categoryService, brandService } from '../../services/product.service.js';
import { formatPrice } from '../../utils/format.js';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/forms/Select.jsx';
import Modal from '../../components/common/Modal.jsx';

const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'vendidos', label: 'Más vendidos' },
  { value: 'destacados', label: 'Destacados' },
];

// Lee solo claves no vacías del query string
function paramsToObject(sp) {
  const obj = {};
  for (const [k, v] of sp.entries()) {
    if (v !== '' && v != null) obj[k] = v;
  }
  return obj;
}

function FiltersPanel({ filters, meta, categories, brands, onChange, onClear }) {
  const set = (key, value) => onChange(key, value);

  return (
    <div className="space-y-6">
      {/* Categoría */}
      <div>
        <p className="label mb-2">Categoría</p>
        <div className="space-y-1.5">
          <button
            onClick={() => set('categoria', '')}
            className={`block text-sm ${!filters.categoria ? 'font-semibold text-ink' : 'text-neutral-500 hover:text-ink'}`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => set('categoria', c.slug)}
              className={`block text-sm ${filters.categoria === c.slug ? 'font-semibold text-ink' : 'text-neutral-500 hover:text-ink'}`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Marca */}
      {brands.length > 0 && (
        <div>
          <p className="label mb-2">Marca</p>
          <div className="space-y-1.5">
            <button
              onClick={() => set('marca', '')}
              className={`block text-sm ${!filters.marca ? 'font-semibold text-ink' : 'text-neutral-500 hover:text-ink'}`}
            >
              Todas
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => set('marca', b.slug)}
                className={`block text-sm ${filters.marca === b.slug ? 'font-semibold text-ink' : 'text-neutral-500 hover:text-ink'}`}
              >
                {b.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Género */}
      {meta.generos?.length > 0 && (
        <div>
          <p className="label mb-2">Género</p>
          <div className="flex flex-wrap gap-2">
            {meta.generos.map((g) => (
              <button
                key={g}
                onClick={() => set('genero', filters.genero === g ? '' : g)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                  filters.genero === g ? 'border-ink bg-ink text-white' : 'border-neutral-300 text-neutral-600 hover:border-ink'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Talla */}
      {meta.tallas?.length > 0 && (
        <div>
          <p className="label mb-2">Talla</p>
          <div className="flex flex-wrap gap-2">
            {meta.tallas.map((t) => (
              <button
                key={t}
                onClick={() => set('talla', filters.talla === t ? '' : t)}
                className={`min-w-[2.5rem] rounded-md border px-2 py-1 text-xs transition ${
                  filters.talla === t ? 'border-ink bg-ink text-white' : 'border-neutral-300 text-neutral-600 hover:border-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color */}
      {meta.colores?.length > 0 && (
        <div>
          <p className="label mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {meta.colores.map((c) => (
              <button
                key={c.color}
                onClick={() => set('color', filters.color === c.color ? '' : c.color)}
                title={c.color}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  filters.color === c.color ? 'border-ink ring-2 ring-ink/30' : 'border-neutral-200'
                }`}
                style={{ backgroundColor: c.color_hex || '#ccc' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Precio */}
      <div>
        <p className="label mb-2">Precio</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={meta.precio?.min != null ? String(meta.precio.min) : 'Mín'}
            value={filters.precio_min || ''}
            onChange={(e) => set('precio_min', e.target.value)}
            className="input"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            placeholder={meta.precio?.max != null ? String(meta.precio.max) : 'Máx'}
            value={filters.precio_max || ''}
            onChange={(e) => set('precio_max', e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Solo ofertas */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={filters.oferta === '1'}
          onChange={(e) => set('oferta', e.target.checked ? '1' : '')}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Solo ofertas
      </label>

      <button onClick={onClear} className="text-sm font-medium text-accent-dark hover:underline">
        Limpiar filtros
      </button>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => paramsToObject(searchParams), [searchParams]);

  const [meta, setMeta] = useState({ tallas: [], colores: [], precio: {}, generos: [] });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Catálogo de filtros (una vez)
  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
    brandService.list().then(setBrands).catch(() => {});
    productService.filters().then(setMeta).catch(() => {});
  }, []);

  // Productos cuando cambian los filtros
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = { limit: 12, ...filters };
    productService
      .list(params)
      .then((res) => {
        if (!active) return;
        setProducts(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      })
      .catch(() => {
        if (active) { setProducts([]); setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 }); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]);

  // Actualiza un filtro y resetea la página (salvo que sea la propia página)
  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value == null) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  function goToPage(p) {
    if (p < 1 || p > pagination.totalPages) return;
    updateFilter('page', String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const currentPage = Number(filters.page) || 1;

  return (
    <div className="container-max py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">
          {filters.search ? `Resultados: "${filters.search}"` : 'Tienda'}
        </h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FiltersPanel
            filters={filters}
            meta={meta}
            categories={categories}
            brands={brands}
            onChange={updateFilter}
            onClear={clearFilters}
          />
        </aside>

        {/* Contenido */}
        <div className="flex-1">
          {/* Barra superior */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="btn-outline flex items-center gap-2 px-3 py-2 text-sm lg:hidden"
              >
                <IoOptionsOutline size={18} /> Filtros
              </button>
              <Select
                value={filters.sort || 'recientes'}
                onChange={(e) => updateFilter('sort', e.target.value)}
                options={SORT_OPTIONS}
                className="w-52"
              />
            </div>
          </div>

          {loading ? (
            <Loader label="Cargando productos..." />
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 disabled:opacity-40"
                  >
                    <IoChevronBack size={18} /> Anterior
                  </Button>
                  <span className="text-sm text-neutral-600">
                    Página {currentPage} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="flex items-center gap-1 disabled:opacity-40"
                  >
                    Siguiente <IoChevronForward size={18} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drawer de filtros (móvil) */}
      <Modal open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filtros">
        <FiltersPanel
          filters={filters}
          meta={meta}
          categories={categories}
          brands={brands}
          onChange={updateFilter}
          onClear={clearFilters}
        />
        <Button variant="primary" className="mt-6 w-full" onClick={() => setDrawerOpen(false)}>
          <IoClose size={18} /> Ver resultados
        </Button>
      </Modal>
    </div>
  );
}
