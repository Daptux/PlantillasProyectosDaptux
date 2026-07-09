import { crudFactory } from "@/lib/crud";
import { promocionSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "promociones",
  permiso: "promociones.gestionar",
  schema: promocionSchema,
  softDelete: true,
  orderBy: { column: "orden", ascending: true },
  transform: ({ servicios, fecha_inicio, fecha_fin, ...d }) => ({
    ...d,
    fecha_inicio: fecha_inicio || null,
    fecha_fin: fecha_fin || null,
  }),
});

export const GET = handlers.list;
export const POST = handlers.create;
