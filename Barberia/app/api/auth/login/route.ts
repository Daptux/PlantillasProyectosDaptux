import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, handleError } from "@/lib/api-response";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { correo, password } = loginSchema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });

    if (error) return fail("Credenciales invalidas", 401);

    // registrar ultimo acceso (best-effort)
    if (data.user) {
      await supabase
        .from("perfiles_usuario")
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq("auth_user_id", data.user.id);
    }

    return ok({ user: data.user }, "Sesion iniciada");
  } catch (err) {
    return handleError(err);
  }
}
