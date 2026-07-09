import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { cambiarEstadoReservaSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/reservas/[id]/estado
 * Cambia el estado de la reserva. Al pasar a 'completada', el trigger de la BD
 * registra ingreso + comision automaticamente.
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requirePermiso("reservas.editar");
    const { id } = await params;
    const body = await req.json();
    const { estado, metodo_pago } = cambiarEstadoReservaSchema.parse(body);

    const supabase = await createClient();
    const update: Record<string, unknown> = { estado };
    if (metodo_pago) update.metodo_pago = metodo_pago;

    const { data, error } = await supabase
      .from("reservas").update(update)
      .eq("id", id).eq("barberia_id", BARBERIA_ID).select("*").single();
    if (error) throw new Error(error.message);
    return ok(data, "Estado actualizado");
  } catch (err) {
    return handleError(err);
  }
}
