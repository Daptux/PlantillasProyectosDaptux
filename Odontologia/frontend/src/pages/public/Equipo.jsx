/**
 * frontend/src/pages/public/Equipo.jsx
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { odontologosService } from '../../services/odontologosService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function Equipo() {
  const [equipo, setEquipo] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    odontologosService.listarPublicos().then((r) => setEquipo(r.data)).finally(() => setCargando(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800">Nuestro equipo odontológico</h1>
        <p className="text-slate-500 mt-3">Profesionales certificados que cuidan tu sonrisa.</p>
      </div>

      {cargando ? (
        <Loader />
      ) : equipo.length === 0 ? (
        <EmptyState mensaje="Pronto presentaremos a nuestro equipo." icono="👨‍⚕️" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipo.map((o) => (
            <div key={o.id} className="card overflow-hidden hover:shadow-soft transition">
              <img
                src={o.foto_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80'}
                alt={o.nombre}
                className="h-64 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-slate-800 text-lg">{o.nombre}</h3>
                <p className="text-sm text-brand-600">{o.especialidad}</p>
                {o.biografia && <p className="text-sm text-slate-500 mt-3">{o.biografia}</p>}
                <Link to="/reservar-cita" className="btn-outline btn-sm mt-4">Agendar con {o.nombre.split(' ')[0]}</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
