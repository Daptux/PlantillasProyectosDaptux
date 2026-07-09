import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { movimientoFinancieroSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    await requirePermiso("finanzas.ver");
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const tipo = searchParams.get("tipo");
    const metodo = searchParams.get("metodo");

    const supabase = await createClient();
    let q = supabase
      .from("finanzas_movimientos")
      .select("*, categoria:categorias_financieras(nombre), barbero:barberos(nombre)")
      .eq("barberia_id", BARBERIA_ID)
      .is("deleted_at", null)
      .order("fecha", { ascending: false })
      .limit(500);
    if (desde) q = q.gte("fecha", desde);
    if (hasta) q = q.lte("fecha", hasta);
    if (tipo) q = q.eq("tipo", tipo);
    if (metodo) q = q.eq("metodo_pago", metodo);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermiso("finanzas.gestionar");
    const body = await req.json();
    const input = movimientoFinancieroSchema.parse(body);

    const supabase = await createClient();

    // Caja abierta actual (opcional)
    const { data: caja } = await supabase
      .from("cajas").select("id").eq("barberia_id", BARBERIA_ID)
      .eq("estado", "abierta").order("abierta_at", { ascending: false }).limit(1).maybeSingle();

    const { data, error } = await supabase
      .from("finanzas_movimientos")
      .insert({
        barberia_id: BARBERIA_ID,
        caja_id: caja?.id ?? null,
        tipo: input.tipo,
        concepto: input.concepto,
        monto: input.monto,
        metodo_pago: input.metodo_pago,
        categoria_id: input.categoria_id ?? null,
        barbero_id: input.barbero_id ?? null,
        fecha: input.fecha ?? new Date().toISOString().slice(0, 10),
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return ok(data, "Movimiento registrado", 201);
  } catch (err) {
    return handleError(err);
  }
}
