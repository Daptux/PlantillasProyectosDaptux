"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Upload, Loader2, FileText, Check, X, Download, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { DOCUMENT_STATUS, pick } from "@/lib/labels";
import { formatBytes, formatDate, MONTH_NAMES } from "@/lib/utils";

type Doc = {
  id: string;
  clientName: string | null;
  typeName: string | null;
  month: number | null;
  year: number | null;
  originalName: string | null;
  internalName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  status: string;
  uploadedByExternal: boolean;
  createdAt: string;
};

type Option = { id: string; name: string };

export function DocumentosView({
  clients, documentTypes, canReview,
}: {
  clients: Option[]; documentTypes: Option[]; canReview: boolean;
}) {
  const [rows, setRows] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (clientId !== "all") p.set("clientId", clientId);
    if (status !== "all") p.set("status", status);
    const res = await fetch(`/api/documentos?${p}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, [clientId, status]);

  useEffect(() => { load(); }, [load]);

  async function review(id: string, action: "aprobar" | "rechazar") {
    const res = await fetch(`/api/documentos/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) { toast.success(action === "aprobar" ? "Documento aprobado" : "Documento rechazado"); load(); }
    else toast.error("No se pudo actualizar");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(DOCUMENT_STATUS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setOpen(true)}><Upload className="h-4 w-4" /> Subir documento</Button>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={FileText} title="Sin documentos" description="Sube documentos o pide al cliente que los cargue con un link seguro." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{d.internalName ?? d.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(d.fileSize)} · {formatDate(d.createdAt)}
                      {d.uploadedByExternal && " · cliente"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{d.clientName ?? "-"}</TableCell>
                  <TableCell className="text-sm">{d.typeName ?? "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.month ? `${MONTH_NAMES[d.month - 1]} ${d.year ?? ""}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={pick(DOCUMENT_STATUS, d.status).variant}>
                      {pick(DOCUMENT_STATUS, d.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {d.fileUrl && (
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <a href={d.fileUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      )}
                      {canReview && d.status === "pendiente" && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={() => review(d.id, "aprobar")}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => review(d.id, "rechazar")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <UploadDialog open={open} onOpenChange={setOpen} onSaved={load} clients={clients} documentTypes={documentTypes} />
    </div>
  );
}

function UploadDialog({
  open, onOpenChange, onSaved, clients, documentTypes,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void;
  clients: Option[]; documentTypes: Option[];
}) {
  const [loading, setLoading] = useState(false);
  const now = new Date();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get("clientId")) { toast.error("Selecciona un cliente"); return; }
    if (!(fd.get("file") as File)?.size) { toast.error("Selecciona un archivo"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { toast.error("No se pudo subir"); return; }
      toast.success("Documento subido");
      onOpenChange(false);
      onSaved();
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Subir documento</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <select name="clientId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
              <option value="">Selecciona...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-3">
              <Label>Tipo de documento</Label>
              <select name="documentTypeId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Sin tipo</option>
                {documentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Mes</Label>
              <select name="month" defaultValue={now.getMonth() + 1} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Input name="year" type="number" defaultValue={now.getFullYear()} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Archivo</Label>
            <Input name="file" type="file" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Subir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
