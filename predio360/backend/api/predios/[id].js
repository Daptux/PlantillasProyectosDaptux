import { wrap, json, readBody } from '../../lib/http.js';
import { supabase, hasDB } from '../../lib/supabase.js';
import { demoPredios } from '../../lib/demo.js';

export default wrap(async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!hasDB()) return json(res, 200, demoPredios.find((p) => p.id === id) || { error: 'not_found' });
    const { data, error } = await supabase.from('predios').select('*').eq('id', id).single();
    if (error) return json(res, 404, { error: 'not_found' });
    return json(res, 200, data);
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = await readBody(req);
    if (!hasDB()) return json(res, 200, { id, ...body, _demo: true });
    const { data, error } = await supabase.from('predios').update(body).eq('id', id).select().single();
    if (error) throw error;
    return json(res, 200, data);
  }

  if (req.method === 'DELETE') {
    if (!hasDB()) return json(res, 204, {});
    const { error } = await supabase.from('predios').delete().eq('id', id);
    if (error) throw error;
    return json(res, 204, {});
  }

  json(res, 405, { error: 'method_not_allowed' });
});
