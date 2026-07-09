import { NextRequest } from "next/server";
import { crudFactory } from "@/lib/crud";
import { servicioSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "servicios",
  permiso: "servicios.gestionar",
  schema: servicioSchema,
  softDelete: true,
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return handlers.getOne(req, (await params).id);
}
export async function PUT(req: NextRequest, { params }: Ctx) {
  return handlers.update(req, (await params).id);
}
export async function DELETE(req: NextRequest, { params }: Ctx) {
  return handlers.remove(req, (await params).id);
}
