import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareReply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import DataTable, { type Column } from "@/components/tables/DataTable";
import PageHeader from "@/components/layout/PageHeader";
import PqrsfRespondModal from "@/components/modals/PqrsfRespondModal";
import { pqrsfService } from "@/services/pqrsfService";
import { TIPO_PQRSF_LABEL, ESTADO_PQRSF_LABEL, ESTADO_PQRSF_VARIANT, ESTADOS_PQRSF } from "@/lib/pqrsf";
import type { Pqrsf, EstadoPqrsf } from "@/types";

export default function PqrsfPage() {
  const qc = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<"" | EstadoPqrsf>("");
  const [selected, setSelected] = useState<Pqrsf | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["pqrsf", { estado: estadoFiltro }],
    queryFn: () => pqrsfService.list(estadoFiltro ? { estado: estadoFiltro } : {}),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["pqrsf"] });
  const respondMut = useMutation({
    mutationFn: ({ id, respuesta, estado }: { id: number; respuesta: string; estado: EstadoPqrsf }) =>
      pqrsfService.respond(id, respuesta, estado),
    onSuccess: invalidate,
  });

  const remitente = (q: Pqrsf) =>
    q.paciente_nombres ? `${q.paciente_nombres} ${q.paciente_apellidos}` : q.nombre_remitente ?? "Anonimo";

  const columns: Column<Pqrsf>[] = [
    { header: "Tipo", cell: (q) => <Badge variant="outline">{TIPO_PQRSF_LABEL[q.tipo]}</Badge> },
    { header: "Asunto", cell: (q) => <span className="font-medium">{q.asunto}</span> },
    { header: "Remitente", cell: remitente },
    { header: "Fecha", cell: (q) => q.created_at.slice(0, 10) },
    { header: "Estado", cell: (q) => <Badge variant={ESTADO_PQRSF_VARIANT[q.estado]}>{ESTADO_PQRSF_LABEL[q.estado]}</Badge> },
    {
      header: "",
      className: "text-right w-28",
      cell: (q) => (
        <Button variant="ghost" size="sm" onClick={() => { setSelected(q); setModalOpen(true); }}>
          <MessageSquareReply className="h-4 w-4" /> Responder
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="PQRSF"
        subtitle="Gestiona peticiones, quejas, reclamos, sugerencias y felicitaciones."
        action={
          <Select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value as "" | EstadoPqrsf)} className="w-full sm:w-48">
            <option value="">Todos los estados</option>
            {ESTADOS_PQRSF.map((s) => <option key={s} value={s}>{ESTADO_PQRSF_LABEL[s]}</option>)}
          </Select>
        }
      />

      <DataTable columns={columns} rows={items} getKey={(q) => q.id} loading={isLoading} emptyText="No hay solicitudes" />

      <PqrsfRespondModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        pqrsf={selected}
        onSave={(id, respuesta, estado) => respondMut.mutateAsync({ id, respuesta, estado })}
      />
    </div>
  );
}
