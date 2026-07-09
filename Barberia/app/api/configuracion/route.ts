import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-response";
import { configuracionSchema } from "@/lib/validations";
import { getSesion } from "@/lib/auth";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET() {
  try {
    await getSesion();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("configuracion_barberia").select("*")
      .eq("barberia_id", BARBERIA_ID).maybeSingle();
    if (error) throw new Error(error.message);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermiso("configuracion.gestionar");
    const body = await req.json();
    const input = configuracionSchema.partial().parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("configuracion_barberia")
      .update(input)
      .eq("barberia_id", BARBERIA_ID)
      .select("*").single();
    if (error) throw new Error(error.message);
    return ok(data, "Configuración actualizada");
  } catch (err) {
    return handleError(err);
  }
}
