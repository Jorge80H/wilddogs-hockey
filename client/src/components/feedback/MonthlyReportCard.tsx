import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { groupFeedbackByMonth, computeMonthlySummary } from "@/lib/feedback";
import { Calendar, FileText } from "lucide-react";

export function MonthlyReportCard({ playerProfileId }: { playerProfileId: string }) {
  const { data } = db.useQuery({
    playerProfiles: {
      $: { where: { id: playerProfileId } },
      feedback: {},
    },
  });

  const player = (data?.playerProfiles?.[0] as any) || {};
  const feedbackList = (player.feedback || []) as any[];
  const grouped = groupFeedbackByMonth(feedbackList);
  const monthKeys = Object.keys(grouped).sort().reverse();

  const [selectedMonth, setSelectedMonth] = useState<string>(monthKeys[0] || "");

  if (monthKeys.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Informe Mensual de Evaluación</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-4">No hay evaluaciones suficientes para generar el informe mensual.</p></CardContent>
      </Card>
    );
  }

  const currentMonth = selectedMonth || monthKeys[0];
  const monthItems = grouped[currentMonth] || [];
  const summary = computeMonthlySummary(currentMonth, monthItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> Informe Mensual de Evaluación
        </CardTitle>
        <div className="w-40">
          <Select value={currentMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-8 text-xs">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {monthKeys.map((mk) => (
                <SelectItem key={mk} value={mk} className="text-xs">
                  {mk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <p className="text-xs text-muted-foreground">Evaluaciones en {currentMonth}</p>
            <p className="text-lg font-bold">{summary.count} registros</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Calificación promedio</p>
            <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
              {summary.overall} / 10
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 border rounded bg-muted/30">
            <span className="text-muted-foreground block">Técnica</span>
            <span className="font-bold text-sm">{summary.averages.technical}</span>
          </div>
          <div className="p-2 border rounded bg-muted/30">
            <span className="text-muted-foreground block">Táctica</span>
            <span className="font-bold text-sm">{summary.averages.tactical}</span>
          </div>
          <div className="p-2 border rounded bg-muted/30">
            <span className="text-muted-foreground block">Física</span>
            <span className="font-bold text-sm">{summary.averages.physical}</span>
          </div>
          <div className="p-2 border rounded bg-muted/30">
            <span className="text-muted-foreground block">Actitud</span>
            <span className="font-bold text-sm">{summary.averages.attitude}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
