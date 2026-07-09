import { NextRequest } from "next/server";
import { crudFactory } from "@/lib/crud";
import { promocionSchema } from "@/lib/validations";

const handlers = crudFactory({
  tabla: "promociones",
  permiso: "promociones.gestionar",
  schema: promocionSchema,
  softDelete: true,
  transform: ({ servicios, fecha_inicio, fecha_fin, ...d }) => ({
    ...d,
    ...(fecha_inicio !== undefined ? { fecha_inicio: fecha_inicio || null } : {}),
    ...(fecha_fin !== undefined ? { fecha_fin: fecha_fin || null } : {}),
  }),
});

type Ctx = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: Ctx) { return handlers.getOne(req, (await params).id); }
export async function PUT(req: NextRequest, { params }: Ctx) { return handlers.update(req, (await params).id); }
export async function DELETE(req: NextRequest, { params }: Ctx) { return handlers.remove(req, (await params).id); }
