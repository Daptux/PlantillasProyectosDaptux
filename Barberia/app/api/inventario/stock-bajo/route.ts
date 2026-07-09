import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET() {
  try {
    await requirePermiso("inventario.gestionar");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("barberia_id", BARBERIA_ID)
      .eq("estado", "activo")
      .is("deleted_at", null);
    if (error) throw new Error(error.message);
    const bajos = (data ?? []).filter((p) => Number(p.stock_actual) <= Number(p.stock_minimo));
    return ok(bajos);
  } catch (err) {
    return handleError(err);
  }
}
