import { useEffect, useState } from 'react';
import * as empleadosService from '../services/empleadosService';
import { getError } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const VACIO = { nombre: '', apellido: '', email: '', password: '', telefono: '', documento: '', cargo: '', estado: 'ACTIVO' };

export default function Empleados() {
  const toast = useToast();
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [confDelete, setConfDelete] = useState(null);

  const cargar = () => {
    setCargando(true);
    empleadosService.listarEmpleados()
      .then(setEmpleados)
      .catch((err) => toast.error(getError(err)))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const abrirCrear = () => { setEditId(null); setForm(VACIO); setModal(true); };
  const abrirEditar = (e) => {
    setEditId(e.id_usuario);
    setForm({ nombre: e.nombre, apellido: e.apellido || '', email: e.email, password: '', telefono: e.telefono || '', documento: e.documento || '', cargo: e.cargo || '', estado: e.estado });
    setModal(true);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { password, ...datos } = form;
        await empleadosService.actualizarEmpleado(editId, datos);
        toast.success('Empleado actualizado');
      } else {
        await empleadosService.crearEmpleado(form);
        toast.success('Empleado creado');
      }
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const eliminar = async () => {
    const id = confDelete.id_usuario;
    setConfDelete(null);
    setModal(false);
    try {
      await empleadosService.eliminarEmpleado(id);
      toast.success('Empleado eliminado permanentemente');
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Empleados</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo empleado</button>
      </div>

      {cargando ? <LoadingSpinner /> : (
        empleados.length === 0 ? (
          <EmptyState icon="👔" title="Sin empleados" message="Crea el primer empleado del hotel."
            action={<button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo empleado</button>} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Nombre</th><th>Email</th><th>Cargo</th><th>Teléfono</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {empleados.map((e) => (
                  <tr key={e.id_usuario}>
                    <td>{e.id_usuario}</td>
                    <td>{e.nombre} {e.apellido || ''}</td>
                    <td>{e.email}</td>
                    <td>{e.cargo || '-'}</td>
                    <td>{e.telefono || '-'}</td>
                    <td><Badge estado={e.estado} /></td>
                    <td className="actions">
                      <button className="btn btn-warning btn-sm" onClick={() => abrirEditar(e)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {modal && (
        <Modal title={editId ? 'Editar empleado' : 'Nuevo empleado'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div className="form-row">
              <div className="form-group"><label>Nombre *</label><input className="input" name="nombre" value={form.nombre} onChange={onChange} required /></div>
              <div className="form-group"><label>Apellido</label><input className="input" name="apellido" value={form.apellido} onChange={onChange} /></div>
            </div>
            <div className="form-group"><label>Email *</label><input className="input" type="email" name="email" value={form.email} onChange={onChange} required /></div>
            {!editId && (
              <div className="form-group"><label>Contraseña *</label><input className="input" type="password" name="password" value={form.password} onChange={onChange} required /></div>
            )}
            <div className="form-row">
              <div className="form-group"><label>Teléfono</label><input className="input" name="telefono" value={form.telefono} onChange={onChange} /></div>
              <div className="form-group"><label>Documento</label><input className="input" name="documento" value={form.documento} onChange={onChange} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Cargo</label><input className="input" name="cargo" value={form.cargo} onChange={onChange} placeholder="Ej: Recepción" /></div>
              {editId && (
                <div className="form-group">
                  <label>Estado</label>
                  <select className="input" name="estado" value={form.estado} onChange={onChange}>
                    <option value="ACTIVO">ACTIVO (habilitado)</option>
                    <option value="INACTIVO">INACTIVO (inhabilitado)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ justifyContent: editId ? 'space-between' : 'flex-end' }}>
              {editId && (
                <button type="button" className="btn btn-danger" onClick={() => setConfDelete(form && { id_usuario: editId, nombre: form.nombre })}>🗑 Eliminar</button>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {confDelete && (
        <ConfirmModal
          title="Eliminar empleado"
          message={`¿Eliminar PERMANENTEMENTE a ${confDelete.nombre} de la base de datos? Esta acción no se puede deshacer. (Si solo quieres inhabilitarlo, usa el estado INACTIVO).`}
          confirmText="Eliminar definitivamente"
          onConfirm={eliminar}
          onClose={() => setConfDelete(null)}
        />
      )}
    </div>
  );
}
