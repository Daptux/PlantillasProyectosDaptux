// frontend/src/pages/admin/Pacientes.jsx
// CRUD de pacientes con búsqueda y modal de creación/edición.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { pacientesService } from '../../services/pacientesService';

const VACIO = {
  nombre: '', tipo_documento: 'CC', numero_documento: '', fecha_nacimiento: '',
  genero: 'NA', telefono: '', correo: '', direccion: '', ocupacion: '',
  contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
  alergias: '', enfermedades: '', medicamentos: '',
  antecedentes_medicos: '', antecedentes_odontologicos: '', observaciones: '',
  acepta_tratamiento_datos: true,
};

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await pacientesService.listar(buscar);
      setPacientes(data.datos || []);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function abrirNuevo() {
    setForm(VACIO); setEditId(null); setError(''); setModal(true);
  }

  function abrirEditar(p) {
    setForm({ ...VACIO, ...p, fecha_nacimiento: p.fecha_nacimiento || '' });
    setEditId(p.id); setError(''); setModal(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (editId) await pacientesService.actualizar(editId, form);
      else await pacientesService.crear(form);
      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Desactivar este paciente?')) return;
    await pacientesService.eliminar(id);
    cargar();
  }

  return (
    <div>
      <PageHeader
        titulo="Pacientes"
        descripcion="Gestión de pacientes de la clínica"
        accion={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo paciente</button>}
      />

      <div className="mb-4 flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Buscar por nombre, documento o teléfono…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && cargar()}
        />
        <button className="btn-outline" onClick={cargar}>Buscar</button>
      </div>

      {cargando ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">Sin pacientes.</td></tr>
              ) : pacientes.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-ink">{p.nombre}</td>
                  <td className="px-4 py-3">{p.tipo_documento} {p.numero_documento}</td>
                  <td className="px-4 py-3">{p.telefono || '—'}</td>
                  <td className="px-4 py-3">{p.correo || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.estado ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                      {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/pacientes/${p.id}`} className="btn-ghost text-xs">Ver</Link>
                      <button className="btn-ghost text-xs text-brand-600" onClick={() => abrirEditar(p)}>Editar</button>
                      <button className="btn-ghost text-xs text-red-500" onClick={() => eliminar(p.id)}>Desactivar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal abierto={modal} titulo={editId ? 'Editar paciente' : 'Nuevo paciente'} onCerrar={() => setModal(false)}>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nombre completo *</label>
            <input name="nombre" className="input" value={form.nombre} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Tipo de documento</label>
            <select name="tipo_documento" className="input" value={form.tipo_documento} onChange={onChange}>
              {['CC', 'TI', 'CE', 'PASAPORTE', 'RC', 'NIT', 'OTRO'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Número de documento *</label>
            <input name="numero_documento" className="input" value={form.numero_documento} onChange={onChange} required />
          </div>
          <div>
            <label className="label">Fecha de nacimiento</label>
            <input type="date" name="fecha_nacimiento" className="input" value={form.fecha_nacimiento} onChange={onChange} />
          </div>
          <div>
            <label className="label">Género</label>
            <select name="genero" className="input" value={form.genero} onChange={onChange}>
              <option value="NA">No especifica</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" className="input" value={form.telefono} onChange={onChange} />
          </div>
          <div>
            <label className="label">Correo</label>
            <input type="email" name="correo" className="input" value={form.correo} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Dirección</label>
            <input name="direccion" className="input" value={form.direccion} onChange={onChange} />
          </div>
          <div>
            <label className="label">Contacto de emergencia</label>
            <input name="contacto_emergencia_nombre" className="input" value={form.contacto_emergencia_nombre} onChange={onChange} />
          </div>
          <div>
            <label className="label">Tel. de emergencia</label>
            <input name="contacto_emergencia_telefono" className="input" value={form.contacto_emergencia_telefono} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Alergias</label>
            <input name="alergias" className="input" value={form.alergias} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Antecedentes médicos</label>
            <textarea name="antecedentes_medicos" rows="2" className="input" value={form.antecedentes_medicos} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Observaciones</label>
            <textarea name="observaciones" rows="2" className="input" value={form.observaciones} onChange={onChange} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" name="acepta_tratamiento_datos" checked={form.acepta_tratamiento_datos} onChange={onChange} />
            <label className="text-sm text-slate-600">Acepta tratamiento de datos personales</label>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
