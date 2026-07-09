import { crudFactory } from "@/lib/crud";
import { servicioSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "servicios",
  permiso: "servicios.gestionar",
  schema: servicioSchema,
  softDelete: true,
  orderBy: { column: "orden", ascending: true },
  transform: (d) => ({ ...d }),
});

export const GET = handlers.list;
export const POST = handlers.create;
