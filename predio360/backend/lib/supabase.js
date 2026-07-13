/* Cliente Supabase compartido para las funciones serverless.
   Usa la Service Role Key SOLO en el backend (nunca en el frontend). */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('[Predio360] Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Configúralas en Vercel > Environment Variables.');
}

export const supabase = (url && key)
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;

export function hasDB() { return !!supabase; }
