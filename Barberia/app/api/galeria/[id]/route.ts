import { NextRequest } from "next/server";
import { crudFactory } from "@/lib/crud";
import { galeriaSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "galeria",
  permiso: "galeria.gestionar",
  schema: galeriaSchema,
  softDelete: true,
});

type Ctx = { params: Promise<{ id: string }> };
export async function PUT(req: NextRequest, { params }: Ctx) { return handlers.update(req, (await params).id); }
export async function DELETE(req: NextRequest, { params }: Ctx) { return handlers.remove(req, (await params).id); }
