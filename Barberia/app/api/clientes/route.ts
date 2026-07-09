import { crudFactory } from "@/lib/crud";
import { clienteSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "clientes",
  permiso: "clientes.ver",
  schema: clienteSchema,
  softDelete: true,
  transform: (d) => ({ ...d, correo: d.correo || null, celular: d.celular || null }),
});

export const GET = handlers.list;
export const POST = handlers.create;
