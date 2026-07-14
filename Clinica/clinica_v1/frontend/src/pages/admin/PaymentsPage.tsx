import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import DataTable, { type Column } from "@/components/tables/DataTable";
import PageHeader from "@/components/layout/PageHeader";
import PaymentModal from "@/components/modals/PaymentModal";
import { paymentsService } from "@/services/paymentsService";
import {
  ESTADO_PAGO_LABEL,
  ESTADOS_PAGO,
  METODO_PAGO_LABEL,
  formatCOP,
} from "@/lib/payments";
import type { Pago, EstadoPago } from "@/types";

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<"" | EstadoPago>("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: pagos = [], isLoading } = useQuery({
    queryKey: ["payments", { estado: estadoFiltro }],
    queryFn: () => paymentsService.list(estadoFiltro ? { estado: estadoFiltro } : {}),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["payments"] });
  const createMut = useMutation({ mutationFn: paymentsService.create, onSuccess: invalidate });
  const statusMut = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPago }) => paymentsService.updateStatus(id, estado),
    onSuccess: invalidate,
  });

  const total = pagos.filter((p) => p.estado === "PAGADO").reduce((s, p) => s + Number(p.monto), 0);

  const columns: Column<Pago>[] = [
    { header: "Factura", cell: (p) => p.numero_factura ?? `#${p.id}` },
    { header: "Paciente", cell: (p) => `${p.paciente_nombres} ${p.paciente_apellidos}` },
    { header: "Concepto", cell: (p) => p.concepto ?? "—" },
    { header: "Monto", cell: (p) => <span className="font-medium">{formatCOP(p.monto)}</span> },
    { header: "Metodo", cell: (p) => METODO_PAGO_LABEL[p.metodo] },
    {
      header: "Estado",
      cell: (p) => (
        <Select
          value={p.estado}
          onChange={(e) => statusMut.mutate({ id: p.id, estado: e.target.value as EstadoPago })}
          className="h-8 w-36"
        >
          {ESTADOS_PAGO.map((s) => <option key={s} value={s}>{ESTADO_PAGO_LABEL[s]}</option>)}
        </Select>
      ),
    },
    { header: "Fecha pago", cell: (p) => (p.fecha_pago ? p.fecha_pago.slice(0, 10) : "—") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos y facturacion"
        subtitle={`Total recaudado (pagado): ${formatCOP(total)}`}
        action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Nueva factura</Button>}
      />

      <Select
        value={estadoFiltro}
        onChange={(e) => setEstadoFiltro(e.target.value as "" | EstadoPago)}
        className="w-full sm:w-48"
      >
        <option value="">Todos los estados</option>
        {ESTADOS_PAGO.map((s) => <option key={s} value={s}>{ESTADO_PAGO_LABEL[s]}</option>)}
      </Select>

      <DataTable columns={columns} rows={pagos} getKey={(p) => p.id} loading={isLoading} emptyText="No hay pagos" />

      <PaymentModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={(payload) => createMut.mutateAsync(payload)} />
    </div>
  );
}
