import { NextRequest } from "next/server";
import { crudFactory } from "@/lib/crud";
import { clienteSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "clientes",
  permiso: "clientes.gestionar",
  schema: clienteSchema,
  softDelete: true,
});

type Ctx = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: Ctx) { return handlers.getOne(req, (await params).id); }
export async function PUT(req: NextRequest, { params }: Ctx) { return handlers.update(req, (await params).id); }
export async function DELETE(req: NextRequest, { params }: Ctx) { return handlers.remove(req, (await params).id); }
