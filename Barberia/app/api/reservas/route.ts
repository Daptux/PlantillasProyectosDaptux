import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail, handleError } from "@/lib/api-response";
import { reservaPublicaSchema } from "@/lib/validations";
import { requirePermiso } from "@/lib/auth";
import { BARBERIA_ID } from "@/lib/constants";

/**
 * GET /api/reservas — lista reservas (staff). Filtros: fecha, estado, barbero_id.
 */
export async function GET(req: NextRequest) {
  try {
    await requirePermiso("reservas.ver");
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");
    const estado = searchParams.get("estado");
    const barberoId = searchParams.get("barbero_id");
    const clienteId = searchParams.get("cliente_id");

    const supabase = await createClient();
    let q = supabase
      .from("reservas")
      .select("*, servicio:servicios(nombre), barbero:barberos(nombre), cliente:clientes(nombre, celular)")
      .eq("barberia_id", BARBERIA_ID)
      .is("deleted_at", null)
      .order("hora_inicio", { ascending: false })
      .limit(500);

    if (fecha) q = q.eq("fecha", fecha);
    if (estado) q = q.eq("estado", estado);
    if (barberoId) q = q.eq("barbero_id", barberoId);
    if (clienteId) q = q.eq("cliente_id", clienteId);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/reservas — crea una reserva desde la web publica.
 * Valida disponibilidad, calcula precio/hora_fin y define estado segun config.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = reservaPublicaSchema.parse(body);

    const admin = createAdminClient();

    // 1. Servicio (precio + duracion)
    const { data: servicio } = await admin
      .from("servicios")
      .select("id, precio, duracion_min, barberia_id, estado")
      .eq("id", input.servicio_id)
      .maybeSingle();
    if (!servicio || servicio.estado !== "activo") {
      return fail("El servicio no está disponible", 400);
    }

    const horaInicio = new Date(input.hora_inicio);
    const horaFin = new Date(horaInicio.getTime() + servicio.duracion_min * 60_000);

    // 2. Resolver barbero: si no viene, tomar el primero disponible que haga el servicio
    let barberoId = input.barbero_id ?? null;
    if (!barberoId) {
      const { data: cand } = await admin
        .from("barberos")
        .select("id, barbero_servicios!inner(servicio_id)")
        .eq("barberia_id", BARBERIA_ID)
        .eq("estado", "activo")
        .eq("barbero_servicios.servicio_id", input.servicio_id)
        .limit(1);
      barberoId = cand?.[0]?.id ?? null;
    }

    // 3. Validar que el barbero pueda hacer el servicio (si se especifico)
    if (barberoId) {
      const { count } = await admin
        .from("barbero_servicios")
        .select("id", { count: "exact", head: true })
        .eq("barbero_id", barberoId)
        .eq("servicio_id", input.servicio_id);
      if (!count) return fail("El barbero seleccionado no realiza este servicio", 400);
    }

    // 4. Validar solapamiento (defensa adicional al trigger de la BD)
    if (barberoId) {
      const { data: choques } = await admin
        .from("reservas")
        .select("id")
        .eq("barbero_id", barberoId)
        .in("estado", ["pendiente", "confirmada", "en_proceso"])
        .lt("hora_inicio", horaFin.toISOString())
        .gt("hora_fin", horaInicio.toISOString());
      if (choques && choques.length > 0) {
        return fail("Ese horario ya no está disponible. Elige otro.", 409);
      }
    }

    // 5. Estado segun config
    const { data: config } = await admin
      .from("configuracion_barberia")
      .select("reserva_automatica, mensaje_confirmacion")
      .eq("barberia_id", BARBERIA_ID)
      .maybeSingle();
    const estado = config?.reserva_automatica ? "confirmada" : "pendiente";

    // 6. Cliente: buscar por celular o crear
    let clienteId: string | null = null;
    if (input.cliente_celular) {
      const { data: existente } = await admin
        .from("clientes")
        .select("id")
        .eq("barberia_id", BARBERIA_ID)
        .eq("celular", input.cliente_celular)
        .maybeSingle();
      if (existente) {
        clienteId = existente.id;
      } else {
        const { data: nuevo } = await admin
          .from("clientes")
          .insert({
            barberia_id: BARBERIA_ID,
            nombre: input.cliente_nombre,
            celular: input.cliente_celular,
            correo: input.cliente_correo || null,
          })
          .select("id")
          .single();
        clienteId = nuevo?.id ?? null;
      }
    }

    // 7. Crear reserva
    const { data: reserva, error } = await admin
      .from("reservas")
      .insert({
        barberia_id: BARBERIA_ID,
        cliente_id: clienteId,
        barbero_id: barberoId,
        servicio_id: input.servicio_id,
        cliente_nombre: input.cliente_nombre,
        cliente_celular: input.cliente_celular,
        cliente_correo: input.cliente_correo || null,
        fecha: horaInicio.toISOString().slice(0, 10),
        hora_inicio: horaInicio.toISOString(),
        hora_fin: horaFin.toISOString(),
        precio: servicio.precio,
        estado,
        observaciones: input.observaciones || null,
        origen: "publico",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return ok(
      { reserva, mensaje: config?.mensaje_confirmacion },
      estado === "confirmada" ? "¡Reserva confirmada!" : "Reserva registrada",
      201
    );
  } catch (err) {
    return handleError(err);
  }
}
