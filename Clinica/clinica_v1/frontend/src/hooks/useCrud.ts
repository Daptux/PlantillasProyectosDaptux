import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Crud } from "@/services/adminService";

/**
 * Hook generico de CRUD sobre un recurso. Expone la query de listado y las
 * mutaciones de crear/actualizar/eliminar, invalidando la cache tras cada una.
 */
export function useCrud<T>(key: string, apiObj: Crud<T>, listParams?: Record<string, unknown>) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [key] });

  const list = useQuery({
    queryKey: [key, listParams ?? {}],
    queryFn: () => apiObj.list(listParams),
  });

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiObj.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      apiObj.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiObj.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
}
