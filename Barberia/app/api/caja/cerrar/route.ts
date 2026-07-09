import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api-response";
import { cerrarCajaSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const sesion = await requirePermiso("caja.gestionar");
    const body = await req.json();
    const input = cerrarCajaSchema.parse(body);
    const supabase = await createClient();

    const { data: caja } = await supabase
      .from("cajas").select("id, abierta_at").eq("barberia_id", BARBERIA_ID)
      .eq("estado", "abierta").order("abierta_at", { ascending: false }).limit(1).maybeSingle();
    if (!caja) return fail("No hay caja abierta", 404);

    // Totales del periodo de la caja
    const { data: movs } = await supabase
      .from("finanzas_movimientos").select("tipo, monto").eq("caja_id", caja.id);
    let ingresos = 0, gastos = 0;
    for (const m of movs ?? []) {
      if (m.tipo === "ingreso") ingresos += Number(m.monto); else gastos += Number(m.monto);
    }

    const { data, error } = await supabase
      .from("cajas")
      .update({
        estado: "cerrada",
        cerrada_at: new Date().toISOString(),
        usuario_cierre: sesion.perfil?.id ?? null,
        monto_final: input.monto_final,
        total_ingresos: ingresos,
        total_gastos: gastos,
        observaciones: input.observaciones ?? null,
      })
      .eq("id", caja.id).select("*").single();
    if (error) throw new Error(error.message);
    return ok(data, "Caja cerrada");
  } catch (err) {
    return handleError(err);
  }
}
