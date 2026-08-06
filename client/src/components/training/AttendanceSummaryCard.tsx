import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { summarizeAttendance } from "@/lib/training";
import { CalendarCheck, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";

export function AttendanceSummaryCard({ playerProfileId }: { playerProfileId: string }) {
  const { data } = db.useQuery({
    playerProfiles: {
      $: { where: { id: playerProfileId } },
      attendances: {},
    },
  });

  const player = (data?.playerProfiles?.[0] as any) || {};
  const attendances = (player.attendances || []) as any[];
  const summary = summarizeAttendance(attendances);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-emerald-500" /> Registro de Asistencia a Entrenamientos
        </CardTitle>
        <Badge variant={summary.rate >= 80 ? "default" : summary.rate >= 60 ? "outline" : "destructive"} className="text-xs font-bold">
          {summary.rate}% Asistencia
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${summary.rate}%` }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 border rounded bg-emerald-500/5 border-emerald-500/20">
            <span className="text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Presentes
            </span>
            <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{summary.present}</span>
          </div>

          <div className="p-2 border rounded bg-amber-500/5 border-amber-500/20">
            <span className="text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-amber-500" /> Tarde
            </span>
            <span className="font-bold text-sm text-amber-700 dark:text-amber-300">{summary.late}</span>
          </div>

          <div className="p-2 border rounded bg-blue-500/5 border-blue-500/20">
            <span className="text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="h-3 w-3 text-blue-500" /> Excusados
            </span>
            <span className="font-bold text-sm text-blue-700 dark:text-blue-300">{summary.excused}</span>
          </div>

          <div className="p-2 border rounded bg-rose-500/5 border-rose-500/20">
            <span className="text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-rose-500" /> Ausentes
            </span>
            <span className="font-bold text-sm text-rose-700 dark:text-rose-300">{summary.absent}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
