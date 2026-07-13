import { wrap, json } from '../lib/http.js';
import { hasDB } from '../lib/supabase.js';

export default wrap(async (req, res) => {
  json(res, 200, {
    service: 'predio360-api',
    version: '1.0.0',
    status: 'ok',
    database: hasDB() ? 'supabase-connected' : 'demo-mode',
    time: new Date().toISOString(),
  });
});
