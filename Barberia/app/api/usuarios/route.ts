import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermiso } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api-response";
import { usuarioSchema } from "@/lib/validations";
import { BARBERIA_ID } from "@/lib/constants";

export async function GET() {
  try {
    await requirePermiso("usuarios.gestionar");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("perfiles_usuario")
      .select("*, rol:roles(nombre, clave)")
      .eq("barberia_id", BARBERIA_ID)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/usuarios — crea un usuario de Supabase Auth (service role) y su perfil.
 */
export async function POST(req: NextRequest) {
  try {
    await requirePermiso("usuarios.gestionar");
    const body = await req.json();
    const input = usuarioSchema.parse(body);
    if (!input.password) return fail("La contraseña es requerida para crear el usuario", 400);

    const admin = createAdminClient();

    // 1. Crear usuario auth
    const { data: authUser, error: eAuth } = await admin.auth.admin.createUser({
      email: input.correo,
      password: input.password,
      email_confirm: true,
      user_metadata: { nombre: input.nombre },
    });
    if (eAuth || !authUser.user) return fail(eAuth?.message ?? "No se pudo crear el usuario", 400);

    // 2. Crear perfil
    const { data: perfil, error: ePerfil } = await admin
      .from("perfiles_usuario")
      .insert({
        auth_user_id: authUser.user.id,
        barberia_id: BARBERIA_ID,
        rol_id: input.rol_id,
        nombre: input.nombre,
        correo: input.correo,
        celular: input.celular || null,
        estado: input.estado ?? "activo",
      })
      .select("*").single();
    if (ePerfil) {
      // rollback del auth user si el perfil falla
      await admin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(ePerfil.message);
    }

    return ok(perfil, "Usuario creado", 201);
  } catch (err) {
    return handleError(err);
  }
}
