import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string | number;
  loading?: boolean;
  emptyText?: string;
}

/** Tabla de datos reutilizable y responsiva. */
export default function DataTable<T>({
  columns,
  rows,
  getKey,
  loading,
  emptyText = "Sin registros",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
            {columns.map((c, i) => (
              <th key={i} className={cn("px-4 py-3", c.className)}>
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
          {!loading && rows.length === 0 && (
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
  );
}
