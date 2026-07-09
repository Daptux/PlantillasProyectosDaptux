import { NextRequest } from "next/server";
import { calcularDisponibilidad } from "@/lib/disponibilidad";
import { ok, fail, handleError } from "@/lib/api-response";

/**
 * GET /api/disponibilidad?servicio_id=&barbero_id=&fecha=YYYY-MM-DD
 * Devuelve los horarios disponibles para reservar.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const servicioId = searchParams.get("servicio_id");
    const barberoId = searchParams.get("barbero_id");
    const fecha = searchParams.get("fecha");

    if (!servicioId || !fecha) {
      return fail("servicio_id y fecha son requeridos", 400);
    }

    const resultado = await calcularDisponibilidad({
      servicioId,
      barberoId: barberoId && barberoId !== "cualquiera" ? barberoId : null,
      fecha,
    });

    return ok(resultado);
  } catch (err) {
    return handleError(err);
  }
}
