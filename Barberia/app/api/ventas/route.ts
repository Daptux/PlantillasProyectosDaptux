import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api-response";
import { ventaSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET() {
  try {
    await requirePermiso("ventas.gestionar");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ventas_productos")
      .select("*, cliente:clientes(nombre), detalle:detalle_ventas_productos(*)")
      .eq("barberia_id", BARBERIA_ID)
      .order("created_at", { ascending: false }).limit(300);
    if (error) throw new Error(error.message);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/ventas — registra una venta de productos:
 *  1. Crea la venta + detalle.
 *  2. Descuenta inventario (movimiento salida por item).
 *  3. Registra el ingreso financiero.
 */
export async function POST(req: NextRequest) {
  try {
    const sesion = await requirePermiso("ventas.gestionar");
    const body = await req.json();
    const input = ventaSchema.parse(body);
    const supabase = await createClient();

    // Cargar productos
    const ids = input.items.map((i) => i.producto_id);
    const { data: productos } = await supabase
      .from("productos").select("id, nombre, precio_venta")
      .eq("barberia_id", BARBERIA_ID).in("id", ids);
    if (!productos || productos.length !== ids.length) {
      return fail("Uno o más productos no existen", 400);
    }

    const detalle = input.items.map((i) => {
      const p = productos.find((x) => x.id === i.producto_id)!;
      const precio = Number(p.precio_venta ?? 0);
      return {
        producto_id: p.id,
        producto_nombre: p.nombre,
        cantidad: i.cantidad,
        precio_unitario: precio,
        subtotal: precio * i.cantidad,
      };
    });
    const total = detalle.reduce((a, b) => a + b.subtotal, 0);

    // 1. Venta
    const { data: venta, error: eVenta } = await supabase
      .from("ventas_productos")
      .insert({
        barberia_id: BARBERIA_ID,
        cliente_id: input.cliente_id ?? null,
        vendedor_id: sesion.perfil?.id ?? null,
        total,
        metodo_pago: input.metodo_pago,
        observaciones: input.observaciones ?? null,
      })
      .select("id").single();
    if (eVenta) throw new Error(eVenta.message);

    // 2. Detalle
    await supabase.from("detalle_ventas_productos")
      .insert(detalle.map((d) => ({ ...d, venta_id: venta.id })));

    // 3. Movimientos de inventario (salida) — el trigger descuenta stock
    await supabase.from("movimientos_inventario").insert(
      input.items.map((i) => ({
        barberia_id: BARBERIA_ID,
        producto_id: i.producto_id,
        tipo: "salida" as const,
        cantidad: i.cantidad,
        motivo: "Venta",
        referencia: venta.id,
        usuario_id: sesion.perfil?.id ?? null,
      }))
    );

    // 4. Ingreso financiero
    await supabase.from("finanzas_movimientos").insert({
      barberia_id: BARBERIA_ID,
      tipo: "ingreso",
      concepto: "Venta de productos",
      monto: total,
      metodo_pago: input.metodo_pago,
      venta_id: venta.id,
      usuario_id: sesion.perfil?.id ?? null,
    });

    return ok({ venta_id: venta.id, total }, "Venta registrada", 201);
  } catch (err) {
    return handleError(err);
  }
}
