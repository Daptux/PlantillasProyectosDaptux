/**
 * frontend/src/pages/admin/PacienteDetalle.jsx
 * Vista completa del paciente: datos, historia clínica, evoluciones, pagos y accesos.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pacientesService } from '../../services/pacientesService';
import { historiasService } from '../../services/historiasService';
import { pagosService } from '../../services/pagosService';
import { planesService } from '../../services/historiasService';
import { formatoFecha, formatoFechaHora, formatoMoneda, colorEstadoPlan } from '../../utils/format';
import Loader from '../../components/common/Loader';

const tabs = ['Información', 'Historia clínica', 'Evoluciones', 'Planes', 'Pagos'];

export default function PacienteDetalle() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [historia, setHistoria] = useState({ historia: null, evoluciones: [] });
  const [pagos, setPagos] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [tab, setTab] = useState('Información');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const [p, h, pg, sa, pl] = await Promise.all([
          pacientesService.obtener(id),
          historiasService.porPaciente(id).catch(() => ({ data: { historia: null, evoluciones: [] } })),
          pagosService.porPaciente(id).catch(() => ({ data: [] })),
          pagosService.saldo(id).catch(() => ({ data: null })),
          planesService.listar({ paciente_id: id }).catch(() => ({ data: [] })),
        ]);
        setPaciente(p.data);
        setHistoria(h.data);
        setPagos(pg.data);
        setSaldo(sa.data);
        setPlanes(pl.data);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  if (cargando) return <Loader texto="Cargando paciente..." />;
  if (!paciente) return <p className="text-slate-500">Paciente no encontrado.</p>;

  const Dato = ({ label, valor }) => (
    <div><p className="text-xs text-slate-400">{label}</p><p className="text-slate-800">{valor || '—'}</p></div>
  );

  return (
    <div>
      <Link to="/admin/pacientes" className="text-sm text-brand-600 hover:underline">← Volver a pacientes</Link>

      <div className="card p-6 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 grid place-items-center rounded-full bg-brand-500 text-white text-2xl font-bold">
            {paciente.nombres?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{paciente.nombres} {paciente.apellidos}</h1>
            <p className="text-slate-500 text-sm">{paciente.tipo_documento} {paciente.numero_documento} · {paciente.edad ?? '—'} años</p>
          </div>
        </div>
        <Link to={`/admin/odontograma/${id}`} className="btn-secondary btn-sm">🦷 Ver odontograma</Link>
      </div>

      <div className="flex gap-1 mt-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'Información' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 card p-6">
            <Dato label="Teléfono" valor={paciente.telefono} />
            <Dato label="Correo" valor={paciente.correo} />
            <Dato label="Género" valor={paciente.genero} />
            <Dato label="Fecha nacimiento" valor={formatoFecha(paciente.fecha_nacimiento)} />
            <Dato label="Ciudad" valor={paciente.ciudad} />
            <Dato label="Dirección" valor={paciente.direccion} />
            <Dato label="Ocupación" valor={paciente.ocupacion} />
            <Dato label="Contacto emergencia" valor={paciente.contacto_emergencia} />
            <Dato label="Tel. emergencia" valor={paciente.telefono_emergencia} />
            <Dato label="Alergias" valor={paciente.alergias} />
            <Dato label="Enfermedades" valor={paciente.enfermedades} />
            <Dato label="Medicamentos" valor={paciente.medicamentos} />
            <div className="sm:col-span-2 lg:col-span-3"><Dato label="Antecedentes médicos" valor={paciente.antecedentes_medicos} /></div>
            <div className="sm:col-span-2 lg:col-span-3"><Dato label="Antecedentes odontológicos" valor={paciente.antecedentes_odontologicos} /></div>
            <div className="sm:col-span-2 lg:col-span-3"><Dato label="Observaciones" valor={paciente.observaciones} /></div>
          </div>
        )}

        {tab === 'Historia clínica' && (
          <div className="card p-6 space-y-4">
            {historia.historia ? (
              <>
                <Dato label="Motivo de consulta" valor={historia.historia.motivo_consulta} />
                <Dato label="Antecedentes" valor={historia.historia.antecedentes} />
                <Dato label="Diagnóstico" valor={historia.historia.diagnostico} />
                <Dato label="Observaciones" valor={historia.historia.observaciones} />
                <p className="text-xs text-slate-400">Última actualización: {formatoFechaHora(historia.historia.updated_at)}</p>
              </>
            ) : (
              <p className="text-slate-500">Este paciente aún no tiene historia clínica. Puedes crearla desde el módulo de Historias clínicas.</p>
            )}
            <Link to="/admin/historias" className="btn-outline btn-sm">Gestionar historia clínica</Link>
          </div>
        )}

        {tab === 'Evoluciones' && (
          <div className="space-y-3">
            {historia.evoluciones.length === 0 ? (
              <p className="text-slate-500 card p-6">Sin evoluciones registradas.</p>
            ) : historia.evoluciones.map((e) => (
              <div key={e.id} className="card p-5">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-slate-800">{e.procedimiento || 'Evolución clínica'}</p>
                  <span className="text-xs text-slate-400">{formatoFechaHora(e.created_at)}</span>
                </div>
                {e.descripcion && <p className="text-sm text-slate-600 mt-2">{e.descripcion}</p>}
                {e.recomendaciones && <p className="text-sm text-slate-500 mt-1"><strong>Recomendaciones:</strong> {e.recomendaciones}</p>}
                {e.odontologo_nombre && <p className="text-xs text-brand-600 mt-2">Dr(a). {e.odontologo_nombre}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'Planes' && (
          <div className="space-y-3">
            {planes.length === 0 ? (
              <p className="text-slate-500 card p-6">Sin planes de tratamiento.</p>
            ) : planes.map((p) => (
              <div key={p.id} className="card p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">{p.nombre}</p>
                  <p className="text-sm text-slate-500">{formatoMoneda(p.total_final)}</p>
                </div>
                <span className={`badge ${colorEstadoPlan[p.estado]}`}>{p.estado}</span>
              </div>
            ))}
            <Link to="/admin/planes-tratamiento" className="btn-outline btn-sm">Gestionar planes</Link>
          </div>
        )}

        {tab === 'Pagos' && (
          <div className="space-y-4">
            {saldo && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="card p-5"><p className="text-xs text-slate-400">Total tratamientos</p><p className="text-xl font-bold text-slate-800">{formatoMoneda(saldo.total_tratamientos)}</p></div>
                <div className="card p-5"><p className="text-xs text-slate-400">Total abonado</p><p className="text-xl font-bold text-green-600">{formatoMoneda(saldo.total_abonado)}</p></div>
                <div className="card p-5"><p className="text-xs text-slate-400">Saldo pendiente</p><p className="text-xl font-bold text-red-600">{formatoMoneda(saldo.saldo_pendiente)}</p></div>
              </div>
            )}
            <div className="card overflow-hidden">
              {pagos.length === 0 ? <p className="p-6 text-slate-500">Sin pagos registrados.</p> : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th>Monto</th><th>Método</th><th>Concepto</th></tr></thead>
                  <tbody>
                    {pagos.map((pg) => (
                      <tr key={pg.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">{formatoFechaHora(pg.fecha)}</td>
                        <td className="font-medium text-green-600">{formatoMoneda(pg.monto)}</td>
                        <td>{pg.metodo}</td>
                        <td>{pg.concepto || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
