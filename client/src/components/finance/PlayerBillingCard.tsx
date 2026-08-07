import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCOP, computeTotalBalance, computeAccountStatus } from "@/lib/finance";
import { CreditCard, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function PlayerBillingCard({ playerProfileId }: { playerProfileId: string }) {
  const { data } = db.useQuery({
    playerProfiles: {
      $: { where: { id: playerProfileId } },
      receivables: { concept: {} },
    },
  });

  const player = (data?.playerProfiles?.[0] as any) || {};
  const receivables = (player.receivables || []) as any[];
  const balance = computeTotalBalance(receivables);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-500" /> Estado de Cuenta y Cartera
        </CardTitle>
        <Badge variant={balance.totalDue === 0 ? "outline" : balance.totalOverdue > 0 ? "destructive" : "secondary"} className="text-xs font-bold">
          {balance.totalDue === 0 ? "Al día" : `Saldo Pendiente: ${formatCOP(balance.totalDue)}`}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3 border rounded bg-emerald-500/5 border-emerald-500/20">
            <span className="text-muted-foreground block text-[10px]">Total Pagado</span>
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCOP(balance.totalPaid)}</span>
          </div>

          <div className="p-3 border rounded bg-amber-500/5 border-amber-500/20">
            <span className="text-muted-foreground block text-[10px]">Por Vencer</span>
            <span className="font-bold text-sm text-amber-600 dark:text-amber-400">{formatCOP(balance.totalPending)}</span>
          </div>

          <div className="p-3 border rounded bg-rose-500/5 border-rose-500/20">
            <span className="text-muted-foreground block text-[10px]">Vencido</span>
            <span className="font-bold text-sm text-rose-600 dark:text-rose-400">{formatCOP(balance.totalOverdue)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conceptos de Cobro Generados</h4>
          {receivables.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay conceptos de cobro registrados para este jugador.</p>
          ) : (
            <div className="space-y-2">
              {receivables.map((item) => {
                const status = computeAccountStatus(item.status, item.dueDate);
                const isPaid = status === "paid";
                const isOverdue = status === "overdue";

                return (
                  <div key={item.id} className="p-3 border rounded-lg flex items-center justify-between bg-card text-xs">
                    <div>
                      <p className="font-semibold text-sm">{item.concept?.name || item.description || "Cobro"}</p>
                      <p className="text-muted-foreground text-[11px]">
                        Vence: {item.dueDate ? format(new Date(item.dueDate), "d 'de' MMMM, yyyy", { locale: es }) : "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{formatCOP(item.amount)}</span>
                      <Badge variant={isPaid ? "default" : isOverdue ? "destructive" : "outline"} className="capitalize flex items-center gap-1">
                        {isPaid && <CheckCircle2 className="h-3 w-3" />}
                        {isOverdue && <AlertCircle className="h-3 w-3" />}
                        {!isPaid && !isOverdue && <Clock className="h-3 w-3" />}
                        {isPaid ? "Pagado" : isOverdue ? "Vencido" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
