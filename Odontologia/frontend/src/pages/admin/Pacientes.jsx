/**
 * frontend/src/pages/admin/Pacientes.jsx
 * CRUD de pacientes con buscador y modal de creación/edición.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pacientesService } from '../../services/pacientesService';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const vacio = {
  tipo_documento: 'CC', numero_documento: '', nombres: '', apellidos: '', fecha_nacimiento: '',
  genero: '', telefono: '', correo: '', direccion: '', ciudad: '', ocupacion: '',
  contacto_emergencia: '', telefono_emergencia: '', alergias: '', enfermedades: '',
  medicamentos: '', antecedentes_medicos: '', antecedentes_odontologicos: '', observaciones: '',
  acepta_tratamiento_datos: true,
};

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    const r = await pacientesService.listar({ buscar });
    setPacientes(r.data);
    setCargando(false);
  }

  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [buscar]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  function abrirNuevo() { setForm(vacio); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(p) { setForm({ ...vacio, ...p, acepta_tratamiento_datos: !!p.acepta_tratamiento_datos }); setEditId(p.id); setError(''); setModal(true); }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) await pacientesService.actualizar(editId, form);
      else await pacientesService.crear(form);
      setModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el paciente.');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Inactivar este paciente?')) return;
    await pacientesService.eliminar(id);
    cargar();
  }

  return (
    <div>
      <PageHeader titulo="Pacientes" descripcion="Gestión de pacientes de la clínica.">
        <button onClick={abrirNuevo} className="btn-primary btn-sm">+ Nuevo paciente</button>
      </PageHeader>

      <div className="card p-4 mb-4">
        <input className="input" placeholder="🔍 Buscar por nombre, documento o teléfono..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {cargando ? <Loader /> : pacientes.length === 0 ? <EmptyState mensaje="No hay pacientes." icono="🧑‍⚕️" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr><th className="px-4 py-3">Documento</th><th>Nombre</th><th>Edad</th><th>Teléfono</th><th>Ciudad</th><th className="px-4">Acciones</th></tr>
              </thead>
              <tbody>
                {pacientes.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">{p.tipo_documento} {p.numero_documento}</td>
                    <td className="font-medium text-slate-800">{p.nombres} {p.apellidos}</td>
                    <td>{p.edad ?? '—'}</td>
                    <td>{p.telefono || '—'}</td>
                    <td>{p.ciudad || '—'}</td>
                    <td className="px-4 space-x-3 whitespace-nowrap">
                      <Link to={`/admin/pacientes/${p.id}`} className="text-brand-600 hover:underline">Ver</Link>
                      <button onClick={() => abrirEditar(p)} className="text-slate-600 hover:underline">Editar</button>
                      <button onClick={() => eliminar(p.id)} className="text-red-600 hover:underline">Inactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal abierto={modal} titulo={editId ? 'Editar paciente' : 'Nuevo paciente'} onClose={() => setModal(false)} ancho="max-w-3xl">
        <form onSubmit={guardar} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Tipo doc.</label>
              <select className="input" value={form.tipo_documento} onChange={set('tipo_documento')}>
                {['CC', 'TI', 'CE', 'PA', 'RC', 'NIT', 'OTRO'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="label">Número documento *</label><input className="input" value={form.numero_documento} onChange={set('numero_documento')} required /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Nombres *</label><input className="input" value={form.nombres} onChange={set('nombres')} required /></div>
            <div><label className="label">Apellidos *</label><input className="input" value={form.apellidos} onChange={set('apellidos')} required /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="label">Fecha nacimiento</label><input type="date" className="input" value={form.fecha_nacimiento || ''} onChange={set('fecha_nacimiento')} /></div>
            <div>
              <label className="label">Género</label>
              <select className="input" value={form.genero || ''} onChange={set('genero')}>
                <option value="">—</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="OTRO">Otro</option>
              </select>
            </div>
            <div><label className="label">Teléfono</label><input className="input" value={form.telefono || ''} onChange={set('telefono')} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Correo</label><input type="email" className="input" value={form.correo || ''} onChange={set('correo')} /></div>
            <div><label className="label">Ciudad</label><input className="input" value={form.ciudad || ''} onChange={set('ciudad')} /></div>
          </div>
          <div><label className="label">Dirección</label><input className="input" value={form.direccion || ''} onChange={set('direccion')} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Contacto emergencia</label><input className="input" value={form.contacto_emergencia || ''} onChange={set('contacto_emergencia')} /></div>
            <div><label className="label">Tel. emergencia</label><input className="input" value={form.telefono_emergencia || ''} onChange={set('telefono_emergencia')} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Alergias</label><textarea className="input" rows="2" value={form.alergias || ''} onChange={set('alergias')} /></div>
            <div><label className="label">Enfermedades</label><textarea className="input" rows="2" value={form.enfermedades || ''} onChange={set('enfermedades')} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Antecedentes médicos</label><textarea className="input" rows="2" value={form.antecedentes_medicos || ''} onChange={set('antecedentes_medicos')} /></div>
            <div><label className="label">Antecedentes odontológicos</label><textarea className="input" rows="2" value={form.antecedentes_odontologicos || ''} onChange={set('antecedentes_odontologicos')} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.acepta_tratamiento_datos} onChange={set('acepta_tratamiento_datos')} />
            Acepta tratamiento de datos personales
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">{editId ? 'Guardar' : 'Crear paciente'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
