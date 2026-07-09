import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api-response";
import { abrirCajaSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const sesion = await requirePermiso("caja.gestionar");
    const body = await req.json();
    const input = abrirCajaSchema.parse(body);
    const supabase = await createClient();

    const { data: abierta } = await supabase
      .from("cajas").select("id").eq("barberia_id", BARBERIA_ID).eq("estado", "abierta").maybeSingle();
    if (abierta) return fail("Ya hay una caja abierta", 409);

    const { data, error } = await supabase
      .from("cajas")
      .insert({
        barberia_id: BARBERIA_ID,
        usuario_apertura: sesion.perfil?.id ?? null,
        monto_inicial: input.monto_inicial,
        observaciones: input.observaciones ?? null,
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return ok(data, "Caja abierta", 201);
  } catch (err) {
    return handleError(err);
  }
}
