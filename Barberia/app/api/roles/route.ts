import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET() {
  try {
    await requirePermiso("usuarios.gestionar");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("roles")
      .select("id, clave, nombre")
      .eq("barberia_id", BARBERIA_ID)
      .order("nombre");
    if (error) throw new Error(error.message);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}
