import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET() {
  try {
    await requirePermiso("caja.gestionar");
    const supabase = await createClient();
    const { data: caja } = await supabase
      .from("cajas").select("*").eq("barberia_id", BARBERIA_ID)
      .eq("estado", "abierta").order("abierta_at", { ascending: false }).limit(1).maybeSingle();

    if (!caja) return ok({ caja: null });

    const { data: movs } = await supabase
      .from("finanzas_movimientos").select("tipo, monto, concepto, metodo_pago, created_at")
      .eq("caja_id", caja.id).order("created_at", { ascending: false });
    let ingresos = 0, gastos = 0;
    for (const m of movs ?? []) {
      if (m.tipo === "ingreso") ingresos += Number(m.monto); else gastos += Number(m.monto);
    }

    return ok({ caja, movimientos: movs ?? [], ingresos, gastos, balance: Number(caja.monto_inicial) + ingresos - gastos });
  } catch (err) {
    return handleError(err);
  }
}
