import { crudFactory } from "@/lib/crud";
import { barberoSchema } from "@/lib/validations";

// Nota: la asignacion de servicios (barbero_servicios) se gestiona aparte;
// aqui se descarta el campo `servicios` del payload.
const handlers = crudFactory({
  tabla: "barberos",
  permiso: "barberos.gestionar",
  schema: barberoSchema,
  softDelete: true,
  orderBy: { column: "orden", ascending: true },
  transform: ({ servicios, fecha_ingreso, ...d }) => ({
    ...d,
    fecha_ingreso: fecha_ingreso || null,
  }),
});

export const GET = handlers.list;
export const POST = handlers.create;
