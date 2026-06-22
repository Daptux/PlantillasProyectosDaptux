/**
 * frontend/src/pages/admin/HistoriasClinicas.jsx
 * Selecciona un paciente, edita su historia clínica y registra evoluciones.
 */
import { useEffect, useState } from 'react';
import { pacientesService } from '../../services/pacientesService';
import { historiasService } from '../../services/historiasService';
import { formatoFechaHora } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';

const evolVacia = { procedimiento: '', diagnostico: '', descripcion: '', recomendaciones: '', medicamentos: '', proxima_cita_sugerida: '' };

export default function HistoriasClinicas() {
  const [pacientes, setPacientes] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [historia, setHistoria] = useState({ motivo_consulta: '', antecedentes: '', diagnostico: '', observaciones: '' });
  const [evoluciones, setEvoluciones] = useState([]);
  const [evol, setEvol] = useState(evolVacia);
  const [msg, setMsg] = useState('');

  useEffect(() => { const t = setTimeout(() => pacientesService.listar({ buscar }).then((r) => setPacientes(r.data)), 300); return () => clearTimeout(t); }, [buscar]);

  async function cargarPaciente(id) {
    setPacienteId(id);
    setMsg('');
    if (!id) return;
    const r = await historiasService.porPaciente(id);
    setHistoria(r.data.historia || { motivo_consulta: '', antecedentes: '', diagnostico: '', observaciones: '' });
    setEvoluciones(r.data.evoluciones || []);
  }

  async function guardarHistoria(e) {
    e.preventDefault();
    await historiasService.guardar({ paciente_id: pacienteId, ...historia });
    setMsg('Historia clínica guardada.');
  }

  async function guardarEvolucion(e) {
    e.preventDefault();
    await historiasService.crearEvolucion({ paciente_id: pacienteId, ...evol });
    setEvol(evolVacia);
    cargarPaciente(pacienteId);
  }

  return (
    <div>
      <PageHeader titulo="Historias clínicas" descripcion="Registro clínico de los pacientes (no se elimina, solo se agregan evoluciones)." />

      <div className="card p-4 mb-4 grid sm:grid-cols-2 gap-4">
        <input className="input" placeholder="🔍 Buscar paciente..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <select className="input" value={pacienteId} onChange={(e) => cargarPaciente(e.target.value)}>
          <option value="">Selecciona un paciente</option>
          {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} — {p.numero_documento}</option>)}
        </select>
      </div>

      {msg && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">{msg}</div>}

      {pacienteId && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Historia principal */}
          <form onSubmit={guardarHistoria} className="card p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Historia clínica principal</h3>
            <div><label className="label">Motivo de consulta</label><textarea className="input" rows="2" value={historia.motivo_consulta || ''} onChange={(e) => setHistoria({ ...historia, motivo_consulta: e.target.value })} /></div>
            <div><label className="label">Antecedentes</label><textarea className="input" rows="2" value={historia.antecedentes || ''} onChange={(e) => setHistoria({ ...historia, antecedentes: e.target.value })} /></div>
            <div><label className="label">Diagnóstico</label><textarea className="input" rows="2" value={historia.diagnostico || ''} onChange={(e) => setHistoria({ ...historia, diagnostico: e.target.value })} /></div>
            <div><label className="label">Observaciones</label><textarea className="input" rows="2" value={historia.observaciones || ''} onChange={(e) => setHistoria({ ...historia, observaciones: e.target.value })} /></div>
            <button className="btn-primary w-full">Guardar historia</button>
          </form>

          {/* Nueva evolución */}
          <form onSubmit={guardarEvolucion} className="card p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Registrar evolución</h3>
            <div><label className="label">Procedimiento</label><input className="input" value={evol.procedimiento} onChange={(e) => setEvol({ ...evol, procedimiento: e.target.value })} /></div>
            <div><label className="label">Descripción</label><textarea className="input" rows="2" value={evol.descripcion} onChange={(e) => setEvol({ ...evol, descripcion: e.target.value })} /></div>
            <div><label className="label">Recomendaciones</label><textarea className="input" rows="2" value={evol.recomendaciones} onChange={(e) => setEvol({ ...evol, recomendaciones: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Medicamentos</label><input className="input" value={evol.medicamentos} onChange={(e) => setEvol({ ...evol, medicamentos: e.target.value })} /></div>
              <div><label className="label">Próxima cita sugerida</label><input type="date" className="input" value={evol.proxima_cita_sugerida} onChange={(e) => setEvol({ ...evol, proxima_cita_sugerida: e.target.value })} /></div>
            </div>
            <button className="btn-secondary w-full">+ Agregar evolución</button>
          </form>
        </div>
      )}

      {pacienteId && evoluciones.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-3">Evoluciones registradas</h3>
          <div className="space-y-3">
            {evoluciones.map((e) => (
              <div key={e.id} className="card p-5">
                <div className="flex justify-between"><p className="font-semibold text-slate-800">{e.procedimiento || 'Evolución'}</p><span className="text-xs text-slate-400">{formatoFechaHora(e.created_at)}</span></div>
                {e.descripcion && <p className="text-sm text-slate-600 mt-2">{e.descripcion}</p>}
                {e.recomendaciones && <p className="text-sm text-slate-500 mt-1"><strong>Recomendaciones:</strong> {e.recomendaciones}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
