"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Users, Loader2, MoreHorizontal, Eye, Pencil, Ban,
  CheckCircle2, PauseCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { ClientFormDialog } from "./client-form-dialog";
import { CLIENT_STATUS, RISK_LEVEL, pick } from "@/lib/labels";
import type { ClientInput } from "@/lib/validations";

type Row = {
  id: string;
  name: string;
  businessName: string | null;
  documentNumber: string;
  personType: string;
  status: string;
  riskLevel: string;
  city: string | null;
  assignedName: string | null;
};

type FirmUser = { id: string; name: string; role: string };

export function ClientesView({ users }: { users: FirmUser[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<(Partial<ClientInput> & { id: string }) | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (risk !== "all") params.set("risk", risk);
    params.set("page", String(page));
    const res = await fetch(`/api/clientes?${params}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, status, risk, page]);

  // Reinicia a pagina 1 cuando cambian los filtros
  useEffect(() => { setPage(1); }, [search, status, risk]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  async function openEdit(id: string) {
    const res = await fetch(`/api/clientes/${id}`);
    if (!res.ok) { toast.error("No se pudo cargar el cliente"); return; }
    const c = await res.json();
    setEditing({ ...c, email: c.email ?? "" });
    setDialogOpen(true);
  }

  async function changeStatus(id: string, newStatus: string, label: string) {
    const res = await fetch(`/api/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { toast.success(label); load(); }
    else toast.error("No se pudo actualizar");
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o NIT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="suspended">Suspendidos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo semaforo</SelectItem>
              <SelectItem value="verde">Al dia</SelectItem>
              <SelectItem value="amarillo">Atencion</SelectItem>
              <SelectItem value="rojo">Critico</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hay clientes"
            description="Crea tu primer cliente contable para empezar a organizar documentos, tareas y checklists."
            action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo cliente</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Semaforo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/clientes/${r.id}`} className="font-medium hover:underline">
                      {r.name}
                    </Link>
                    {r.businessName && (
                      <p className="text-xs text-muted-foreground">{r.businessName}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{r.documentNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.city ?? "-"}</TableCell>
                  <TableCell className="text-sm">{r.assignedName ?? "Sin asignar"}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm">
                      <span className={`h-2.5 w-2.5 rounded-full ${RISK_LEVEL[r.riskLevel]?.color ?? "bg-muted"}`} />
                      {RISK_LEVEL[r.riskLevel]?.label ?? r.riskLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pick(CLIENT_STATUS, r.status).variant}>
                      {pick(CLIENT_STATUS, r.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/clientes/${r.id}`)}>
                          <Eye className="h-4 w-4" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(r.id)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {r.status === "active" ? (
                          <>
                            <DropdownMenuItem onClick={() => changeStatus(r.id, "suspended", "Cliente suspendido")}>
                              <PauseCircle className="h-4 w-4" /> Suspender
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => changeStatus(r.id, "inactive", "Cliente desactivado")}
                            >
                              <Ban className="h-4 w-4" /> Desactivar
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            className="text-success"
                            onClick={() => changeStatus(r.id, "active", "Cliente reactivado")}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Reactivar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{total} cliente(s)</p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">{page} / {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <ClientFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={load}
        onDeleted={load}
        users={users}
        initial={editing}
      />
    </div>
  );
}
