import { NextRequest } from "next/server";
import { crudFactory } from "@/lib/crud";
import { barberoSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "barberos",
  permiso: "barberos.gestionar",
  schema: barberoSchema,
  softDelete: true,
  transform: ({ servicios, fecha_ingreso, ...d }) => ({
    ...d,
    ...(fecha_ingreso !== undefined ? { fecha_ingreso: fecha_ingreso || null } : {}),
  }),
});

type Ctx = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: Ctx) { return handlers.getOne(req, (await params).id); }
export async function PUT(req: NextRequest, { params }: Ctx) { return handlers.update(req, (await params).id); }
export async function DELETE(req: NextRequest, { params }: Ctx) { return handlers.remove(req, (await params).id); }
