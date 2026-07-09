import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, handleError } from "@/lib/api-response";
import { contactoSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

/** POST publico: guarda un lead de contacto. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactoSchema.parse(body);

    const supabase = createAdminClient();
    const { error } = await supabase.from("leads_contacto").insert({
      barberia_id: BARBERIA_ID,
      nombre: data.nombre,
      celular: data.celular,
      correo: data.correo || null,
      mensaje: data.mensaje,
      origen: "contacto",
    });
    if (error) throw new Error(error.message);

    return ok(null, "Mensaje recibido");
  } catch (err) {
    return handleError(err);
  }
}
