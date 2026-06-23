// frontend/src/pages/admin/Odontograma.jsx
// Odontograma visual: cuadrícula de dientes (notación FDI) editable por paciente.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { odontogramaService } from '../../services/historiasService';

// Cuadrantes de dentición permanente (FDI).
const CUADRANTES = [
  [18, 17, 16, 15, 14, 13, 12, 11],
  [21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41],
  [31, 32, 33, 34, 35, 36, 37, 38],
];

const ESTADOS = ['SANO', 'CARIES', 'RESTAURADO', 'CORONA', 'IMPLANTE', 'AUSENTE', 'ENDODONCIA', 'FRACTURA', 'EXTRACCION_INDICADA', 'MOVILIDAD', 'EN_TRATAMIENTO'];

// Color del diente según estado.
const COLOR = {
  SANO: 'bg-white border-slate-300 text-slate-700',
  CARIES: 'bg-red-100 border-red-400 text-red-700',
  RESTAURADO: 'bg-blue-100 border-blue-400 text-blue-700',
  CORONA: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  IMPLANTE: 'bg-purple-100 border-purple-400 text-purple-700',
  AUSENTE: 'bg-slate-200 border-slate-400 text-slate-400 line-through',
  ENDODONCIA: 'bg-orange-100 border-orange-400 text-orange-700',
  FRACTURA: 'bg-pink-100 border-pink-400 text-pink-700',
  EXTRACCION_INDICADA: 'bg-rose-200 border-rose-500 text-rose-700',
  MOVILIDAD: 'bg-amber-100 border-amber-400 text-amber-700',
  EN_TRATAMIENTO: 'bg-teal-100 border-teal-400 text-teal-700',
};

export default function Odontograma() {
  const { pacienteId } = useParams();
  const [registros, setRegistros] = useState({}); // { numero_diente: registro }
  const [cargando, setCargando] = useState(true);
  const [seleccion, setSeleccion] = useState(null); // diente seleccionado
  const [form, setForm] = useState({ estado: 'SANO', observaciones: '', tratamiento_sugerido: '', tratamiento_realizado: '' });
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await odontogramaService.obtener(pacienteId);
      const map = {};
      (data.datos || []).forEach((r) => { map[r.numero_diente] = r; });
      setRegistros(map);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [pacienteId]);

  function seleccionarDiente(num) {
    const reg = registros[num];
    setSeleccion(num);
    setForm({
      estado: reg?.estado || 'SANO',
      observaciones: reg?.observaciones || '',
      tratamiento_sugerido: reg?.tratamiento_sugerido || '',
      tratamiento_realizado: reg?.tratamiento_realizado || '',
    });
    setError('');
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      await odontogramaService.guardar({ paciente_id: Number(pacienteId), numero_diente: seleccion, ...form });
      setSeleccion(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar.');
    }
  }

  function Diente({ num }) {
    const reg = registros[num];
    const clase = COLOR[reg?.estado] || COLOR.SANO;
    return (
      <button
        onClick={() => seleccionarDiente(num)}
        className={`flex h-12 w-10 flex-col items-center justify-center rounded-lg border-2 text-xs font-semibold transition hover:scale-105 ${clase}`}
        title={reg?.estado || 'SANO'}
      >
        🦷
        <span className="text-[10px]">{num}</span>
      </button>
    );
  }

  return (
    <div>
      <PageHeader
        titulo="Odontograma"
        descripcion={`Paciente #${pacienteId}`}
        accion={<Link to="/admin/historias" className="btn-ghost">← Historias</Link>}
      />

      {cargando ? <Loader /> : (
        <div className="card p-6">
          <div className="mx-auto max-w-2xl space-y-3">
            {/* Arcada superior */}
            <div className="flex justify-center gap-1">
              {CUADRANTES[0].map((n) => <Diente key={n} num={n} />)}
              <div className="w-2" />
              {CUADRANTES[1].map((n) => <Diente key={n} num={n} />)}
            </div>
            <div className="border-t border-dashed border-slate-200" />
            {/* Arcada inferior */}
            <div className="flex justify-center gap-1">
              {CUADRANTES[2].map((n) => <Diente key={n} num={n} />)}
              <div className="w-2" />
              {CUADRANTES[3].map((n) => <Diente key={n} num={n} />)}
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs">
            {ESTADOS.map((s) => (
              <span key={s} className={`rounded-md border px-2 py-1 ${COLOR[s]}`}>{s.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}

      <Modal abierto={seleccion !== null} titulo={`Diente ${seleccion}`} onCerrar={() => setSeleccion(null)} ancho="max-w-md">
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              {ESTADOS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea rows="2" className="input" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>
          <div>
            <label className="label">Tratamiento sugerido</label>
            <input className="input" value={form.tratamiento_sugerido} onChange={(e) => setForm({ ...form, tratamiento_sugerido: e.target.value })} />
          </div>
          <div>
            <label className="label">Tratamiento realizado</label>
            <input className="input" value={form.tratamiento_realizado} onChange={(e) => setForm({ ...form, tratamiento_realizado: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setSeleccion(null)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
