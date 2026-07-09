import { crudFactory } from "@/lib/crud";
import { testimonioSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "testimonios",
  permiso: "testimonios.gestionar",
  schema: testimonioSchema,
  softDelete: true,
  orderBy: { column: "orden", ascending: true },
  transform: (d) => ({ ...d, foto_url: d.foto_url || null }),
});

export const GET = handlers.list;
export const POST = handlers.create;
