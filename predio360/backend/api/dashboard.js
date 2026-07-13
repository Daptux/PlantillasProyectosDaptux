import { wrap, json } from '../lib/http.js';
import { supabase, hasDB } from '../lib/supabase.js';
import { demoDashboard } from '../lib/demo.js';

export default wrap(async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'method_not_allowed' });
  if (!hasDB()) return json(res, 200, demoDashboard);

  // Indicadores agregados desde la base
  const [{ count: predios }, { count: expedientes }, { count: hallazgos }] = await Promise.all([
    supabase.from('predios').select('*', { count: 'exact', head: true }),
    supabase.from('predios').select('*', { count: 'exact', head: true }).gte('avance', 100),
    supabase.from('hallazgos').select('*', { count: 'exact', head: true }).eq('estado', 'Abierto'),
  ]);

  json(res, 200, {
    kpis: [
      { key: 'predios', label: 'Predios registrados', val: String(predios ?? 0) },
      { key: 'expedientes', label: 'Expedientes completos', val: String(expedientes ?? 0) },
      { key: 'hallazgos', label: 'Hallazgos abiertos', val: String(hallazgos ?? 0) },
    ],
  });
});
