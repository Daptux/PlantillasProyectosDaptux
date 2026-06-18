import { useEffect, useState } from 'react';
import * as clientesService from '../services/clientesService';
import { useAuth } from '../context/AuthContext';
import { getError } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const VACIO = { nombre: '', apellido: '', email: '', password: '', telefono: '', documento: '', estado: 'ACTIVO' };

export default function Clientes() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'ADMIN';
  const toast = useToast();

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [confDelete, setConfDelete] = useState(null);

  const cargar = () => {
    setCargando(true);
    clientesService.listarClientes()
      .then(setClientes)
      .catch((err) => toast.error(getError(err)))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const abrirCrear = () => { setEditId(null); setForm(VACIO); setModal(true); };
  const abrirEditar = (c) => {
    setEditId(c.id_usuario);
    setForm({ nombre: c.nombre, apellido: c.apellido || '', email: c.email, password: '', telefono: c.telefono || '', documento: c.documento || '', estado: c.estado });
    setModal(true);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { password, ...datos } = form;
        await clientesService.actualizarCliente(editId, datos);
        toast.success('Cliente actualizado');
      } else {
        await clientesService.crearCliente(form);
        toast.success('Cliente creado');
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
      await clientesService.eliminarCliente(id);
      toast.success('Cliente eliminado permanentemente');
      cargar();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Clientes</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo cliente</button>
      </div>

      {cargando ? <LoadingSpinner /> : (
        clientes.length === 0 ? (
          <EmptyState icon="🧑‍🤝‍🧑" title="Sin clientes" message="Registra el primer cliente."
            action={<button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo cliente</button>} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Documento</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_usuario}>
                    <td>{c.id_usuario}</td>
                    <td>{c.nombre} {c.apellido || ''}</td>
                    <td>{c.email}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.documento || '-'}</td>
                    <td><Badge estado={c.estado} /></td>
                    <td className="actions">
                      <button className="btn btn-warning btn-sm" onClick={() => abrirEditar(c)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {modal && (
        <Modal title={editId ? 'Editar cliente' : 'Nuevo cliente'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div className="form-row">
              <div className="form-group"><label>Nombre *</label><input className="input" name="nombre" value={form.nombre} onChange={onChange} required /></div>
              <div className="form-group"><label>Apellido</label><input className="input" name="apellido" value={form.apellido} onChange={onChange} /></div>
            </div>
            <div className="form-group"><label>Email *</label><input className="input" type="email" name="email" value={form.email} onChange={onChange} required /></div>
            {!editId && (
              <div className="form-group"><label>Contraseña (opcional)</label><input className="input" type="password" name="password" value={form.password} onChange={onChange} placeholder="Si se deja vacío, se usa el documento" /></div>
            )}
            <div className="form-row">
              <div className="form-group"><label>Teléfono</label><input className="input" name="telefono" value={form.telefono} onChange={onChange} /></div>
              <div className="form-group"><label>Documento</label><input className="input" name="documento" value={form.documento} onChange={onChange} /></div>
            </div>
            {editId && (
              <div className="form-group">
                <label>Estado</label>
                <select className="input" name="estado" value={form.estado} onChange={onChange}>
                  <option value="ACTIVO">ACTIVO (habilitado)</option>
                  <option value="INACTIVO">INACTIVO (inhabilitado)</option>
                </select>
              </div>
            )}
            <div className="modal-actions" style={{ justifyContent: editId && esAdmin ? 'space-between' : 'flex-end' }}>
              {editId && esAdmin && (
                <button type="button" className="btn btn-danger" onClick={() => setConfDelete({ id_usuario: editId, nombre: form.nombre })}>🗑 Eliminar</button>
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
          title="Eliminar cliente"
          message={`¿Eliminar PERMANENTEMENTE a ${confDelete.nombre}? Se borrarán también sus reservas y opiniones. Esta acción no se puede deshacer. (Para solo inhabilitarlo, usa el estado INACTIVO).`}
          confirmText="Eliminar definitivamente"
          onConfirm={eliminar}
          onClose={() => setConfDelete(null)}
        />
      )}
    </div>
  );
}
