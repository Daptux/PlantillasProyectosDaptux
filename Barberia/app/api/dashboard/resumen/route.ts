import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET() {
  try {
    await requirePermiso("dashboard.ver");
    const supabase = createAdminClient();
    const B = BARBERIA_ID;

    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().slice(0, 10);

    // Reservas de hoy por estado
    const { data: reservasHoy } = await supabase
      .from("reservas")
      .select("id, estado, precio, hora_inicio, cliente_nombre, servicio:servicios(nombre), barbero:barberos(nombre)")
      .eq("barberia_id", B)
      .eq("fecha", hoy)
      .is("deleted_at", null);

    const conteo = { total: 0, pendiente: 0, confirmada: 0, cancelada: 0, completada: 0 };
    for (const r of reservasHoy ?? []) {
      conteo.total++;
      if (r.estado in conteo) (conteo as Record<string, number>)[r.estado]++;
    }

    // Ingresos del dia y del mes
    const { data: ingHoy } = await supabase
      .from("finanzas_movimientos")
      .select("monto")
      .eq("barberia_id", B).eq("tipo", "ingreso").eq("fecha", hoy);
    const { data: ingMes } = await supabase
      .from("finanzas_movimientos")
      .select("monto")
      .eq("barberia_id", B).eq("tipo", "ingreso").gte("fecha", inicioMesStr);
    const { data: gastoMes } = await supabase
      .from("finanzas_movimientos")
      .select("monto")
      .eq("barberia_id", B).eq("tipo", "gasto").gte("fecha", inicioMesStr);

    const sum = (arr: { monto: number }[] | null) => (arr ?? []).reduce((a, b) => a + Number(b.monto), 0);
    const ingresosHoy = sum(ingHoy);
    const ingresosMes = sum(ingMes);
    const gastosMes = sum(gastoMes);

    // Servicios mas vendidos (mes) — desde reservas completadas
    const { data: completadas } = await supabase
      .from("reservas")
      .select("servicio_id, precio, barbero_id, servicio:servicios(nombre), barbero:barberos(nombre)")
      .eq("barberia_id", B).eq("estado", "completada").gte("fecha", inicioMesStr);

    const servMap = new Map<string, { nombre: string; cantidad: number }>();
    const barbMap = new Map<string, { nombre: string; total: number }>();
    for (const r of completadas ?? []) {
      const sNom = (r.servicio as { nombre?: string } | null)?.nombre ?? "Servicio";
      const s = servMap.get(sNom) ?? { nombre: sNom, cantidad: 0 };
      s.cantidad++; servMap.set(sNom, s);
      if (r.barbero_id) {
        const bNom = (r.barbero as { nombre?: string } | null)?.nombre ?? "Barbero";
        const b = barbMap.get(r.barbero_id) ?? { nombre: bNom, total: 0 };
        b.total += Number(r.precio); barbMap.set(r.barbero_id, b);
      }
    }
    const serviciosTop = [...servMap.values()].sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
    const barberosTop = [...barbMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);

    // Clientes nuevos (mes)
    const { count: clientesNuevos } = await supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .eq("barberia_id", B).gte("created_at", inicioMes.toISOString());

    // Proximas citas (desde ahora)
    const { data: proximas } = await supabase
      .from("reservas")
      .select("id, hora_inicio, cliente_nombre, estado, servicio:servicios(nombre), barbero:barberos(nombre)")
      .eq("barberia_id", B)
      .gte("hora_inicio", new Date().toISOString())
      .in("estado", ["pendiente", "confirmada"])
      .order("hora_inicio").limit(6);

    // Stock bajo
    const { data: productos } = await supabase
      .from("productos")
      .select("id, nombre, stock_actual, stock_minimo")
      .eq("barberia_id", B).eq("estado", "activo");
    const stockBajo = (productos ?? []).filter((p) => Number(p.stock_actual) <= Number(p.stock_minimo));

    // Ingresos ultimos 7 dias (para grafica)
    const serie: { dia: string; ingresos: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      serie.push({ dia: key.slice(5), ingresos: 0 });
    }
    const { data: ing7 } = await supabase
      .from("finanzas_movimientos")
      .select("monto, fecha")
      .eq("barberia_id", B).eq("tipo", "ingreso")
      .gte("fecha", serie[0] ? new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10) : hoy);
    for (const m of ing7 ?? []) {
      const key = String(m.fecha).slice(5);
      const item = serie.find((s) => s.dia === key);
      if (item) item.ingresos += Number(m.monto);
    }

    return ok({
      citas: conteo,
      ingresosHoy,
      ingresosMes,
      gastosMes,
      utilidadMes: ingresosMes - gastosMes,
      clientesNuevos: clientesNuevos ?? 0,
      serviciosTop,
      barberosTop,
      proximas: proximas ?? [],
      stockBajo,
      serieIngresos: serie,
    });
  } catch (err) {
    return handleError(err);
  }
}
