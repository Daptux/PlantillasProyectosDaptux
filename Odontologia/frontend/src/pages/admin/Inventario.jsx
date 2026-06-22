/**
 * frontend/src/pages/admin/Inventario.jsx
 * Inventario de insumos: CRUD, movimientos de stock y alertas.
 */
import { useEffect, useState } from 'react';
import { inventarioService } from '../../services/inventarioService';
import { formatoMoneda, formatoFecha } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIAS = ['Anestesia', 'Guantes', 'Tapabocas', 'Resinas', 'Fresas', 'Agujas', 'Suturas', 'Cementos', 'Ortodoncia', 'Blanqueamiento', 'Bioseguridad', 'Otros'];
const vacio = { nombre: '', categoria: 'Otros', descripcion: '', stock_actual: 0, stock_minimo: 0, unidad_medida: 'unidad', fecha_vencimiento: '', costo_unitario: 0 };

export default function Inventario() {
  const [lista, setLista] = useState([]);
  const [alertas, setAlertas] = useState({ stockBajo: [], vencidos: [], porVencer: [] });
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [movModal, setMovModal] = useState(false);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [mov, setMov] = useState({ inventario_id: '', tipo: 'ENTRADA', cantidad: 1, motivo: '' });
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    const [r, a] = await Promise.all([inventarioService.listar(), inventarioService.alertas()]);
    setLista(r.data); setAlertas(a.data); setCargando(false);
  }
  useEffect(() => { cargar(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  function abrirNuevo() { setForm(vacio); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(i) { setForm({ ...vacio, ...i }); setEditId(i.id); setError(''); setModal(true); }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) await inventarioService.actualizar(editId, form);
      else await inventarioService.crear(form);
      setModal(false); cargar();
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al guardar.'); }
  }

  async function guardarMov(e) {
    e.preventDefault();
    setError('');
    try {
      await inventarioService.movimiento(mov);
      setMovModal(false);
      setMov({ inventario_id: '', tipo: 'ENTRADA', cantidad: 1, motivo: '' });
      cargar();
    } catch (err) { setError(err.response?.data?.mensaje || 'Error en el movimiento.'); }
  }

  return (
    <div>
      <PageHeader titulo="Inventario" descripcion="Insumos odontológicos y movimientos.">
        <button onClick={() => { setMov({ inventario_id: '', tipo: 'ENTRADA', cantidad: 1, motivo: '' }); setError(''); setMovModal(true); }} className="btn-secondary btn-sm">↕ Movimiento</button>
        <button onClick={abrirNuevo} className="btn-primary btn-sm">+ Nuevo insumo</button>
      </PageHeader>

      {/* Alertas */}
      {(alertas.stockBajo.length > 0 || alertas.vencidos.length > 0 || alertas.porVencer.length > 0) && (
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="card p-4 border-l-4 border-red-400"><p className="text-xs text-slate-400">Stock bajo</p><p className="text-xl font-bold text-red-600">{alertas.stockBajo.length}</p></div>
          <div className="card p-4 border-l-4 border-rose-500"><p className="text-xs text-slate-400">Vencidos</p><p className="text-xl font-bold text-rose-600">{alertas.vencidos.length}</p></div>
          <div className="card p-4 border-l-4 border-amber-400"><p className="text-xs text-slate-400">Próximos a vencer (30d)</p><p className="text-xl font-bold text-amber-600">{alertas.porVencer.length}</p></div>
        </div>
      )}

      <div className="card overflow-hidden">
        {cargando ? <Loader /> : lista.length === 0 ? <EmptyState mensaje="No hay insumos." icono="📦" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Insumo</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>Vence</th><th>Costo</th><th className="px-4">Acciones</th></tr></thead>
              <tbody>
                {lista.map((i) => (
                  <tr key={i.id} className={`border-t border-slate-100 hover:bg-slate-50 ${i.stock_bajo ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{i.nombre}</td>
                    <td>{i.categoria}</td>
                    <td><span className={i.stock_bajo ? 'text-red-600 font-bold' : ''}>{i.stock_actual} {i.unidad_medida}</span></td>
                    <td>{i.stock_minimo}</td>
                    <td>{i.fecha_vencimiento ? formatoFecha(i.fecha_vencimiento) : '—'}</td>
                    <td>{formatoMoneda(i.costo_unitario)}</td>
                    <td className="px-4 whitespace-nowrap"><button onClick={() => abrirEditar(i)} className="text-brand-600 hover:underline">Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal insumo */}
      <Modal abierto={modal} titulo={editId ? 'Editar insumo' : 'Nuevo insumo'} onClose={() => setModal(false)}>
        <form onSubmit={guardar} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <div><label className="label">Nombre *</label><input className="input" value={form.nombre} onChange={set('nombre')} required /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Categoría</label><select className="input" value={form.categoria} onChange={set('categoria')}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Unidad de medida</label><input className="input" value={form.unidad_medida} onChange={set('unidad_medida')} /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="label">Stock actual</label><input type="number" className="input" value={form.stock_actual} onChange={set('stock_actual')} /></div>
            <div><label className="label">Stock mínimo</label><input type="number" className="input" value={form.stock_minimo} onChange={set('stock_minimo')} /></div>
            <div><label className="label">Costo unitario</label><input type="number" className="input" value={form.costo_unitario} onChange={set('costo_unitario')} /></div>
          </div>
          <div><label className="label">Fecha de vencimiento</label><input type="date" className="input" value={form.fecha_vencimiento || ''} onChange={set('fecha_vencimiento')} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal movimiento */}
      <Modal abierto={movModal} titulo="Movimiento de inventario" onClose={() => setMovModal(false)} ancho="max-w-lg">
        <form onSubmit={guardarMov} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <div>
            <label className="label">Insumo *</label>
            <select className="input" value={mov.inventario_id} onChange={(e) => setMov({ ...mov, inventario_id: e.target.value })} required>
              <option value="">Selecciona</option>
              {lista.map((i) => <option key={i.id} value={i.id}>{i.nombre} (stock: {i.stock_actual})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Tipo</label><select className="input" value={mov.tipo} onChange={(e) => setMov({ ...mov, tipo: e.target.value })}><option value="ENTRADA">Entrada</option><option value="SALIDA">Salida</option></select></div>
            <div><label className="label">Cantidad</label><input type="number" min="1" className="input" value={mov.cantidad} onChange={(e) => setMov({ ...mov, cantidad: e.target.value })} required /></div>
          </div>
          <div><label className="label">Motivo</label><input className="input" value={mov.motivo} onChange={(e) => setMov({ ...mov, motivo: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMovModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">Registrar movimiento</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
