import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { landingService } from "@/services/landingService";
import { getApiError } from "@/lib/apiError";
import type { LandingSeccion } from "@/types";

type Dict = Record<string, string>;

export default function LandingEditorPage() {
  const qc = useQueryClient();
  const [hero, setHero] = useState<Dict>({ titulo: "", subtitulo: "", cta: "", imagen: "" });
  const [contacto, setContacto] = useState<Dict>({ telefono: "", whatsapp: "", email: "", direccion: "" });
  const [error, setError] = useState("");

  const { data: secciones, isLoading } = useQuery({
    queryKey: ["landing", "edit"],
    queryFn: () => landingService.get(),
  });

  // Carga los valores actuales en el formulario.
  useEffect(() => {
    if (!secciones) return;
    const find = (s: string) => (secciones.find((x) => x.seccion === s)?.contenido ?? {}) as Dict;
    setHero({ titulo: "", subtitulo: "", cta: "", imagen: "", ...find("hero") });
    setContacto({ telefono: "", whatsapp: "", email: "", direccion: "", ...find("contacto") });
  }, [secciones]);

  const saveMut = useMutation({
    mutationFn: () => {
      const payload: LandingSeccion[] = [
        { seccion: "hero", orden: 1, contenido: hero },
        { seccion: "contacto", orden: 2, contenido: contacto },
      ];
      return landingService.update(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["landing"] }),
    onError: (e) => setError(getApiError(e)),
  });

  const field = (obj: Dict, setObj: (d: Dict) => void, key: string, label: string, area = false) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {area ? (
        <Textarea value={obj[key] ?? ""} onChange={(e) => setObj({ ...obj, [key]: e.target.value })} />
      ) : (
        <Input value={obj[key] ?? ""} onChange={(e) => setObj({ ...obj, [key]: e.target.value })} />
      )}
    </div>
  );

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editor de la landing</h1>
        <p className="text-muted-foreground">Edita el contenido publico de tu pagina de inicio.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">Hero (encabezado)</h2>
          {field(hero, setHero, "titulo", "Titulo")}
          {field(hero, setHero, "subtitulo", "Subtitulo", true)}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field(hero, setHero, "cta", "Texto del boton")}
            {field(hero, setHero, "imagen", "URL imagen")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">Contacto</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field(contacto, setContacto, "telefono", "Telefono")}
            {field(contacto, setContacto, "whatsapp", "WhatsApp")}
            {field(contacto, setContacto, "email", "Email")}
            {field(contacto, setContacto, "direccion", "Direccion")}
          </div>
        </CardContent>
      </Card>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={() => { setError(""); saveMut.mutate(); }} disabled={saveMut.isPending}>
          <Save className="h-4 w-4" /> {saveMut.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
        {saveMut.isSuccess && !saveMut.isPending && (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Guardado
          </span>
        )}
      </div>
    </div>
  );
}
