import { createClient } from "@/lib/supabase/server";
import { ok, handleError } from "@/lib/api-response";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return ok(null, "Sesion cerrada");
  } catch (err) {
    return handleError(err);
  }
}
