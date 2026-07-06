"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, ShieldCheck } from "lucide-react";
import { ClientFormDialog } from "./client-form-dialog";
import { DOCUMENT_STATUS, TASK_STATUS, REQUEST_STATUS, pick } from "@/lib/labels";
import { formatDate, MONTH_NAMES } from "@/lib/utils";

type Stats = {
  documents: number;
  pendingDocuments: number;
  pendingTasks: number;
  activeRequests: number;
  checklistProgress: number;
};

type Client = Record<string, unknown> & {
  id: string;
  name: string;
  businessName: string | null;
  documentType: string;
  documentNumber: string;
  personType: string;
  taxRegime: string | null;
  isVatResponsible: boolean;
  economicActivity: string | null;
  address: string | null;
  city: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  legalRepresentative: string | null;
};

type FirmUser = { id: string; name: string; role: string };
type Option = { id: string; name: string };

export function ClienteDetalle({
  client, stats, users, obligationsCatalog,
}: {
  client: Client; stats: Stats; users: FirmUser[]; obligationsCatalog: Option[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" /> Editar cliente
        </Button>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="obligaciones">Obligaciones</TabsTrigger>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <MiniStat label="Documentos" value={stats.documents} />
            <MiniStat label="Docs por revisar" value={stats.pendingDocuments} />
            <MiniStat label="Tareas pendientes" value={stats.pendingTasks} />
            <MiniStat label="Avance del mes" value={`${stats.checklistProgress}%`} />
          </div>
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-6 text-sm">
              <Info label="Razon social" value={client.businessName} />
              <Info label="Documento" value={`${client.documentType} ${client.documentNumber}`} />
              <Info label="Tipo de persona" value={client.personType === "juridica" ? "Juridica" : "Natural"} />
              <Info label="Regimen" value={client.taxRegime} />
              <Info label="Responsable de IVA" value={client.isVatResponsible ? "Si" : "No"} />
              <Info label="Actividad economica" value={client.economicActivity} />
              <Info label="Telefono" value={client.phone} />
              <Info label="Correo" value={client.email} />
              <Info label="Ciudad" value={client.city} />
              <Info label="Departamento" value={client.department} />
              <Info label="Direccion" value={client.address} />
              <Info label="Representante legal" value={client.legalRepresentative} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obligaciones">
          <ClientObligations clientId={client.id} catalog={obligationsCatalog} />
        </TabsContent>
        <TabsContent value="contactos">
          <ClientContacts clientId={client.id} />
        </TabsContent>
        <TabsContent value="documentos">
          <ClientDocuments clientId={client.id} />
        </TabsContent>
        <TabsContent value="tareas">
          <ClientTasks clientId={client.id} />
        </TabsContent>
        <TabsContent value="solicitudes">
          <ClientRequests clientId={client.id} />
        </TabsContent>
      </Tabs>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => window.location.reload()}
        onDeleted={() => router.push("/clientes")}
        users={users}
        initial={{ ...(client as Record<string, unknown>), id: client.id } as never}
      />
    </div>
  );
}

/* ---------- Obligaciones (perfil tributario) ---------- */

const PERIODICITIES = [
  "mensual", "bimestral", "trimestral", "cuatrimestral", "anual", "personalizada",
];

