// frontend/src/pages/admin/PacienteDetalle.jsx
// Vista detalle del paciente: datos, saldo, citas y accesos a historia/odontograma.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EstadoBadge from '../../components/common/EstadoBadge';
import { pacientesService } from '../../services/pacientesService';
import { pagosService } from '../../services/pagosService';
import { citasService } from '../../services/citasService';

const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function PacienteDetalle() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      pacientesService.obtener(id),
      pagosService.saldo(id).catch(() => ({ data: { datos: null } })),
      citasService.listar({ paciente_id: id }).catch(() => ({ data: { datos: [] } })),
    ]).then(([p, s, c]) => {
      setPaciente(p.data.datos);
      setSaldo(s.data.datos);
      setCitas(c.data.datos || []);
    }).finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <Loader />;
  if (!paciente) return <div className="card p-6 text-slate-500">Paciente no encontrado.</div>;

  const Dato = ({ label, valor }) => (
    <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-medium text-ink">{valor || '—'}</p></div>
  );

  return (
    <div>
      <PageHeader
        titulo={paciente.nombre}
        descripcion={`${paciente.tipo_documento} ${paciente.numero_documento}`}
        accion={
          <div className="flex gap-2">
            <Link to="/admin/historias" className="btn-outline">Historia clínica</Link>
            <Link to={`/admin/odontograma/${paciente.id}`} className="btn-primary">Odontograma</Link>
          </div>
        }
      />

      {saldo && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="card p-4"><p className="text-sm text-slate-500">Total tratamientos</p><p className="text-xl font-bold text-ink">{peso(saldo.total_tratamientos)}</p></div>
          <div className="card p-4"><p className="text-sm text-slate-500">Abonado</p><p className="text-xl font-bold text-green-600">{peso(saldo.total_abonado)}</p></div>
          <div className="card p-4"><p className="text-sm text-slate-500">Saldo pendiente</p><p className="text-xl font-bold text-red-500">{peso(saldo.saldo_pendiente)}</p></div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Datos personales</h2>
          <div className="grid grid-cols-2 gap-4">
            <Dato label="Teléfono" valor={paciente.telefono} />
            <Dato label="Correo" valor={paciente.correo} />
            <Dato label="Fecha de nacimiento" valor={paciente.fecha_nacimiento} />
            <Dato label="Género" valor={paciente.genero} />
            <Dato label="Dirección" valor={paciente.direccion} />
            <Dato label="Ocupación" valor={paciente.ocupacion} />
            <Dato label="Contacto emergencia" valor={paciente.contacto_emergencia_nombre} />
            <Dato label="Tel. emergencia" valor={paciente.contacto_emergencia_telefono} />
          </div>
          <div className="mt-4 space-y-2">
            <Dato label="Alergias" valor={paciente.alergias} />
            <Dato label="Antecedentes médicos" valor={paciente.antecedentes_medicos} />
            <Dato label="Antecedentes odontológicos" valor={paciente.antecedentes_odontologicos} />
            <Dato label="Observaciones" valor={paciente.observaciones} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Historial de citas</h2>
          {citas.length === 0 ? (
            <p className="text-sm text-slate-400">Sin citas registradas.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {citas.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{c.fecha} {c.hora_inicio?.slice(0, 5)} · {c.servicio_nombre || 'Consulta'}</span>
                  <EstadoBadge estado={c.estado} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
