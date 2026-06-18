import { useEffect, useMemo, useState } from 'react';
import * as reservasService from '../services/reservasService';
import { listarClientes } from '../services/clientesService';
import { listarDisponibles } from '../services/habitacionesService';
import { getError, formatMoney, formatFecha } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import SearchSelect from '../components/SearchSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'CANCELADA', 'FINALIZADA'];
const VACIO = { id_usuario: '', id_habitacion: '', fecha_entrada: '', fecha_salida: '' };

export default function Reservas() {
  const toast = useToast();
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);

  const cargar = () => {
    setCargando(true);
    reservasService.listarReservas()
      .then(setReservas)
      .catch((err) => toast.error(getError(err)))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    listarClientes().then(setClientes).catch(() => {});
    listarDisponibles().then(setHabitaciones).catch(() => {});
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return reservas.filter((r) => {
      if (filtroEstado && r.estado !== filtroEstado) return false;
      if (!q) return true;
      const txt = `${r.nombre} ${r.apellido || ''} ${r.email || ''} ${r.numero} ${r.id_reserva}`.toLowerCase();
      return txt.includes(q);
    });
  }, [reservas, busqueda, filtroEstado]);

  const abrirCrear = () => {
    setForm(VACIO);
    listarDisponibles().then(setHabitaciones).catch(() => {});
    setModal(true);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.id_usuario || !form.id_habitacion) {
      toast.error('Selecciona el cliente y la habitación');
      return;
    }
    try {
      await reservasService.crearReserva({
        id_usuario: Number(form.id_usuario),
        id_habitacion: Number(form.id_habitacion),
        fecha_entrada: form.fecha_entrada,
        fecha_salida: form.fecha_salida
      });
      toast.success('Reserva creada');
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await reservasService.cambiarEstado(id, estado);
      toast.success('Estado actualizado');
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const accion = async (fn, id, msg) => {
    try {
      await fn(id);
      toast.success(msg);
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Reservas</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nueva reserva</button>
      </div>

      <div className="form-row" style={{ marginBottom: 16 }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
          <input className="input" placeholder="🔍 Buscar por cliente, habitación o #..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <select className="input" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {cargando ? <LoadingSpinner /> : (
        filtradas.length === 0 ? (
          <EmptyState icon="🗓️" title="Sin reservas" message={busqueda || filtroEstado ? 'Ninguna reserva coincide con el filtro.' : 'Aún no hay reservas registradas.'} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Cliente</th><th>Habitación</th><th>Entrada</th><th>Salida</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {filtradas.map((r) => (
                  <tr key={r.id_reserva}>
                    <td>{r.id_reserva}</td>
                    <td>{r.nombre} {r.apellido || ''}</td>
                    <td>{r.numero} ({r.tipo})</td>
                    <td>{formatFecha(r.fecha_entrada)}</td>
                    <td>{formatFecha(r.fecha_salida)}</td>
                    <td>{formatMoney(r.total)}</td>
                    <td>
                      <select className="input" style={{ width: 'auto', padding: '5px 8px' }} value={r.estado} onChange={(e) => cambiarEstado(r.id_reserva, e.target.value)}>
                        {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="actions">
                      {r.estado === 'CONFIRMADA' && (
                        <button className="btn btn-success btn-sm" onClick={() => accion(reservasService.checkIn, r.id_reserva, 'Check-in realizado')}>Check-in</button>
                      )}
                      {r.estado === 'EN_CURSO' && (
                        <button className="btn btn-success btn-sm" onClick={() => accion(reservasService.checkOut, r.id_reserva, 'Check-out realizado')}>Check-out</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {modal && (
        <Modal title="Nueva reserva" onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label>Cliente *</label>
              <SearchSelect
                items={clientes}
                value={form.id_usuario}
                onChange={(id) => setForm((f) => ({ ...f, id_usuario: id }))}
                getId={(c) => c.id_usuario}
                getLabel={(c) => `${c.nombre} ${c.apellido || ''} (${c.email})`}
                placeholder="🔍 Buscar cliente por nombre o email..."
              />
            </div>
            <div className="form-group">
              <label>Habitación disponible *</label>
              <SearchSelect
                items={habitaciones}
                value={form.id_habitacion}
                onChange={(id) => setForm((f) => ({ ...f, id_habitacion: id }))}
                getId={(h) => h.id_habitacion}
                getLabel={(h) => `${h.numero} - ${h.tipo} (${formatMoney(h.precio_noche)}/noche)`}
                placeholder="🔍 Buscar habitación..."
              />
            </div>
            <div className="form-row">
              <div className="form-group"><label>Fecha entrada *</label><input className="input" type="date" name="fecha_entrada" value={form.fecha_entrada} onChange={onChange} required /></div>
              <div className="form-group"><label>Fecha salida *</label><input className="input" type="date" name="fecha_salida" value={form.fecha_salida} onChange={onChange} required /></div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Crear reserva</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
