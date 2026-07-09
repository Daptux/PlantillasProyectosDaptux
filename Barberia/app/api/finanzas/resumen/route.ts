import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    await requirePermiso("finanzas.ver");
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde") ?? new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const hasta = searchParams.get("hasta") ?? new Date().toISOString().slice(0, 10);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("finanzas_movimientos")
      .select("tipo, monto, metodo_pago, categoria:categorias_financieras(nombre)")
      .eq("barberia_id", BARBERIA_ID).is("deleted_at", null)
      .gte("fecha", desde).lte("fecha", hasta);
    if (error) throw new Error(error.message);

    let ingresos = 0, gastos = 0;
    const porMetodo: Record<string, number> = {};
    const porCategoria: Record<string, number> = {};
    for (const m of data ?? []) {
      const monto = Number(m.monto);
      if (m.tipo === "ingreso") ingresos += monto; else gastos += monto;
      porMetodo[m.metodo_pago] = (porMetodo[m.metodo_pago] ?? 0) + monto;
      const cat = (m.categoria as { nombre?: string } | null)?.nombre ?? "Sin categoría";
      if (m.tipo === "gasto") porCategoria[cat] = (porCategoria[cat] ?? 0) + monto;
    }

    return ok({
      ingresos, gastos, utilidad: ingresos - gastos,
      porMetodo, porCategoria, desde, hasta,
    });
  } catch (err) {
    return handleError(err);
  }
}
