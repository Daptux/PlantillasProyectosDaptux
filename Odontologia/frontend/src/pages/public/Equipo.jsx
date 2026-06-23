// frontend/src/pages/public/Equipo.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { odontologosService } from '../../services/odontologosService';
import Loader from '../../components/common/Loader';

export default function Equipo() {
  const [equipo, setEquipo] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    odontologosService.listarPublicos()
      .then(({ data }) => setEquipo(data.datos || []))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-ink">Nuestro equipo</h1>
        <p className="mt-2 text-slate-500">Profesionales que cuidan tu sonrisa.</p>
      </div>
      {cargando ? (
        <Loader />
      ) : equipo.length === 0 ? (
        <p className="text-center text-slate-500">Pronto conocerás a nuestro equipo.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {equipo.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex h-48 items-center justify-center bg-brand-50 text-7xl">
                {o.foto_url ? <img src={o.foto_url} alt={o.nombre} className="h-full w-full object-cover" /> : '👨‍⚕️'}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-ink">{o.nombre}</h3>
                <p className="text-sm text-brand-600">{o.especialidad || 'Odontología general'}</p>
                {o.biografia && <p className="mt-2 text-sm text-slate-500">{o.biografia}</p>}
                <Link to="/reservar-cita" className="btn-outline mt-4 w-full text-sm">Agendar con este profesional</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
