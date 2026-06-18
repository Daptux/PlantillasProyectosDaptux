import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { paymentsService } from "@/services/paymentsService";
import { ESTADO_PAGO_LABEL, ESTADO_PAGO_VARIANT, formatCOP } from "@/lib/payments";

export default function PatientPaymentsPage() {
  const qc = useQueryClient();
  const { data: pagos = [], isLoading } = useQuery({
    queryKey: ["payments", "mine"],
    queryFn: () => paymentsService.list(),
  });

  const payMut = useMutation({
    mutationFn: (id: number) => paymentsService.pay(id, "PSE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });

  const pendientes = pagos.filter((p) => p.estado === "PENDIENTE");
  const totalPendiente = pendientes.reduce((s, p) => s + Number(p.monto), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis pagos</h1>
        <p className="text-muted-foreground">Consulta tus facturas y paga en linea.</p>
      </div>

      {pendientes.length > 0 && (
        <Card className="bg-gradient-to-br from-primary to-secondary text-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm text-white/90">Saldo pendiente</div>
              <div className="text-2xl font-bold">{formatCOP(totalPendiente)}</div>
            </div>
            <CreditCard className="h-10 w-10 opacity-80" />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : pagos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">No tienes pagos registrados.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pagos.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <div className="font-semibold">{p.concepto ?? p.numero_factura ?? `Pago #${p.id}`}</div>
                  <div className="text-sm text-muted-foreground">
                    {p.numero_factura ? `Factura ${p.numero_factura} · ` : ""}
                    {formatCOP(p.monto)}
                    {p.fecha_pago ? ` · Pagado el ${p.fecha_pago.slice(0, 10)}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={ESTADO_PAGO_VARIANT[p.estado]}>{ESTADO_PAGO_LABEL[p.estado]}</Badge>
                  {p.estado === "PENDIENTE" ? (
                    <Button size="sm" onClick={() => payMut.mutate(p.id)} disabled={payMut.isPending}>
                      <CreditCard className="h-4 w-4" /> Pagar
                    </Button>
                  ) : p.estado === "PAGADO" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
