import { crudFactory } from "@/lib/crud";
import { galeriaSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "galeria",
  permiso: "galeria.gestionar",
  schema: galeriaSchema,
  softDelete: true,
  orderBy: { column: "orden", ascending: true },
});

export const GET = handlers.list;
export const POST = handlers.create;
