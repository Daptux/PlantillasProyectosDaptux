import { useEffect, useState } from 'react';
import { IoSearchOutline, IoSwapVerticalOutline, IoTimeOutline, IoCubeOutline } from 'react-icons/io5';
import { adminService } from '../../services/admin.service.js';
import { resolveImage } from '../../services/api.js';
import { formatDateTime, formatPrice } from '../../utils/format.js';
import Loader from '../../components/common/Loader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/forms/Input.jsx';
import Select from '../../components/forms/Select.jsx';

const TIPOS = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SALIDA', label: 'Salida' },
  { value: 'AJUSTE', label: 'Ajuste (fija el valor)' },
];

const emptyMov = { tipo: 'ENTRADA', cantidad: '', motivo: '' };

export default function InventoryAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  // movRow: variante seleccionada (incluye nombre del producto para el contexto)
  const [movRow, setMovRow] = useState(null);
  const [movForm, setMovForm] = useState(emptyMov);
  const [saving, setSaving] = useState(false);

  const [historyRow, setHistoryRow] = useState(null);
  const [movements, setMovements] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminService.inventory({ search });
      setProducts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function submitSearch(e) { e.preventDefault(); load(); }

  function openMovement(producto, variant) {
    setMovRow({ ...variant, producto });
    setMovForm(emptyMov);
  }

  async function saveMovement(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminService.registerMovement({
        variant_id: movRow.variant_id,
        tipo: movForm.tipo,
        cantidad: Number(movForm.cantidad),
        motivo: movForm.motivo,
      });
      setFeedback('Movimiento registrado correctamente');
      setMovRow(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el movimiento');
    } finally {
      setSaving(false);
    }
  }

  async function openHistory(producto, variant) {
    setHistoryRow({ ...variant, producto });
    setMovements([]);
    setHistoryLoading(true);
    try {
      const data = await adminService.inventoryMovements({ variant_id: variant.variant_id });
      setMovements(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los movimientos');
    } finally {
      setHistoryLoading(false);
    }
  }

  // Resumen superior
  const totalProductos = products.length;
  const totalUnidades = products.reduce((acc, p) => acc + Number(p.stock_total || 0), 0);
  const bajoStock = products.filter((p) => p.bajo_stock).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Inventario</h1>
        <p className="mt-1 text-sm text-neutral-500">Todos los productos con su stock por talla y color.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {feedback && <Alert type="success">{feedback}</Alert>}

      {/* resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{totalProductos}</p>
          <p className="text-xs text-neutral-500">Productos</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{totalUnidades}</p>
          <p className="text-xs text-neutral-500">Unidades en stock</p>
        </div>
        <div className="card p-4 text-center">
          <p className={`text-2xl font-bold ${bajoStock ? 'text-red-600' : ''}`}>{bajoStock}</p>
          <p className="text-xs text-neutral-500">Con bajo stock</p>
        </div>
      </div>

      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative max-w-md flex-1">
          <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input className="input pl-9" placeholder="Buscar por producto o SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button type="submit" variant="outline">Buscar</Button>
      </form>

      {loading ? (
        <Loader label="Cargando inventario..." />
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">No hay productos en el inventario.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <div key={p.product_id} className="card overflow-hidden">
              {/* cabecera con foto */}
              <div className="flex gap-4 p-4">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <img src={resolveImage(p.imagen)} alt={p.producto} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold leading-tight text-ink">{p.producto}</h3>
                    {p.bajo_stock && <span className="badge shrink-0 bg-red-100 text-red-700">Bajo stock</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.categoria && <span className="badge bg-neutral-100 text-neutral-600">{p.categoria}</span>}
                    {p.marca && <span className="badge bg-neutral-100 text-neutral-600">{p.marca}</span>}
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">
                    {formatPrice(p.precio)} · <span className="font-medium text-ink">{p.stock_total}</span> uds.
                  </p>
                </div>
              </div>

              {/* variantes */}
              <div className="border-t border-neutral-100">
                {p.variants.length === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-400">
                    <IoCubeOutline /> Sin variantes registradas
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {p.variants.map((v) => (
                      <li key={v.variant_id} className="flex items-center gap-2 px-4 py-2.5 text-sm">
                        {v.color_hex && (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-neutral-300" style={{ backgroundColor: v.color_hex }} title={v.color} />
                        )}
                        <span className="min-w-0 flex-1 truncate">
                          {[v.talla, v.color].filter(Boolean).join(' / ') || v.sku || 'Única'}
                        </span>
                        <span className={`font-semibold ${v.bajo_stock ? 'text-red-600' : 'text-ink'}`}>{v.stock}</span>
                        <span className="text-xs text-neutral-400">/ mín {v.stock_minimo}</span>
                        <button onClick={() => openHistory(p.producto, v)} title="Historial" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100">
                          <IoTimeOutline size={16} />
                        </button>
                        <button onClick={() => openMovement(p.producto, v)} title="Registrar movimiento" className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50">
                          <IoSwapVerticalOutline size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal movimiento */}
      <Modal open={!!movRow} onClose={() => setMovRow(null)} title="Registrar movimiento de stock">
        {movRow && (
          <form onSubmit={saveMovement} className="space-y-4">
            <p className="text-sm text-neutral-500">
              {movRow.producto} · {[movRow.talla, movRow.color].filter(Boolean).join(' / ') || movRow.sku}
              <br />Stock actual: <span className="font-semibold text-ink">{movRow.stock}</span>
            </p>
            <Select label="Tipo" options={TIPOS} value={movForm.tipo} onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value })} />
            <Input label="Cantidad" type="number" min="1" value={movForm.cantidad} onChange={(e) => setMovForm({ ...movForm, cantidad: e.target.value })} required />
            <Input label="Motivo (opcional)" value={movForm.motivo} onChange={(e) => setMovForm({ ...movForm, motivo: e.target.value })} />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setMovRow(null)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar'}</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* modal historial */}
      <Modal open={!!historyRow} onClose={() => setHistoryRow(null)} title="Historial de movimientos" maxWidth="max-w-2xl">
        {historyLoading ? (
          <Loader label="Cargando..." />
        ) : (
          <div className="space-y-2">
            {historyRow && (
              <p className="text-sm text-neutral-500">
                {historyRow.producto} · {[historyRow.talla, historyRow.color].filter(Boolean).join(' / ') || historyRow.sku}
              </p>
            )}
            {movements.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">Sin movimientos registrados</p>
            ) : (
              <div className="card divide-y divide-neutral-100">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className={`badge ${m.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : m.tipo === 'SALIDA' ? 'bg-red-100 text-red-700' : m.tipo === 'VENTA' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {m.tipo}
                    </span>
                    <span className="font-semibold">{m.cantidad}</span>
                    <span className="text-neutral-500">{m.stock_anterior} → {m.stock_nuevo}</span>
                    <span className="flex-1 truncate text-neutral-500">{m.motivo || '—'}</span>
                    <span className="text-xs text-neutral-400">{formatDateTime(m.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
