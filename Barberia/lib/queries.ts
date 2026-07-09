import { createClient } from "@/lib/supabase/server";
import { BARBERIA_ID } from "@/lib/constants";
import type {
  ConfiguracionBarberia, Servicio, Barbero, Promocion, Galeria, Testimonio,
  CategoriaServicio,
} from "@/types/database";

/**
 * Consultas server-side reutilizables para el contenido publico de la landing.
 * Todas se apoyan en RLS (lectura publica) y filtran por la barberia activa.
 */

export async function getConfiguracion(): Promise<ConfiguracionBarberia | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configuracion_barberia")
    .select("*")
    .eq("barberia_id", BARBERIA_ID)
    .maybeSingle();
  return (data as ConfiguracionBarberia) ?? null;
}

export async function getServicios(soloDestacados = false): Promise<Servicio[]> {
  const supabase = await createClient();
  let q = supabase
    .from("servicios")
    .select("*")
    .eq("barberia_id", BARBERIA_ID)
    .eq("estado", "activo")
    .is("deleted_at", null)
    .order("orden", { ascending: true });
  if (soloDestacados) q = q.eq("destacado", true);
  const { data } = await q;
  return (data as Servicio[]) ?? [];
}

export async function getCategoriasServicios(): Promise<CategoriaServicio[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categorias_servicios")
    .select("*")
    .eq("barberia_id", BARBERIA_ID)
    .eq("estado", "activo")
    .order("orden");
  return (data as CategoriaServicio[]) ?? [];
}

export async function getBarberos(soloDestacados = false): Promise<Barbero[]> {
  const supabase = await createClient();
  let q = supabase
    .from("barberos")
    .select("*")
    .eq("barberia_id", BARBERIA_ID)
    .eq("estado", "activo")
    .is("deleted_at", null)
    .order("orden");
  if (soloDestacados) q = q.eq("destacado", true);
  const { data } = await q;
  return (data as Barbero[]) ?? [];
}

export async function getPromociones(soloLanding = false): Promise<Promocion[]> {
  const supabase = await createClient();
  let q = supabase
    .from("promociones")
    .select("*")
    .eq("barberia_id", BARBERIA_ID)
    .eq("estado", "activo")
    .is("deleted_at", null)
    .order("orden");
  if (soloLanding) q = q.eq("mostrar_landing", true);
  const { data } = await q;
  return (data as Promocion[]) ?? [];
}

export async function getGaleria(): Promise<Galeria[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("galeria")
    .select("*")
    .eq("barberia_id", BARBERIA_ID)
    .eq("visible", true)
    .is("deleted_at", null)
    .order("orden");
  return (data as Galeria[]) ?? [];
}

export async function getTestimonios(): Promise<Testimonio[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonios")
    .select("*")
    .eq("barberia_id", BARBERIA_ID)
    .eq("visible", true)
    .is("deleted_at", null)
    .order("orden");
  return (data as Testimonio[]) ?? [];
}
