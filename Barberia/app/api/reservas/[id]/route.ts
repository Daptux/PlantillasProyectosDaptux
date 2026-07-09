import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, notFound, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requirePermiso("reservas.ver");
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reservas")
      .select("*, servicio:servicios(*), barbero:barberos(*), cliente:clientes(*)")
      .eq("id", id).eq("barberia_id", BARBERIA_ID).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return notFound();
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requirePermiso("reservas.editar");
    const { id } = await params;
    const body = await req.json();
    const supabase = await createClient();

    // Campos editables desde el panel
    const editable: Record<string, unknown> = {};
    for (const k of ["barbero_id", "servicio_id", "hora_inicio", "hora_fin", "precio", "estado", "metodo_pago", "observaciones", "cliente_nombre", "cliente_celular"]) {
      if (body[k] !== undefined) editable[k] = body[k];
    }

    const { data, error } = await supabase
      .from("reservas").update(editable)
      .eq("id", id).eq("barberia_id", BARBERIA_ID).select("*").single();
    if (error) throw new Error(error.message);
    return ok(data, "Reserva actualizada");
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requirePermiso("reservas.eliminar");
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from("reservas")
      .update({ deleted_at: new Date().toISOString(), estado: "cancelada" })
      .eq("id", id).eq("barberia_id", BARBERIA_ID);
    if (error) throw new Error(error.message);
    return ok(null, "Reserva eliminada");
  } catch (err) {
    return handleError(err);
  }
}
