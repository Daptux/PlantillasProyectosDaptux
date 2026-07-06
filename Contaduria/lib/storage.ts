import "server-only";
import { slugify, monthName } from "./utils";

/**
 * Capa de almacenamiento de archivos.
 * - En Vercel usa Vercel Blob (BLOB_READ_WRITE_TOKEN).
 * - Si no hay token, guarda en /public/uploads (solo desarrollo local).
 */

export type StoredFile = {
  url: string;
  size: number;
  extension: string;
  internalName: string;
};

/**
 * Genera el nombre interno del documento con el formato:
 *   Cliente_TipoDocumento_Mes_Año_Numero.ext
 * Ej: HotelPelt_FacturaCompra_Julio_2026_001.pdf
 */
export function buildInternalName(params: {
  clientName: string;
  documentTypeName: string;
  month?: number | null;
  year?: number | null;
  sequence: number;
  extension: string;
}): string {
  const cliente = slugify(params.clientName) || "Cliente";
  const tipo = slugify(params.documentTypeName) || "Documento";
  const mes = params.month ? monthName(params.month) : "SinMes";
  const anio = params.year ?? new Date().getFullYear();
  const num = String(params.sequence).padStart(3, "0");
  const ext = params.extension.replace(/^\./, "");
  return `${cliente}_${tipo}_${mes}_${anio}_${num}.${ext}`;
}

export function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin";
}

export async function uploadFile(
  file: File | Blob,
  internalName: string
): Promise<StoredFile> {
  const extension = getExtension(internalName);
  const size = file.size;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    // Vercel Blob
    const { put } = await import("@vercel/blob");
    const blob = await put(`documentos/${internalName}`, file, {
      access: "public",
      token,
      addRandomSuffix: true,
    });
    return { url: blob.url, size, extension, internalName };
  }

  // Fallback local (desarrollo): guarda en public/uploads
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const safeName = `${Date.now()}_${internalName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safeName), buffer);
  return {
    url: `/uploads/${safeName}`,
    size,
    extension,
    internalName,
  };
}
