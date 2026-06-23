// frontend/src/pages/admin/Reportes.jsx
// Reportes básicos: citas por estado/fecha e ingresos por rango.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import EstadoBadge from '../../components/common/EstadoBadge';
import { citasService } from '../../services/citasService';
import { pagosService } from '../../services/pagosService';

const peso = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function Reportes() {
  const hoy = new Date().toISOString().slice(0, 10);
  const [rango, setRango] = useState({ desde: hoy.slice(0, 8) + '01', hasta: hoy });
  const [citas, setCitas] = useState([]);
  const [pagos, setPagos] = useState([]);

  async function cargar() {
    const [c, p] = await Promise.all([
      citasService.listar(),
      pagosService.listar({ desde: rango.desde, hasta: rango.hasta }),
    ]);
    setCitas(c.data.datos || []);
    setPagos(p.data.datos || []);
  }
  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [rango]);

  // Agrupa citas por estado
  const porEstado = citas.reduce((acc, c) => { acc[c.estado] = (acc[c.estado] || 0) + 1; return acc; }, {});
  const totalIngresos = pagos.reduce((s, p) => s + Number(p.monto), 0);

  // Ingresos por método de pago
  const porMetodo = pagos.reduce((acc, p) => { acc[p.metodo] = (acc[p.metodo] || 0) + Number(p.monto); return acc; }, {});

  return (
    <div>
      <PageHeader titulo="Reportes" descripcion="Indicadores de citas e ingresos" />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input" value={rango.desde} onChange={(e) => setRango({ ...rango, desde: e.target.value })} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input" value={rango.hasta} onChange={(e) => setRango({ ...rango, hasta: e.target.value })} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Citas por estado</h2>
          <ul className="space-y-2">
            {Object.entries(porEstado).map(([estado, n]) => (
              <li key={estado} className="flex items-center justify-between">
                <EstadoBadge estado={estado} />
                <span className="font-semibold">{n}</span>
              </li>
            ))}
            {Object.keys(porEstado).length === 0 && <p className="text-sm text-slate-400">Sin datos.</p>}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="mb-1 text-lg font-bold text-ink">Ingresos del periodo</h2>
          <p className="mb-4 text-3xl font-extrabold text-green-600">{peso(totalIngresos)}</p>
          <h3 className="mb-2 text-sm font-semibold text-slate-500">Por método de pago</h3>
          <ul className="space-y-2">
            {Object.entries(porMetodo).map(([metodo, monto]) => (
              <li key={metodo} className="flex items-center justify-between text-sm">
                <span className="badge bg-slate-100 text-slate-600">{metodo}</span>
                <span className="font-semibold">{peso(monto)}</span>
              </li>
            ))}
            {Object.keys(porMetodo).length === 0 && <p className="text-sm text-slate-400">Sin pagos en el rango.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
