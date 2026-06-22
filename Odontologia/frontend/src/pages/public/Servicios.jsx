/**
 * frontend/src/pages/public/Servicios.jsx
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviciosService } from '../../services/serviciosService';
import { formatoMoneda } from '../../utils/format';
import Loader from '../../components/common/Loader';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('Todas');

  useEffect(() => {
    serviciosService.listarPublicos().then((r) => setServicios(r.data)).finally(() => setCargando(false));
  }, []);

  const categorias = ['Todas', ...new Set(servicios.map((s) => s.categoria))];
  const filtrados = categoria === 'Todas' ? servicios : servicios.filter((s) => s.categoria === categoria);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800">Servicios odontológicos</h1>
        <p className="text-slate-500 mt-3">Conoce todos los tratamientos que ofrecemos para tu salud bucal.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              categoria === c ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {cargando ? (
        <Loader />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((s) => (
            <div key={s.id} className="card p-6 hover:shadow-soft transition">
              <div className="h-12 w-12 grid place-items-center rounded-xl bg-brand-50 text-2xl mb-4">🦷</div>
              <span className="badge bg-teal-100 text-teal-700 mb-2">{s.categoria}</span>
              <h3 className="font-bold text-slate-800 text-lg">{s.nombre}</h3>
              <p className="text-sm text-slate-500 mt-2">{s.descripcion_corta}</p>
              {s.precio_base > 0 && <p className="text-brand-600 font-semibold mt-3 text-sm">Desde {formatoMoneda(s.precio_base)}</p>}
              <div className="flex gap-2 mt-4">
                <Link to={`/servicios/${s.id}`} className="btn-ghost btn-sm">Ver más</Link>
                <Link to="/reservar-cita" className="btn-primary btn-sm">Agendar</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
