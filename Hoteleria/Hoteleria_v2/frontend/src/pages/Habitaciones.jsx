import { useEffect, useState } from 'react';
import * as habitacionesService from '../services/habitacionesService';
import { useAuth } from '../context/AuthContext';
import { getError, formatMoney } from '../utils/helpers';
import { imgHab } from '../utils/roomImages';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import RoomCalendarModal from '../components/RoomCalendarModal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const TIPOS = ['INDIVIDUAL', 'DOBLE', 'SUITE', 'FAMILIAR'];
const ESTADOS = ['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO', 'LIMPIEZA', 'INACTIVA'];
const VACIO = { numero: '', tipo: 'INDIVIDUAL', descripcion: '', precio_noche: '', capacidad: '', estado: 'DISPONIBLE', imagen_url: '' };

export default function Habitaciones() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'ADMIN';
  const toast = useToast();

  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [confDelete, setConfDelete] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [calRoom, setCalRoom] = useState(null);

  const cargar = () => {
    setCargando(true);
    habitacionesService.listarHabitaciones()
      .then(setHabitaciones)
      .catch((err) => toast.error(getError(err)))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const abrirCrear = () => { setEditId(null); setForm(VACIO); setModal(true); };
  const abrirEditar = (h) => {
    setEditId(h.id_habitacion);
    setForm({ numero: h.numero, tipo: h.tipo, descripcion: h.descripcion || '', precio_noche: h.precio_noche, capacidad: h.capacidad, estado: h.estado, imagen_url: h.imagen_url || '' });
    setModal(true);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const res = await habitacionesService.subirImagen(file);
      setForm((f) => ({ ...f, imagen_url: res.url }));
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSubiendo(false);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const datos = { ...form, precio_noche: Number(form.precio_noche), capacidad: Number(form.capacidad) };
    try {
      if (editId) {
        await habitacionesService.actualizarHabitacion(editId, datos);
        toast.success('Habitación actualizada');
      } else {
        await habitacionesService.crearHabitacion(datos);
        toast.success('Habitación creada');
      }
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const cambiarEstado = async (h, estado) => {
    try {
      await habitacionesService.actualizarHabitacion(h.id_habitacion, { estado });
      toast.success(`Habitación ${h.numero}: ${estado}`);
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const eliminar = async () => {
    const id = confDelete.id_habitacion;
    setConfDelete(null);
    setModal(false);
    try {
      await habitacionesService.eliminarHabitacion(id);
      toast.success('Habitación eliminada permanentemente');
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Habitaciones</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nueva habitación</button>
      </div>

      {cargando ? <LoadingSpinner /> : (
        habitaciones.length === 0 ? (
          <EmptyState icon="🛏️" title="Sin habitaciones" message="Crea la primera habitación del hotel."
            action={<button className="btn btn-primary" onClick={abrirCrear}>+ Nueva habitación</button>} />
        ) : (
          <div className="hab-grid">
            {habitaciones.map((h) => (
              <div className="hab-card" key={h.id_habitacion}>
                <div className="hc-img" style={{ backgroundImage: `url(${imgHab(h)})` }}>
                  <span className="hc-type">{h.tipo}</span>
                  <span className="hc-badge"><Badge estado={h.estado} /></span>
                </div>
                <div className="hc-body">
                  <div className="hc-title">Habitación {h.numero}</div>
                  <div className="hc-meta">👥 Hasta {h.capacidad} huésped(es)</div>
                  <div className="hc-price">{formatMoney(h.precio_noche)} <small style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>/ noche</small></div>
                  <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <select className="input" style={{ padding: '6px 8px', fontSize: 13 }} value={h.estado} onChange={(e) => cambiarEstado(h, e.target.value)}>
                      {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-light btn-sm" style={{ flex: 1 }} onClick={() => setCalRoom(h)}>📅 Calendario</button>
                      <button className="btn btn-warning btn-sm" style={{ flex: 1 }} onClick={() => abrirEditar(h)}>Editar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {modal && (
        <Modal title={editId ? 'Editar habitación' : 'Nueva habitación'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div className="form-row">
              <div className="form-group"><label>Número *</label><input className="input" name="numero" value={form.numero} onChange={onChange} required /></div>
              <div className="form-group"><label>Tipo *</label>
                <select className="input" name="tipo" value={form.tipo} onChange={onChange}>{TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Precio por noche *</label><input className="input" type="number" min="0" name="precio_noche" value={form.precio_noche} onChange={onChange} required /></div>
              <div className="form-group"><label>Capacidad *</label><input className="input" type="number" min="1" name="capacidad" value={form.capacidad} onChange={onChange} required /></div>
            </div>
            <div className="form-group"><label>Estado</label>
              <select className="input" name="estado" value={form.estado} onChange={onChange}>{ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>

            <div className="form-group">
              <label>Imagen</label>
              {form.imagen_url && (
                <img src={form.imagen_url} alt="Vista previa" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 8, border: '1px solid var(--line)' }} />
              )}
              <input className="input" type="file" accept="image/*" onChange={onFile} />
              <small className="muted" style={{ display: 'block', marginTop: 5 }}>
                {subiendo ? '⏳ Subiendo imagen...' : 'Sube una imagen (JPG/PNG, máx 5 MB). Se guarda en el servidor, no en la base de datos.'}
              </small>
            </div>

            <div className="form-group"><label>Descripción</label><textarea className="input" name="descripcion" rows="2" value={form.descripcion} onChange={onChange} /></div>

            <div className="modal-actions" style={{ justifyContent: editId && esAdmin ? 'space-between' : 'flex-end' }}>
              {editId && esAdmin && (
                <button type="button" className="btn btn-danger" onClick={() => setConfDelete({ id_habitacion: editId, numero: form.numero })}>🗑 Eliminar</button>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={subiendo}>Guardar</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {confDelete && (
        <ConfirmModal
          title="Eliminar habitación"
          message={`¿Eliminar PERMANENTEMENTE la habitación ${confDelete.numero}? Se borrarán también sus reservas y pagos asociados. Esta acción no se puede deshacer. (Para solo inhabilitarla, cambia su estado a INACTIVA).`}
          confirmText="Eliminar definitivamente"
          onConfirm={eliminar}
          onClose={() => setConfDelete(null)}
        />
      )}

      {calRoom && (
        <RoomCalendarModal room={calRoom} onClose={() => setCalRoom(null)} />
      )}
    </div>
  );
}
