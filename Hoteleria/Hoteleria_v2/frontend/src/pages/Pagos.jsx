import { useEffect, useState } from 'react';
import * as pagosService from '../services/pagosService';
import { listarReservas } from '../services/reservasService';
import { getError, formatMoney, formatFecha } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const METODOS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
const VACIO = { id_reserva: '', metodo_pago: 'EFECTIVO', monto: '' };

export default function Pagos() {
  const toast = useToast();
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);

  const cargar = () => {
    setCargando(true);
    pagosService.listarPagos()
      .then(setPagos)
      .catch((err) => toast.error(getError(err)))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    listarReservas().then(setReservas).catch(() => {});
  }, []);

  const abrirCrear = () => {
    setForm(VACIO);
    listarReservas().then(setReservas).catch(() => {});
    setModal(true);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      const res = await pagosService.registrarPago({
        id_reserva: Number(form.id_reserva),
        metodo_pago: form.metodo_pago,
        monto: Number(form.monto)
      });
      toast.success(`Pago registrado. Saldo: ${formatMoney(res.saldo_pendiente)}` + (res.reserva_confirmada ? ' · Reserva CONFIRMADA' : ''));
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Pagos</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Registrar pago</button>
      </div>

      {cargando ? <LoadingSpinner /> : (
        pagos.length === 0 ? (
          <EmptyState icon="💳" title="Sin pagos registrados" message="Registra el primer pago de una reserva."
            action={<button className="btn btn-primary" onClick={abrirCrear}>+ Registrar pago</button>} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Reserva</th><th>Cliente</th><th>Habitación</th><th>Método</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id_pago}>
                    <td>{p.id_pago}</td>
                    <td>#{p.id_reserva}</td>
                    <td>{p.nombre} {p.apellido || ''}</td>
                    <td>{p.numero_habitacion}</td>
                    <td>{p.metodo_pago}</td>
                    <td>{formatMoney(p.monto)}</td>
                    <td><Badge estado={p.estado} /></td>
                    <td>{formatFecha(p.fecha_pago)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {modal && (
        <Modal title="Registrar pago" onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label>Reserva *</label>
              <select className="input" name="id_reserva" value={form.id_reserva} onChange={onChange} required>
                <option value="">-- Selecciona una reserva --</option>
                {reservas.map((r) => <option key={r.id_reserva} value={r.id_reserva}>#{r.id_reserva} · {r.nombre} {r.apellido || ''} · {formatMoney(r.total)} · {r.estado}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Método *</label>
                <select className="input" name="metodo_pago" value={form.metodo_pago} onChange={onChange}>{METODOS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
              </div>
              <div className="form-group"><label>Monto *</label><input className="input" type="number" min="1" name="monto" value={form.monto} onChange={onChange} required /></div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Registrar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
