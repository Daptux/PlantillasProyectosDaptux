import { useQuery } from "@tanstack/react-query";
import { Download, FlaskConical, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resultsService } from "@/services/resultsService";

export default function PatientResultsPage() {
  const { data: resultados = [], isLoading } = useQuery({
    queryKey: ["results", "mine"],
    queryFn: () => resultsService.mine(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis resultados</h1>
        <p className="text-muted-foreground">Consulta y descarga tus resultados medicos.</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : resultados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center text-muted-foreground">
            <FlaskConical className="h-10 w-10 opacity-40" />
            Aun no tienes resultados disponibles.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {resultados.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.titulo}</div>
                  {r.descripcion && <p className="text-sm text-muted-foreground">{r.descripcion}</p>}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {r.fecha_resultado ?? r.created_at.slice(0, 10)}
                    {r.servicio_nombre ? ` · ${r.servicio_nombre}` : ""}
                  </div>
                  {r.url ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => resultsService.download(r.id, r.titulo)}
                    >
                      <Download className="h-4 w-4" /> Descargar
                    </Button>
                  ) : (
                    <p className="mt-3 text-xs italic text-muted-foreground">Sin archivo adjunto</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
