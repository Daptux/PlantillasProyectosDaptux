import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable, { type Column } from "@/components/tables/DataTable";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/ui/search-input";
import UserModal from "@/components/modals/UserModal";
import { usersService } from "@/services/usersService";
import { useAuth } from "@/context/AuthContext";
import type { Usuario } from "@/types";

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: actual } = useAuth();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);

  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: () => usersService.listRoles() });
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["users", { search }],
    queryFn: () => usersService.list({ search }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] });
  const createMut = useMutation({ mutationFn: usersService.create, onSuccess: invalidate });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => usersService.update(id, payload),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({ mutationFn: usersService.remove, onSuccess: invalidate });

  const onSave = (payload: Record<string, unknown>, id?: number) =>
    id ? updateMut.mutateAsync({ id, payload }) : createMut.mutateAsync(payload);

  const onDelete = (u: Usuario) => {
    if (window.confirm(`Desactivar al usuario ${u.nombres} ${u.apellidos}?`)) deleteMut.mutate(u.id);
  };

  const columns: Column<Usuario>[] = [
    { header: "Nombre", cell: (u) => <span className="font-medium">{u.nombres} {u.apellidos}</span> },
    { header: "Email", cell: (u) => u.email },
    { header: "Rol", cell: (u) => <Badge variant="secondary">{u.rol_nombre}</Badge> },
    { header: "Ultimo acceso", cell: (u) => (u.ultimo_login ? u.ultimo_login.slice(0, 10) : "—") },
    { header: "Estado", cell: (u) => (u.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>) },
    {
      header: "",
      className: "text-right w-24",
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(u); setModalOpen(true); }} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          {u.id !== actual?.id && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(u)} aria-label="Eliminar">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios y roles"
        subtitle="Administra las cuentas de acceso de tu clinica."
        action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> Nuevo usuario</Button>}
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o email..." />

      <DataTable columns={columns} rows={usuarios} getKey={(u) => u.id} loading={isLoading} emptyText="No hay usuarios" />

      <UserModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} roles={roles} onSave={onSave} />
    </div>
  );
}
