import { wrap, json, readBody } from '../../lib/http.js';
import { supabase, hasDB } from '../../lib/supabase.js';
import { demoPredios } from '../../lib/demo.js';

export default wrap(async (req, res) => {
  if (req.method === 'GET') {
    if (!hasDB()) return json(res, 200, demoPredios);
    const { data, error } = await supabase.from('predios').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return json(res, 200, data);
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    if (!body.nombre || !body.matricula) return json(res, 422, { error: 'validation', message: 'nombre y matricula son obligatorios' });
    if (!hasDB()) return json(res, 201, { ...body, id: 'PR-DEMO', _demo: true });
    const { data, error } = await supabase.from('predios').insert(body).select().single();
    if (error) throw error;
    return json(res, 201, data);
  }

  json(res, 405, { error: 'method_not_allowed' });
});
