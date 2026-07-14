import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Si es false, la columna no se muestra como fila en la tarjeta movil (util para acciones). */
  hideLabelOnCard?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string | number;
  loading?: boolean;
  emptyText?: string;
  /** Render opcional de la tarjeta movil. Si no se pasa, se genera desde las columnas. */
  renderCard?: (row: T) => ReactNode;
}

/**
 * Tabla de datos reutilizable y responsiva.
 * En escritorio se muestra como tabla; en movil cada fila se vuelve una tarjeta
 * legible (etiqueta + valor), evitando el scroll horizontal.
 */
export default function DataTable<T>({
  columns,
  rows,
  getKey,
  loading,
  emptyText = "Sin registros",
  renderCard,
}: DataTableProps<T>) {
  // Columnas "de contenido" (con encabezado) y columnas de acciones (encabezado vacio).
  const labeled = columns.filter((c) => c.header.trim() !== "");
  const actions = columns.filter((c) => c.header.trim() === "");

  const showEmpty = !loading && rows.length === 0;

  return (
    <>
      {/* ESCRITORIO: tabla */}
      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
              {columns.map((c, i) => (
                <th key={i} scope="col" className={cn("px-4 py-3", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  Cargando...
                </td>
              </tr>
            )}
            {showEmpty && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyText}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={getKey(row)} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                  {columns.map((c, i) => (
                    <td key={i} className={cn("px-4 py-3", c.className)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MOVIL: tarjetas */}
      <div className="space-y-3 md:hidden">
        {loading && (
          <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            Cargando...
          </div>
        )}
        {showEmpty && (
          <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        )}
        {!loading &&
          rows.map((row) =>
            renderCard ? (
              <div key={getKey(row)}>{renderCard(row)}</div>
            ) : (
              <div key={getKey(row)} className="rounded-xl border bg-card p-4 shadow-sm">
                <dl className="space-y-2">
                  {labeled.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 text-sm">
                      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {c.header}
                      </dt>
                      <dd className="min-w-0 text-right font-medium">{c.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
                {actions.length > 0 && (
                  <div className="mt-3 flex justify-end gap-1 border-t pt-3">
                    {actions.map((c, i) => (
                      <div key={i}>{c.cell(row)}</div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
      </div>
    </>
  );
}
