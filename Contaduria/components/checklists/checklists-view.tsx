"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, ListChecks, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { RISK_LEVEL, CHECKLIST_ITEM_STATUS, pick } from "@/lib/labels";
import { MONTH_NAMES } from "@/lib/utils";

type Row = {
  id: string;
  clientName: string;
  status: string;
  progress: number;
  riskLevel: string;
};

type Item = {
  id: string;
  title: string;
  status: string;
  isCritical: boolean;
  notes: string | null;
};

export function ChecklistsView({ canClose }: { canClose: boolean }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/checklists?month=${month}&year=${year}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  async function generate() {
    const res = await fetch("/api/checklists/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    });
    const data = await res.json();
    if (res.ok) { toast.success(`${data.created} checklist(s) generado(s)`); load(); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[year - 1, year, year + 1].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate}><RefreshCw className="h-4 w-4" /> Generar checklists del mes</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin checklists este mes"
          description="Genera los checklists mensuales de tus clientes activos con un clic."
          action={<Button onClick={generate}><RefreshCw className="h-4 w-4" /> Generar checklists</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => setDetail({ id: r.id, name: r.clientName })}
              className="rounded-xl border bg-card p-5 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <p className="font-medium">{r.clientName}</p>
                <span className={`h-2.5 w-2.5 mt-1.5 rounded-full ${RISK_LEVEL[r.riskLevel]?.color}`} />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Avance</span>
                  <span className="font-medium">{r.progress}%</span>
                </div>
                <Progress
                  value={r.progress}
                  indicatorClassName={RISK_LEVEL[r.riskLevel]?.color}
                />
              </div>
              <div className="mt-3">
                <Badge variant={r.status === "cerrado" ? "muted" : "secondary"}>
                  {r.status === "cerrado" ? "Mes cerrado" : "Abierto"}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      {detail && (
        <ChecklistDetail
          checklistId={detail.id}
          clientName={detail.name}
          canClose={canClose}
          onClose={() => { setDetail(null); load(); }}
        />
      )}
    </div>
  );
}

function ChecklistDetail({
  checklistId, clientName, canClose, onClose,
}: {
  checklistId: string; clientName: string; canClose: boolean; onClose: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("abierto");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/checklists/${checklistId}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setStatus(data.checklist?.status ?? "abierto");
    setLoading(false);
  }, [checklistId]);

  useEffect(() => { load(); }, [load]);

  async function setItemStatus(id: string, s: string) {
    await fetch(`/api/checklists/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    load();
  }

  async function closeMonth() {
    const res = await fetch(`/api/checklists/${checklistId}`, { method: "POST" });
    if (res.ok) { toast.success("Mes cerrado"); load(); }
    else toast.error("No se pudo cerrar el mes");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Checklist · {clientName}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {it.title}
                    {it.isCritical && <Badge variant="destructive" className="text-[10px]">Critico</Badge>}
                  </p>
                </div>
                <select
                  value={it.status}
                  disabled={status === "cerrado"}
                  onChange={(e) => setItemStatus(it.id, e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {Object.entries(CHECKLIST_ITEM_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            ))}
            {canClose && status !== "cerrado" && (
              <Button className="w-full mt-2" onClick={closeMonth}>
                <Lock className="h-4 w-4" /> Cerrar mes
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
