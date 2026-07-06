"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, FileBarChart, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, MONTH_NAMES } from "@/lib/utils";

type Report = {
  id: string;
  title: string;
  type: string;
  month: number | null;
  year: number | null;
  format: string;
  status: string;
  fileUrl: string | null;
  clientName: string | null;
  createdAt: string;
};

type Option = { id: string; name: string };

export function ReportesView({ clients }: { clients: Option[] }) {
  const [rows, setRows] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/reportes");
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Generar reporte</Button>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={FileBarChart} title="Sin reportes" description="Genera el reporte mensual de un cliente en PDF listo para enviar." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reporte</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Descargar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)} · {r.format.toUpperCase()}</p>
                  </TableCell>
                  <TableCell className="text-sm">{r.clientName ?? "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.month ? `${MONTH_NAMES[r.month - 1]} ${r.year}` : "-"}
                  </TableCell>
                  <TableCell><Badge variant="success">Listo</Badge></TableCell>
                  <TableCell className="text-right">
                    {r.fileUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={`/api/reportes/${r.id}/download`} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" /> Descargar
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <GenerateDialog open={open} onOpenChange={setOpen} onSaved={load} clients={clients} />
    </div>
  );
}

function GenerateDialog({
  open, onOpenChange, onSaved, clients,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void; clients: Option[];
}) {
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [clientId, setClientId] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  async function generate() {
    if (!clientId) { toast.error("Selecciona un cliente"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/reportes/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, month, year }),
      });
      if (!res.ok) { toast.error("No se pudo generar el reporte"); return; }
      toast.success("Reporte generado");
      onOpenChange(false);
      onSaved();
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Generar reporte mensual</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Selecciona...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mes</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={generate} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Generar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
