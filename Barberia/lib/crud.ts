import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermiso } from "@/lib/auth";
import { ok, fail, notFound, handleError } from "@/lib/api-response";
import { BARBERIA_ID } from "@/lib/constants";

/**
 * Factory de handlers CRUD para tablas con barberia_id y soft delete opcional.
 * Reduce el boilerplate de los Route Handlers manteniendo validacion Zod,
 * permisos y aislamiento por barberia.
 */
export function crudFactory<TSchema extends z.ZodTypeAny>(opts: {
  tabla: string;
  permiso: string;
  schema: TSchema;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  softDelete?: boolean;
  /** transforma el payload validado antes de insertar/actualizar */
  transform?: (data: z.infer<TSchema>) => Record<string, unknown>;
}) {
  const {
    tabla, permiso, schema, select = "*",
    orderBy = { column: "created_at", ascending: false },
    softDelete = false, transform,
  } = opts;

  async function list(req: NextRequest) {
    try {
      await requirePermiso(permiso);
      const supabase = await createClient();
      const { searchParams } = new URL(req.url);
      const q = searchParams.get("q");
      const estado = searchParams.get("estado");

      let query = supabase.from(tabla).select(select).eq("barberia_id", BARBERIA_ID);
      if (softDelete) query = query.is("deleted_at", null);
      if (estado) query = query.eq("estado", estado);
      if (q) query = query.ilike("nombre", `%${q}%`);
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false }).limit(500);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return ok(data);
    } catch (err) {
      return handleError(err);
    }
  }

  async function create(req: NextRequest) {
    try {
      await requirePermiso(permiso);
      const body = await req.json();
      const parsed = schema.parse(body);
      const payload = transform ? transform(parsed) : (parsed as Record<string, unknown>);

      const supabase = await createClient();
      const { data, error } = await supabase
        .from(tabla)
        .insert({ ...payload, barberia_id: BARBERIA_ID })
        .select(select)
        .single();
      if (error) throw new Error(error.message);
      return ok(data, "Creado correctamente", 201);
    } catch (err) {
      return handleError(err);
    }
  }

  async function update(req: NextRequest, id: string) {
    try {
      await requirePermiso(permiso);
      const body = await req.json();
      const parsed = (schema as unknown as z.AnyZodObject).partial().parse(body);
      const payload = transform ? transform(parsed as z.infer<TSchema>) : (parsed as Record<string, unknown>);

      const supabase = await createClient();
      const { data, error } = await supabase
        .from(tabla)
        .update(payload)
        .eq("id", id)
        .eq("barberia_id", BARBERIA_ID)
        .select(select)
        .single();
      if (error) throw new Error(error.message);
      if (!data) return notFound();
      return ok(data, "Actualizado correctamente");
    } catch (err) {
      return handleError(err);
    }
  }

  async function remove(_req: NextRequest, id: string) {
    try {
      await requirePermiso(permiso);
      const supabase = await createClient();
      if (softDelete) {
        const { error } = await supabase
          .from(tabla)
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id).eq("barberia_id", BARBERIA_ID);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from(tabla).delete().eq("id", id).eq("barberia_id", BARBERIA_ID);
        if (error) throw new Error(error.message);
      }
      return ok(null, "Eliminado correctamente");
    } catch (err) {
      return handleError(err);
    }
  }

  async function getOne(_req: NextRequest, id: string) {
    try {
      await requirePermiso(permiso);
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(tabla).select(select).eq("id", id).eq("barberia_id", BARBERIA_ID).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return notFound();
      return ok(data);
    } catch (err) {
      return handleError(err);
    }
  }

  return { list, create, update, remove, getOne };
}
