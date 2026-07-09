"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cfg = Record<string, any>;

export default function ConfiguracionPage() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/configuracion").then((r) => r.json()).then((j) => setCfg(j.data ?? {}));
  }, []);

  function set(k: string, v: unknown) { setCfg((c) => ({ ...c, [k]: v })); }

  async function guardar() {
    setSaving(true);
    try {
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || "Error"); return; }
      toast.success("Configuración guardada");
    } finally {
      setSaving(false);
    }
  }

  if (!cfg) {
    return (
      <div>
        <PageHeader title="Configuración" description="Personaliza tu barbería." />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Configuración" description="Personaliza marca, contacto y reglas de reserva.">
        <Button variant="brand" onClick={guardar} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
        </Button>
      </PageHeader>

      <Tabs defaultValue="marca">
        <TabsList>
          <TabsTrigger value="marca">Marca</TabsTrigger>
          <TabsTrigger value="contacto">Contacto</TabsTrigger>
          <TabsTrigger value="reservas">Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="marca">
          <Card>
            <CardHeader><CardTitle>Identidad de marca</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre comercial" value={cfg.nombre_comercial} onChange={(v) => set("nombre_comercial", v)} />
              <Campo label="Eslogan" value={cfg.eslogan} onChange={(v) => set("eslogan", v)} />
              <Campo label="Descripción" value={cfg.descripcion} onChange={(v) => set("descripcion", v)} textarea span2 />
              <Campo label="Logo (URL)" value={cfg.logo_url} onChange={(v) => set("logo_url", v)} />
              <Campo label="Imagen hero (URL)" value={cfg.hero_imagen_url} onChange={(v) => set("hero_imagen_url", v)} />
              <div>
                <Label className="mb-1.5 block">Color primario</Label>
                <div className="flex gap-2">
                  <input type="color" value={cfg.color_primario ?? "#c8963e"} onChange={(e) => set("color_primario", e.target.value)} className="h-9 w-14 rounded border" />
                  <Input value={cfg.color_primario ?? ""} onChange={(e) => set("color_primario", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Color acento</Label>
                <div className="flex gap-2">
                  <input type="color" value={cfg.color_acento ?? "#e0b862"} onChange={(e) => set("color_acento", e.target.value)} className="h-9 w-14 rounded border" />
                  <Input value={cfg.color_acento ?? ""} onChange={(e) => set("color_acento", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacto">
          <Card>
            <CardHeader><CardTitle>Datos de contacto y redes</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Campo label="Dirección" value={cfg.direccion} onChange={(v) => set("direccion", v)} />
              <Campo label="Ciudad" value={cfg.ciudad} onChange={(v) => set("ciudad", v)} />
              <Campo label="Teléfono" value={cfg.telefono} onChange={(v) => set("telefono", v)} />
              <Campo label="WhatsApp" value={cfg.whatsapp} onChange={(v) => set("whatsapp", v)} />
              <Campo label="Correo" value={cfg.correo} onChange={(v) => set("correo", v)} />
              <Campo label="Instagram" value={cfg.instagram} onChange={(v) => set("instagram", v)} />
              <Campo label="Facebook" value={cfg.facebook} onChange={(v) => set("facebook", v)} />
              <Campo label="TikTok" value={cfg.tiktok} onChange={(v) => set("tiktok", v)} />
              <Campo label="Google Maps (URL)" value={cfg.google_maps_url} onChange={(v) => set("google_maps_url", v)} span2 />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservas">
          <Card>
            <CardHeader><CardTitle>Reglas de reserva</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
                <div>
                  <Label>Confirmación automática</Label>
                  <p className="text-xs text-muted-foreground">Si está activo, las reservas quedan confirmadas al instante.</p>
                </div>
                <Switch checked={!!cfg.reserva_automatica} onCheckedChange={(v) => set("reserva_automatica", v)} />
              </div>
              <Campo label="Anticipación mínima (min)" value={cfg.anticipacion_minima_min} onChange={(v) => set("anticipacion_minima_min", Number(v))} type="number" />
              <Campo label="Cancelación (horas)" value={cfg.cancelacion_horas} onChange={(v) => set("cancelacion_horas", Number(v))} type="number" />
              <Campo label="Mensaje de confirmación" value={cfg.mensaje_confirmacion} onChange={(v) => set("mensaje_confirmacion", v)} textarea span2 />
              <Campo label="Mensaje para WhatsApp" value={cfg.mensaje_whatsapp} onChange={(v) => set("mensaje_whatsapp", v)} textarea span2 />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Campo({
  label, value, onChange, textarea, span2, type,
}: {
  label: string; value: unknown; onChange: (v: string) => void;
  textarea?: boolean; span2?: boolean; type?: string;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {textarea ? (
        <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input type={type ?? "text"} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