function ClientObligations({ clientId, catalog }: { clientId: string; catalog: Option[] }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [obligationId, setObligationId] = useState("");
  const [periodicity, setPeriodicity] = useState("mensual");
  const [dueDay, setDueDay] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/clientes/${clientId}/obligaciones`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, [clientId]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!obligationId) { toast.error("Selecciona una obligacion"); return; }
    const res = await fetch(`/api/clientes/${clientId}/obligaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ obligationId, periodicity, dueDay: dueDay || null }),
    });
    if (res.ok) {
      toast.success("Obligacion agregada. Definira los items del checklist mensual.");
      setObligationId(""); setDueDay("");
      load();
    } else toast.error("No se pudo agregar");
  }

  async function remove(id: string) {
    const res = await fetch(`/api/clientes/${clientId}/obligaciones/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Obligacion eliminada"); load(); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-primary" /> Agregar obligacion tributaria
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:col-span-2"
              value={obligationId}
              onChange={(e) => setObligationId(e.target.value)}
            >
              <option value="">Selecciona obligacion...</option>
              {catalog.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={periodicity}
              onChange={(e) => setPeriodicity(e.target.value)}
            >
              {PERIODICITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex gap-2">
              <Input type="number" min={1} max={31} placeholder="Dia" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
              <Button onClick={add}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? <Spinner /> : rows.length === 0 ? (
        <Empty text="Este cliente no tiene obligaciones configuradas" />
      ) : (
        <div className="rounded-xl border divide-y bg-card">
          {rows.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{o.name}</p>
                <p className="text-xs text-muted-foreground">
                  {o.periodicity}{o.dueDay ? ` · dia ${o.dueDay}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={o.active ? "success" : "muted"}>{o.active ? "Activa" : "Inactiva"}</Badge>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(o.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Contactos ---------- */

function ClientContacts({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "", isPrimary: false });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/clientes/${clientId}/contactos`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setLoading(false);
  }, [clientId]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    const res = await fetch(`/api/clientes/${clientId}/contactos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Contacto agregado");
      setForm({ name: "", role: "", email: "", phone: "", isPrimary: false });
      load();
    } else toast.error("No se pudo agregar");
  }

  async function remove(id: string) {
    const res = await fetch(`/api/clientes/${clientId}/contactos/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Contacto eliminado"); load(); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-medium mb-1">Agregar contacto</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Cargo" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <Input placeholder="Correo" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Telefono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} className="h-4 w-4 rounded border-input" />
              Contacto principal
            </label>
            <Button onClick={add}><Plus className="h-4 w-4" /> Agregar</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? <Spinner /> : rows.length === 0 ? (
        <Empty text="Sin contactos adicionales" />
      ) : (
        <div className="rounded-xl border divide-y bg-card">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium flex items-center gap-2">
                  {c.name}
                  {c.isPrimary && <Badge variant="secondary" className="text-[10px]">Principal</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[c.role, c.email, c.phone].filter(Boolean).join(" · ") || "-"}
                </p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Listados por cliente ---------- */

function useFetch<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(url);
    const json = await res.json();
    setData(json.rows ?? []);
    setLoading(false);
  }, [url]);
  useEffect(() => { load(); }, [load]);
  return { data, loading };
}

function ClientDocuments({ clientId }: { clientId: string }) {
  const { data, loading } = useFetch<any>(`/api/documentos?clientId=${clientId}`);
  if (loading) return <Spinner />;
  if (!data.length) return <Empty text="Sin documentos para este cliente" />;
  return (
    <div className="rounded-xl border divide-y bg-card">
      {data.map((d) => (
        <div key={d.id} className="flex items-center justify-between p-3 text-sm">
          <div>
            <p className="font-medium">{d.internalName ?? d.originalName}</p>
            <p className="text-xs text-muted-foreground">
              {d.typeName ?? "-"} · {d.month ? `${MONTH_NAMES[d.month - 1]} ${d.year}` : "-"}
            </p>
          </div>
          <Badge variant={pick(DOCUMENT_STATUS, d.status).variant}>{pick(DOCUMENT_STATUS, d.status).label}</Badge>
        </div>
      ))}
    </div>
  );
}

function ClientTasks({ clientId }: { clientId: string }) {
  const { data, loading } = useFetch<any>(`/api/tareas?clientId=${clientId}`);
  if (loading) return <Spinner />;
  if (!data.length) return <Empty text="Sin tareas para este cliente" />;
  return (
    <div className="rounded-xl border divide-y bg-card">
      {data.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-3 text-sm">
          <div>
            <p className="font-medium">{t.title}</p>
            <p className="text-xs text-muted-foreground">{formatDate(t.dueDate)} · {t.assignedName ?? "Sin asignar"}</p>
          </div>
          <Badge variant={pick(TASK_STATUS, t.status).variant}>{pick(TASK_STATUS, t.status).label}</Badge>
        </div>
      ))}
    </div>
  );
}

function ClientRequests({ clientId }: { clientId: string }) {
  const { data, loading } = useFetch<any>(`/api/solicitudes?clientId=${clientId}`);
  if (loading) return <Spinner />;
  if (!data.length) return <Empty text="Sin solicitudes para este cliente" />;
  return (
    <div className="rounded-xl border divide-y bg-card">
      {data.map((r) => (
        <div key={r.id} className="flex items-center justify-between p-3 text-sm">
          <div>
            <p className="font-medium">{r.title}</p>
            <p className="text-xs text-muted-foreground">{formatDate(r.dueDate)}</p>
          </div>
          <Badge variant={pick(REQUEST_STATUS, r.status).variant}>{pick(REQUEST_STATUS, r.status).label}</Badge>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
function Info({ label, value }: { label: string; value?: unknown }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{(value as string) || "-"}</p>
    </div>
  );
}
function Spinner() {
  return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;
}
function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground py-10 text-center">{text}</p>;
}
