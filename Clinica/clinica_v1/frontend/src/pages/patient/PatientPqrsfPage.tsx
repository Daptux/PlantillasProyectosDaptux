import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PqrsfForm from "@/components/forms/PqrsfForm";
import { pqrsfService } from "@/services/pqrsfService";
import { TIPO_PQRSF_LABEL, ESTADO_PQRSF_LABEL, ESTADO_PQRSF_VARIANT } from "@/lib/pqrsf";

export default function PatientPqrsfPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["pqrsf", "mine"],
    queryFn: () => pqrsfService.mine(),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">PQRSF</h1>
        <p className="text-muted-foreground">Envia una solicitud y haz seguimiento a sus respuestas.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">Nueva solicitud</h2>
          <PqrsfForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Mis solicitudes</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : items.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Aun no has enviado solicitudes.</CardContent></Card>
        ) : (
          items.map((q) => (
            <Card key={q.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{TIPO_PQRSF_LABEL[q.tipo]}</Badge>
                    <span className="font-semibold">{q.asunto}</span>
                  </div>
                  <Badge variant={ESTADO_PQRSF_VARIANT[q.estado]}>{ESTADO_PQRSF_LABEL[q.estado]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{q.mensaje}</p>
                {q.respuesta && (
                  <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-3 text-sm">
                    <div className="font-medium text-primary">Respuesta</div>
                    {q.respuesta}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">{q.created_at.slice(0, 10)}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
