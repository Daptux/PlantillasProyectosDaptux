/**
 * frontend/src/pages/admin/Odontograma.jsx
 * Odontograma visual por paciente (notación FDI). Click en un diente para editarlo.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { odontogramaService } from '../../services/historiasService';
import { pacientesService } from '../../services/pacientesService';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

// Cuadrantes de dentición permanente (FDI)
const cuadrantes = {
  supDer: [18, 17, 16, 15, 14, 13, 12, 11],
  supIzq: [21, 22, 23, 24, 25, 26, 27, 28],
  infIzq: [31, 32, 33, 34, 35, 36, 37, 38],
  infDer: [48, 47, 46, 45, 44, 43, 42, 41],
};

const ESTADOS = ['SANO', 'CARIES', 'RESTAURADO', 'CORONA', 'IMPLANTE', 'AUSENTE', 'ENDODONCIA', 'FRACTURA', 'EXTRACCION_INDICADA', 'MOVILIDAD', 'EN_TRATAMIENTO'];

const colorEstado = {
  SANO: 'bg-white border-slate-300 text-slate-600',
  CARIES: 'bg-red-100 border-red-400 text-red-700',
  RESTAURADO: 'bg-blue-100 border-blue-400 text-blue-700',
  CORONA: 'bg-amber-100 border-amber-400 text-amber-700',
  IMPLANTE: 'bg-purple-100 border-purple-400 text-purple-700',
  AUSENTE: 'bg-slate-200 border-slate-400 text-slate-400 line-through',
  ENDODONCIA: 'bg-indigo-100 border-indigo-400 text-indigo-700',
  FRACTURA: 'bg-orange-100 border-orange-400 text-orange-700',
  EXTRACCION_INDICADA: 'bg-rose-100 border-rose-500 text-rose-700',
  MOVILIDAD: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  EN_TRATAMIENTO: 'bg-teal-100 border-teal-400 text-teal-700',
};

export default function Odontograma() {
  const { pacienteId } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [mapa, setMapa] = useState({});   // { numero_diente: registro }
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [diente, setDiente] = useState(null);
  const [form, setForm] = useState({ estado: 'SANO', observaciones: '', tratamiento_sugerido: '', tratamiento_realizado: '' });

  async function cargar() {
    setCargando(true);
    const r = await odontogramaService.porPaciente(pacienteId);
    const m = {};
    r.data.forEach((d) => { m[d.numero_diente] = d; });
    setMapa(m);
    setCargando(false);
  }
  useEffect(() => {
    pacientesService.obtener(pacienteId).then((r) => setPaciente(r.data)).catch(() => {});
    cargar();
    // eslint-disable-next-line
  }, [pacienteId]);

  function abrirDiente(num) {
    const actual = mapa[num];
    setDiente(num);
    setForm({
      estado: actual?.estado || 'SANO',
      observaciones: actual?.observaciones || '',
      tratamiento_sugerido: actual?.tratamiento_sugerido || '',
      tratamiento_realizado: actual?.tratamiento_realizado || '',
    });
    setModal(true);
  }

  async function guardar(e) {
    e.preventDefault();
    await odontogramaService.guardar({ paciente_id: pacienteId, numero_diente: diente, ...form });
    setModal(false);
    cargar();
  }

  const Diente = ({ num }) => {
    const estado = mapa[num]?.estado || 'SANO';
    return (
      <button
        onClick={() => abrirDiente(num)}
        title={`Diente ${num} · ${estado}`}
        className={`h-12 w-10 rounded-lg border-2 text-xs font-bold flex items-center justify-center hover:scale-110 transition ${colorEstado[estado]}`}
      >
        {num}
      </button>
    );
  };

  if (cargando) return <Loader texto="Cargando odontograma..." />;

  return (
    <div>
      <Link to={`/admin/pacientes/${pacienteId}`} className="text-sm text-brand-600 hover:underline">← Volver al paciente</Link>
      <PageHeader titulo="Odontograma" descripcion={paciente ? `${paciente.nombres} ${paciente.apellidos}` : ''} />

      <div className="card p-6 overflow-x-auto">
        <div className="min-w-[640px] space-y-6">
          {/* Arcada superior */}
          <div className="flex justify-center gap-6">
            <div className="flex gap-1">{cuadrantes.supDer.map((n) => <Diente key={n} num={n} />)}</div>
            <div className="w-px bg-slate-200" />
            <div className="flex gap-1">{cuadrantes.supIzq.map((n) => <Diente key={n} num={n} />)}</div>
          </div>
          <div className="text-center text-xs text-slate-400">— Línea media —</div>
          {/* Arcada inferior */}
          <div className="flex justify-center gap-6">
            <div className="flex gap-1">{cuadrantes.infDer.map((n) => <Diente key={n} num={n} />)}</div>
            <div className="w-px bg-slate-200" />
            <div className="flex gap-1">{cuadrantes.infIzq.map((n) => <Diente key={n} num={n} />)}</div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="card p-4 mt-4 flex flex-wrap gap-2">
        {ESTADOS.map((e) => (
          <span key={e} className={`badge border ${colorEstado[e]}`}>{e}</span>
        ))}
      </div>

      <Modal abierto={modal} titulo={`Diente ${diente}`} onClose={() => setModal(false)} ancho="max-w-lg">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div><label className="label">Observaciones</label><textarea className="input" rows="2" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></div>
          <div><label className="label">Tratamiento sugerido</label><input className="input" value={form.tratamiento_sugerido} onChange={(e) => setForm({ ...form, tratamiento_sugerido: e.target.value })} /></div>
          <div><label className="label">Tratamiento realizado</label><input className="input" value={form.tratamiento_realizado} onChange={(e) => setForm({ ...form, tratamiento_realizado: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
