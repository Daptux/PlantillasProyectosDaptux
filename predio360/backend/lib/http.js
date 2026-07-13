/* Utilidades HTTP: CORS, JSON, manejo de errores. */
export function applyCors(req, res) {
  const origin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}

export function json(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
}

export function readBody(req) {
  return new Promise((resolve) => {
    if (req.body) return resolve(typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body);
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); } });
  });
}

export function wrap(handler) {
  return async (req, res) => {
    if (applyCors(req, res)) return;
    try { await handler(req, res); }
    catch (err) { console.error(err); json(res, 500, { error: 'internal_error', message: err.message }); }
  };
}
