import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Download, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DataTable, { type Column } from "@/components/tables/DataTable";
import { documentsService } from "@/services/documentsService";
import { TIPO_DOC_LABEL, TIPOS_DOCUMENTO, formatBytes } from "@/lib/documents";
import { getApiError } from "@/lib/apiError";
import type { DocumentoPaciente, TipoDocumento } from "@/types";

export default function PatientDocumentsPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState<TipoDocumento>("ORDEN_MEDICA");
  const [error, setError] = useState("");

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", "mine"],
    queryFn: () => documentsService.mine(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["documents"] });

  const uploadMut = useMutation({
    mutationFn: (file: File) => documentsService.upload(file, { tipo }),
    onSuccess: () => { invalidate(); if (fileRef.current) fileRef.current.value = ""; },
    onError: (e) => setError(getApiError(e)),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => documentsService.remove(id),
    onSuccess: invalidate,
  });

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setError(""); uploadMut.mutate(file); }
  };

  const columns: Column<DocumentoPaciente>[] = [
    { header: "Archivo", cell: (d) => (
      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {d.nombre_archivo}</span>
    ) },
    { header: "Tipo", cell: (d) => <Badge variant="outline">{TIPO_DOC_LABEL[d.tipo]}</Badge> },
    { header: "Tamano", cell: (d) => formatBytes(d.tamano_bytes) },
    { header: "Fecha", cell: (d) => d.created_at.slice(0, 10) },
    {
      header: "",
      className: "text-right w-24",
      cell: (d) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => documentsService.download(d.id, d.nombre_archivo)} aria-label="Descargar">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.confirm("Eliminar documento?") && deleteMut.mutate(d.id)} aria-label="Eliminar">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis documentos</h1>
        <p className="text-muted-foreground">Sube ordenes, autorizaciones y examenes previos (PDF, JPG, PNG, WEBP — max 10MB).</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <Label>Tipo de documento</Label>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoDocumento)} className="w-full sm:w-56">
            {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{TIPO_DOC_LABEL[t]}</option>)}
          </Select>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={onPick} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending} className="w-full sm:w-auto">
          <Upload className="h-4 w-4" /> {uploadMut.isPending ? "Subiendo..." : "Subir documento"}
        </Button>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <DataTable columns={columns} rows={docs} getKey={(d) => d.id} loading={isLoading} emptyText="Aun no has subido documentos" />
    </div>
  );
}
