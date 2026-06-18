import { useQuery } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { publicService } from "@/services/publicService";

/** Directorio medico publico (se muestra en la landing). */
export default function DoctorsDirectory() {
  const { data: medicos, isLoading } = useQuery({
    queryKey: ["public", "doctors"],
    queryFn: () => publicService.doctors(),
  });

  // Si no hay datos, no renderizamos la seccion.
  if (!isLoading && (!medicos || medicos.length === 0)) return null;

  return (
    <section id="medicos" className="bg-clinic-soft py-20">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Nuestro equipo medico</h2>
          <p className="mt-2 text-muted-foreground">Profesionales certificados para cuidar de ti.</p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medicos!.map((m) => (
              <Card key={m.id} className="transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                    {m.foto_url ? (
                      <img src={m.foto_url} alt={`${m.nombres} ${m.apellidos}`} className="h-full w-full object-cover" />
                    ) : (
                      <Stethoscope className="h-7 w-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">Dr(a). {m.nombres} {m.apellidos}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.especialidades.map((e) => (
                        <Badge key={e} variant="secondary">{e}</Badge>
                      ))}
                    </div>
                    {m.biografia && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{m.biografia}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
