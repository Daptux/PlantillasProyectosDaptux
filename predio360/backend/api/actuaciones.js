import { wrap, json, readBody } from '../lib/http.js';
import { supabase, hasDB } from '../lib/supabase.js';
import { demoActuaciones } from '../lib/demo.js';

export default wrap(async (req, res) => {
  if (req.method === 'GET') {
    if (!hasDB()) return json(res, 200, demoActuaciones);
    const q = supabase.from('actuaciones').select('*').order('fecha', { ascending: false });
    if (req.query.predio) q.eq('predio_id', req.query.predio);
    const { data, error } = await q;
    if (error) throw error;
    return json(res, 200, data);
  }
  if (req.method === 'POST') {
    const body = await readBody(req);
    if (!hasDB()) return json(res, 201, { ...body, id: 'AC-DEMO', _demo: true });
    const { data, error } = await supabase.from('actuaciones').insert(body).select().single();
    if (error) throw error;
    return json(res, 201, data);
  }
  json(res, 405, { error: 'method_not_allowed' });
});
