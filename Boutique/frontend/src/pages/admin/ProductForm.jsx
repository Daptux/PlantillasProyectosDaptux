import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoArrowBackOutline, IoCloudUploadOutline, IoTrashOutline, IoStarOutline } from 'react-icons/io5';
import { productService, categoryService, brandService } from '../../services/product.service.js';
import { resolveImage } from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';
import Input from '../../components/forms/Input.jsx';
import Select from '../../components/forms/Select.jsx';

const GENEROS = [
  { value: 'HOMBRE', label: 'Hombre' },
  { value: 'MUJER', label: 'Mujer' },
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'NINO', label: 'Niño' },
];

const emptyForm = {
  nombre: '',
  descripcion: '',
  categoria_id: '',
  marca_id: '',
  genero: 'UNISEX',
  precio: '',
  precio_descuento: '',
  coleccion: '',
  destacado: false,
  es_nuevo: false,
  en_oferta: false,
  estado: true,
};

const emptyVariant = { talla: '', color: '', color_hex: '#000000', sku: '', stock: '', stock_minimo: '' };

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState(emptyVariant);
  const [uploading, setUploading] = useState(false);
  const [savingVariant, setSavingVariant] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    Promise.all([categoryService.list(true), brandService.list(true)])
      .then(([cats, brs]) => {
        setCategories(cats || []);
        setBrands(brs || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    productService
      .get(id)
      .then((p) => {
        setForm({
          nombre: p.nombre ?? '',
          descripcion: p.descripcion ?? '',
          categoria_id: p.categoria_id ?? '',
          marca_id: p.marca_id ?? '',
          genero: p.genero ?? 'UNISEX',
          precio: p.precio ?? '',
          precio_descuento: p.precio_descuento ?? '',
          coleccion: p.coleccion ?? '',
          destacado: !!p.destacado,
          es_nuevo: !!p.es_nuevo,
          en_oferta: !!p.en_oferta,
          estado: p.estado === undefined ? true : !!p.estado,
        });
        setImages(p.images || []);
        setVariants(p.variants || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      marca_id: form.marca_id ? Number(form.marca_id) : null,
      genero: form.genero,
      precio: form.precio === '' ? 0 : Number(form.precio),
      precio_descuento: form.precio_descuento === '' ? null : Number(form.precio_descuento),
      coleccion: form.coleccion,
      destacado: form.destacado,
      es_nuevo: form.es_nuevo,
      en_oferta: form.en_oferta,
      estado: form.estado,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFeedback('');
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await productService.update(id, payload);
        setFeedback('Producto actualizado correctamente');
      } else {
        const created = await productService.create(payload);
        setFeedback('Producto creado. Ahora puedes añadir imágenes y variantes.');
        navigate(`/admin/productos/${created.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      for (const file of files) fd.append('images', file);
      const res = await productService.uploadImages(id, fd);
      setImages((prev) => [...prev, ...(res.images || [])]);
      setFeedback('Imágenes subidas');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron subir las imágenes');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDeleteImage(imageId) {
    try {
      await productService.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la imagen');
    }
  }

  async function handleAddVariant(e) {
    e.preventDefault();
    setSavingVariant(true);
    setError('');
    try {
      const created = await productService.addVariant(id, {
        talla: newVariant.talla,
        color: newVariant.color,
        color_hex: newVariant.color_hex,
        sku: newVariant.sku,
        stock: newVariant.stock === '' ? 0 : Number(newVariant.stock),
        stock_minimo: newVariant.stock_minimo === '' ? 0 : Number(newVariant.stock_minimo),
      });
      setVariants((prev) => [...prev, created]);
      setNewVariant(emptyVariant);
      setFeedback('Variante añadida');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo añadir la variante');
    } finally {
      setSavingVariant(false);
    }
  }

  function setVariantStock(variantId, value) {
    setVariants((prev) => prev.map((v) => (v.id === variantId ? { ...v, stock: value } : v)));
  }

  async function handleUpdateVariantStock(variant) {
    try {
      await productService.updateVariant(variant.id, { stock: Number(variant.stock) || 0 });
      setFeedback('Stock actualizado');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el stock');
    }
  }

  async function handleDeleteVariant(variantId) {
    try {
      await productService.deleteVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la variante');
    }
  }

  if (loading) return <Loader label="Cargando producto..." />;

  const categoryOptions = [{ value: '', label: 'Selecciona categoría' }, ...categories.map((c) => ({ value: c.id, label: c.nombre }))];
  const brandOptions = [{ value: '', label: 'Selecciona marca' }, ...brands.map((b) => ({ value: b.id, label: b.nombre }))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/productos" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
          <IoArrowBackOutline size={22} />
        </Link>
        <h1 className="font-display text-3xl font-bold">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <Input label="Nombre" value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} required />

        <div>
          <label className="label">Descripción</label>
          <textarea
            className="input min-h-[120px]"
            value={form.descripcion}
            onChange={(e) => setField('descripcion', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Categoría"
            options={categoryOptions}
            value={form.categoria_id}
            onChange={(e) => setField('categoria_id', e.target.value)}
          />
          <Select
            label="Marca"
            options={brandOptions}
            value={form.marca_id}
            onChange={(e) => setField('marca_id', e.target.value)}
          />
          <Select
            label="Género"
            options={GENEROS}
            value={form.genero}
            onChange={(e) => setField('genero', e.target.value)}
          />
          <Input label="Colección" value={form.coleccion} onChange={(e) => setField('coleccion', e.target.value)} />
          <Input
            label="Precio"
            type="number"
            min="0"
            value={form.precio}
            onChange={(e) => setField('precio', e.target.value)}
            required
          />
          <Input
            label="Precio descuento"
            type="number"
            min="0"
            value={form.precio_descuento}
            onChange={(e) => setField('precio_descuento', e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          {[
            ['destacado', 'Destacado'],
            ['es_nuevo', 'Nuevo'],
            ['en_oferta', 'En oferta'],
            ['estado', 'Activo'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setField(key, e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button as={Link} to="/admin/productos" variant="ghost">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>

      {isEdit && (
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">Imágenes</h2>
          <label className="flex w-fit cursor-pointer items-center gap-2 btn-outline">
            <IoCloudUploadOutline size={20} />
            {uploading ? 'Subiendo...' : 'Subir imágenes'}
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>

          {images.length === 0 ? (
            <p className="text-sm text-neutral-400">Aún no hay imágenes.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {images.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-xl border border-neutral-200">
                  <img src={resolveImage(img.url)} alt="" className="aspect-square w-full object-cover" />
                  {img.es_principal && (
                    <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      <IoStarOutline size={10} /> Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 transition group-hover:opacity-100"
                  >
                    <IoTrashOutline size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isEdit && (
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">Variantes</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Talla</th>
                  <th className="px-3 py-2">Color</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Stock mín.</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-neutral-400">
                      Sin variantes
                    </td>
                  </tr>
                ) : (
                  variants.map((v) => (
                    <tr key={v.id}>
                      <td className="px-3 py-2">{v.talla}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2">
                          {v.color_hex && (
                            <span
                              className="inline-block h-4 w-4 rounded-full border border-neutral-200"
                              style={{ backgroundColor: v.color_hex }}
                            />
                          )}
                          {v.color}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-neutral-500">{v.sku}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => setVariantStock(v.id, e.target.value)}
                          onBlur={() => handleUpdateVariantStock(v)}
                          className="input h-9 w-20 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">{v.stock_minimo}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(v.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleAddVariant} className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-6">
            <Input
              label="Talla"
              value={newVariant.talla}
              onChange={(e) => setNewVariant((v) => ({ ...v, talla: e.target.value }))}
              required
            />
            <Input
              label="Color"
              value={newVariant.color}
              onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))}
              required
            />
            <div>
              <label className="label">Color hex</label>
              <input
                type="color"
                value={newVariant.color_hex}
                onChange={(e) => setNewVariant((v) => ({ ...v, color_hex: e.target.value }))}
                className="input h-10 p-1"
              />
            </div>
            <Input
              label="SKU"
              value={newVariant.sku}
              onChange={(e) => setNewVariant((v) => ({ ...v, sku: e.target.value }))}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={newVariant.stock}
              onChange={(e) => setNewVariant((v) => ({ ...v, stock: e.target.value }))}
            />
            <Input
              label="Stock mín."
              type="number"
              min="0"
              value={newVariant.stock_minimo}
              onChange={(e) => setNewVariant((v) => ({ ...v, stock_minimo: e.target.value }))}
            />
            <div className="col-span-2 sm:col-span-6">
              <Button type="submit" variant="outline" disabled={savingVariant}>
                {savingVariant ? 'Añadiendo...' : 'Añadir variante'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
