import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCOP } from "@/lib/finance";
import { Receipt, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function PaymentHistoryList({ playerProfileId }: { playerProfileId: string }) {
  const { data } = db.useQuery({
    playerProfiles: {
      $: { where: { id: playerProfileId } },
      paymentRecords: {},
    },
  });

  const player = (data?.playerProfiles?.[0] as any) || {};
  const payments = ((player.paymentRecords || []) as any[]).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4 text-emerald-500" /> Historial de Comprobantes de Pago
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aún no hay comprobantes de pago registrados en el sistema.</p>
        ) : (
          payments.map((p) => {
            const dateStr = p.paymentDate
              ? format(new Date(p.paymentDate), "d 'de' MMMM, yyyy", { locale: es })
              : "Fecha desconocida";

            return (
              <div key={p.id} className="p-3 border rounded-lg flex items-center justify-between bg-card text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{p.receiptNumber}</span>
                    <Badge variant="outline" className="capitalize text-[10px]">{p.paymentMethod || "transferencia"}</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Pagado el {dateStr} {p.referenceNumber ? `· Ref: ${p.referenceNumber}` : ""}
                  </p>
                  {p.notes && <p className="text-[11px] text-muted-foreground italic">{p.notes}</p>}
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 block">{formatCOP(p.amount)}</span>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    <CheckCircle className="mr-1 h-3 w-3 text-emerald-500" /> Aprobado
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
