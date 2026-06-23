// frontend/src/pages/admin/HistoriasClinicas.jsx
// Busca un paciente, muestra su historia clínica y permite añadir evoluciones.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import { pacientesService } from '../../services/pacientesService';
import { historiasService } from '../../services/historiasService';

export default function HistoriasClinicas() {
  const [buscar, setBuscar] = useState('');
  const [resultados, setResultados] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [historia, setHistoria] = useState(null);
  const [evoluciones, setEvoluciones] = useState([]);
  const [modal, setModal] = useState(false);
  const [evol, setEvol] = useState({ procedimiento: '', diagnostico: '', descripcion: '', recomendaciones: '', medicamentos: '', proxima_cita_sugerida: '' });
  const [error, setError] = useState('');

  async function buscarPacientes() {
    const { data } = await pacientesService.listar(buscar);
    setResultados(data.datos || []);
  }

  async function seleccionar(p) {
    setPaciente(p);
    setResultados([]);
    setBuscar('');
    const { data } = await historiasService.obtenerPorPaciente(p.id);
    setHistoria(data.datos.historia);
    setEvoluciones(data.datos.evoluciones || []);
  }

  async function guardarEvolucion(e) {
    e.preventDefault();
    setError('');
    try {
      await historiasService.crearEvolucion({
        paciente_id: paciente.id,
        historia_id: historia?.id,
        ...evol,
        proxima_cita_sugerida: evol.proxima_cita_sugerida || null,
      });
      setModal(false);
      setEvol({ procedimiento: '', diagnostico: '', descripcion: '', recomendaciones: '', medicamentos: '', proxima_cita_sugerida: '' });
      seleccionar(paciente);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo registrar la evolución.');
    }
  }

  return (
    <div>
      <PageHeader titulo="Historias clínicas" descripcion="Consulta y registro clínico de pacientes" />

      {!paciente ? (
        <div className="card p-6">
          <label className="label">Buscar paciente</label>
          <div className="flex gap-2">
            <input className="input max-w-sm" placeholder="Nombre, documento o teléfono…" value={buscar}
              onChange={(e) => setBuscar(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarPacientes()} />
            <button className="btn-primary" onClick={buscarPacientes}>Buscar</button>
          </div>
          {resultados.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100">
              {resultados.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{p.nombre} — {p.tipo_documento} {p.numero_documento}</span>
                  <button className="btn-outline text-xs" onClick={() => seleccionar(p)}>Abrir historia</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-lg font-bold text-ink">{paciente.nombre}</h2>
              <p className="text-sm text-slate-500">{paciente.tipo_documento} {paciente.numero_documento}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/odontograma/${paciente.id}`} className="btn-outline text-sm">Odontograma</Link>
              <button className="btn-primary" onClick={() => { setError(''); setModal(true); }}>+ Nueva evolución</button>
              <button className="btn-ghost" onClick={() => { setPaciente(null); setHistoria(null); setEvoluciones([]); }}>Cambiar paciente</button>
            </div>
          </div>

          {historia && (
            <div className="card p-5">
              <h3 className="mb-2 font-semibold text-ink">Historia clínica principal</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-slate-400">Motivo:</span> {historia.motivo_consulta || '—'}</p>
                <p><span className="text-slate-400">Diagnóstico:</span> {historia.diagnostico || '—'}</p>
                <p className="sm:col-span-2"><span className="text-slate-400">Antecedentes:</span> {historia.antecedentes || '—'}</p>
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-ink">Evoluciones ({evoluciones.length})</h3>
            {evoluciones.length === 0 ? (
              <p className="text-sm text-slate-400">Aún no hay evoluciones registradas.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {evoluciones.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-brand-500" />
                    <p className="text-xs text-slate-400">{ev.created_at?.slice(0, 16).replace('T', ' ')} · {ev.odontologo_nombre || 'Profesional'}</p>
                    <p className="font-medium text-ink">{ev.procedimiento || 'Evolución clínica'}</p>
                    {ev.descripcion && <p className="text-sm text-slate-600">{ev.descripcion}</p>}
                    {ev.recomendaciones && <p className="text-sm text-slate-500"><b>Recomendaciones:</b> {ev.recomendaciones}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      <Modal abierto={modal} titulo="Nueva evolución clínica" onCerrar={() => setModal(false)}>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardarEvolucion} className="space-y-4">
          <div>
            <label className="label">Procedimiento realizado</label>
            <input className="input" value={evol.procedimiento} onChange={(e) => setEvol({ ...evol, procedimiento: e.target.value })} />
          </div>
          <div>
            <label className="label">Diagnóstico</label>
            <input className="input" value={evol.diagnostico} onChange={(e) => setEvol({ ...evol, diagnostico: e.target.value })} />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea rows="3" className="input" value={evol.descripcion} onChange={(e) => setEvol({ ...evol, descripcion: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Recomendaciones</label>
              <input className="input" value={evol.recomendaciones} onChange={(e) => setEvol({ ...evol, recomendaciones: e.target.value })} />
            </div>
            <div>
              <label className="label">Medicamentos</label>
              <input className="input" value={evol.medicamentos} onChange={(e) => setEvol({ ...evol, medicamentos: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Próxima cita sugerida</label>
            <input type="date" className="input" value={evol.proxima_cita_sugerida} onChange={(e) => setEvol({ ...evol, proxima_cita_sugerida: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar evolución</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
