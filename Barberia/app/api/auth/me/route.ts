import { getSesion } from "@/lib/auth";
import { ok, unauthorized, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const sesion = await getSesion();
    if (!sesion) return unauthorized();
    return ok({
      authUserId: sesion.authUserId,
      correo: sesion.correo,
      rol: sesion.rol,
      barberiaId: sesion.barberiaId,
      perfil: sesion.perfil,
    });
  } catch (err) {
    return handleError(err);
  }
}
