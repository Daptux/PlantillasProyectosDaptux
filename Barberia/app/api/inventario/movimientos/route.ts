import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { movimientoInventarioSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    await requirePermiso("inventario.gestionar");
    const { searchParams } = new URL(req.url);
    const productoId = searchParams.get("producto_id");
    const supabase = await createClient();
    let q = supabase
      .from("movimientos_inventario")
      .select("*, producto:productos(nombre)")
      .eq("barberia_id", BARBERIA_ID)
      .order("created_at", { ascending: false }).limit(300);
    if (productoId) q = q.eq("producto_id", productoId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sesion = await requirePermiso("inventario.gestionar");
    const body = await req.json();
    const input = movimientoInventarioSchema.parse(body);
    const supabase = await createClient();
    // El trigger de la BD aplica el cambio al stock del producto.
    const { data, error } = await supabase
      .from("movimientos_inventario")
      .insert({
        barberia_id: BARBERIA_ID,
        producto_id: input.producto_id,
        tipo: input.tipo,
        cantidad: input.cantidad,
        motivo: input.motivo ?? null,
        usuario_id: sesion.perfil?.id ?? null,
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return ok(data, "Movimiento registrado", 201);
  } catch (err) {
    return handleError(err);
  }
}
