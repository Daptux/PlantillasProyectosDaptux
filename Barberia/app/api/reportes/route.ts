import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

/**
 * GET /api/reportes?desde=&hasta=
 * Reporte consolidado: citas por estado, servicios top, barberos top,
 * clientes frecuentes/inactivos, productos con bajo stock.
 */
export async function GET(req: NextRequest) {
  try {
    await requirePermiso("reportes.ver");
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde") ?? new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const hasta = searchParams.get("hasta") ?? new Date().toISOString().slice(0, 10);

    const supabase = createAdminClient();
    const B = BARBERIA_ID;

    const { data: reservas } = await supabase
      .from("reservas")
      .select("estado, precio, servicio:servicios(nombre), barbero:barberos(nombre)")
      .eq("barberia_id", B).gte("fecha", desde).lte("fecha", hasta).is("deleted_at", null);

    const porEstado: Record<string, number> = {};
    const servMap = new Map<string, number>();
    const barbMap = new Map<string, number>();
    for (const r of reservas ?? []) {
      porEstado[r.estado] = (porEstado[r.estado] ?? 0) + 1;
      if (r.estado === "completada") {
        const s = (r.servicio as { nombre?: string } | null)?.nombre ?? "Servicio";
        servMap.set(s, (servMap.get(s) ?? 0) + 1);
        const b = (r.barbero as { nombre?: string } | null)?.nombre ?? "Barbero";
        barbMap.set(b, (barbMap.get(b) ?? 0) + Number(r.precio));
      }
    }

    const { data: frecuentes } = await supabase
      .from("clientes").select("nombre, numero_visitas, total_gastado")
      .eq("barberia_id", B).order("total_gastado", { ascending: false }).limit(10);

    const { data: productos } = await supabase
      .from("productos").select("nombre, stock_actual, stock_minimo")
      .eq("barberia_id", B).eq("estado", "activo");
    const stockBajo = (productos ?? []).filter((p) => Number(p.stock_actual) <= Number(p.stock_minimo));

    return ok({
      periodo: { desde, hasta },
      citasPorEstado: porEstado,
      serviciosTop: [...servMap.entries()].map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad),
      barberosTop: [...barbMap.entries()].map(([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total),
      clientesTop: frecuentes ?? [],
      stockBajo,
    });
  } catch (err) {
    return handleError(err);
  }
}
