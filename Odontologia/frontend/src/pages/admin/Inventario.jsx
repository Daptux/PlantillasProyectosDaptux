// frontend/src/pages/admin/Inventario.jsx
// Inventario odontológico: CRUD, alertas de stock y movimientos.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { inventarioService } from '../../services/inventarioService';

const CATEGORIAS = ['Anestesia', 'Guantes', 'Tapabocas', 'Resinas', 'Fresas', 'Agujas', 'Suturas', 'Cementos', 'Ortodoncia', 'Blanqueamiento', 'Bioseguridad', 'Otros'];
const VACIO = { nombre: '', categoria: 'Otros', descripcion: '', stock_actual: 0, stock_minimo: 0, unidad_medida: 'unidad', fecha_vencimiento: '', costo_unitario: 0 };
const MOV_VACIO = { inventario_id: '', tipo: 'ENTRADA', cantidad: 1, motivo: '' };

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [alertas, setAlertas] = useState({ stock_bajo: [], vencidos: [], por_vencer: [] });
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalMov, setModalMov] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [mov, setMov] = useState(MOV_VACIO);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const [{ data: lista }, { data: al }] = await Promise.all([
        inventarioService.listar(),
        inventarioService.alertas(),
      ]);
      setItems(lista.datos || []);
      setAlertas(al.datos || { stock_bajo: [], vencidos: [], por_vencer: [] });
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  function onChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }
  function onChangeMov(e) { setMov((m) => ({ ...m, [e.target.name]: e.target.value })); }

  function abrirNuevo() { setForm(VACIO); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(i) { setForm({ ...VACIO, ...i, fecha_vencimiento: i.fecha_vencimiento || '' }); setEditId(i.id); setError(''); setModal(true); }
  function abrirMov(i) { setMov({ ...MOV_VACIO, inventario_id: i.id }); setError(''); setModalMov(true); }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, fecha_vencimiento: form.fecha_vencimiento || null };
      if (editId) await inventarioService.actualizar(editId, payload);
      else await inventarioService.crear(payload);
      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar.');
    }
  }

  async function guardarMov(e) {
    e.preventDefault();
    setError('');
    try {
      await inventarioService.registrarMovimiento({ ...mov, cantidad: Number(mov.cantidad) });
      setModalMov(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo registrar el movimiento.');
    }
  }

  return (
    <div>
      <PageHeader titulo="Inventario" descripcion="Insumos odontológicos y movimientos"
        accion={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo insumo</button>} />

      {/* Alertas */}
      {(alertas.stock_bajo.length > 0 || alertas.vencidos.length > 0 || alertas.por_vencer.length > 0) && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="card border-l-4 border-orange-400 p-4">
            <p className="text-sm text-slate-500">Stock bajo</p>
            <p className="text-2xl font-bold text-orange-500">{alertas.stock_bajo.length}</p>
          </div>
          <div className="card border-l-4 border-red-400 p-4">
            <p className="text-sm text-slate-500">Vencidos</p>
            <p className="text-2xl font-bold text-red-500">{alertas.vencidos.length}</p>
          </div>
          <div className="card border-l-4 border-amber-400 p-4">
            <p className="text-sm text-slate-500">Próximos a vencer (30 días)</p>
            <p className="text-2xl font-bold text-amber-500">{alertas.por_vencer.length}</p>
          </div>
        </div>
      )}

      {cargando ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3">Insumo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Mínimo</th>
                <th className="px-4 py-3">Vence</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className={`border-b border-slate-50 hover:bg-slate-50 ${i.stock_actual <= i.stock_minimo ? 'bg-orange-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-ink">{i.nombre}</td>
                  <td className="px-4 py-3">{i.categoria}</td>
                  <td className="px-4 py-3 font-semibold">{i.stock_actual} {i.unidad_medida}</td>
                  <td className="px-4 py-3 text-slate-400">{i.stock_minimo}</td>
                  <td className="px-4 py-3">{i.fecha_vencimiento || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost text-xs text-teal-600" onClick={() => abrirMov(i)}>Movimiento</button>
                    <button className="btn-ghost text-xs text-brand-600" onClick={() => abrirEditar(i)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal insumo */}
      <Modal abierto={modal} titulo={editId ? 'Editar insumo' : 'Nuevo insumo'} onCerrar={() => setModal(false)}>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nombre *</label>
            <input name="nombre" className="input" value={form.nombre} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select name="categoria" className="input" value={form.categoria} onChange={onChange}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Unidad de medida</label>
            <input name="unidad_medida" className="input" value={form.unidad_medida} onChange={onChange} />
          </div>
          <div>
            <label className="label">Stock actual</label>
            <input type="number" min="0" name="stock_actual" className="input" value={form.stock_actual} onChange={onChange} />
          </div>
          <div>
            <label className="label">Stock mínimo</label>
            <input type="number" min="0" name="stock_minimo" className="input" value={form.stock_minimo} onChange={onChange} />
          </div>
          <div>
            <label className="label">Fecha de vencimiento</label>
            <input type="date" name="fecha_vencimiento" className="input" value={form.fecha_vencimiento} onChange={onChange} />
          </div>
          <div>
            <label className="label">Costo unitario</label>
            <input type="number" min="0" name="costo_unitario" className="input" value={form.costo_unitario} onChange={onChange} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal movimiento */}
      <Modal abierto={modalMov} titulo="Registrar movimiento" onCerrar={() => setModalMov(false)} ancho="max-w-md">
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardarMov} className="space-y-4">
          <div>
            <label className="label">Tipo</label>
            <select name="tipo" className="input" value={mov.tipo} onChange={onChangeMov}>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>
          <div>
            <label className="label">Cantidad</label>
            <input type="number" min="1" name="cantidad" className="input" value={mov.cantidad} onChange={onChangeMov} required />
          </div>
          <div>
            <label className="label">Motivo</label>
            <input name="motivo" className="input" value={mov.motivo} onChange={onChangeMov} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModalMov(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
