import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Download, Trash2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/tables/DataTable";
import ResultUploadModal from "@/components/modals/ResultUploadModal";
import { resultsService } from "@/services/resultsService";
import type { ResultadoMedico } from "@/types";

export default function ResultsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: resultados = [], isLoading } = useQuery({
    queryKey: ["results", "all"],
    queryFn: () => resultsService.list(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["results"] });

  const uploadMut = useMutation({
    mutationFn: ({ extra, file }: { extra: Record<string, string | number>; file: File | null }) =>
      resultsService.upload(extra, file),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => resultsService.remove(id),
    onSuccess: invalidate,
  });

  const columns: Column<ResultadoMedico>[] = [
    { header: "Titulo", cell: (r) => <span className="font-medium">{r.titulo}</span> },
    { header: "Paciente", cell: (r) => `${r.paciente_nombres} ${r.paciente_apellidos}` },
    { header: "Servicio", cell: (r) => r.servicio_nombre ?? "—" },
    { header: "Fecha", cell: (r) => r.fecha_resultado ?? r.created_at.slice(0, 10) },
    {
      header: "Archivo",
      cell: (r) => (r.url ? <Paperclip className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground">—</span>),
    },
    {
      header: "",
      className: "text-right w-24",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          {r.url && (
            <Button variant="ghost" size="icon" onClick={() => resultsService.download(r.id, r.titulo)} aria-label="Descargar">
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => window.confirm("Eliminar resultado?") && deleteMut.mutate(r.id)} aria-label="Eliminar">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Resultados medicos</h1>
          <p className="text-muted-foreground">Carga y administra los resultados de los pacientes.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Cargar resultado</Button>
      </div>

      <DataTable columns={columns} rows={resultados} getKey={(r) => r.id} loading={isLoading} emptyText="No hay resultados" />

      <ResultUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(extra, file) => uploadMut.mutateAsync({ extra, file })}
      />
    </div>
  );
}
