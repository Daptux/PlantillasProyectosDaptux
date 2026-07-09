import { crudFactory } from "@/lib/crud";
import { productoSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "productos",
  permiso: "inventario.gestionar",
  schema: productoSchema,
  softDelete: true,
  orderBy: { column: "nombre", ascending: true },
});

export const GET = handlers.list;
export const POST = handlers.create;
