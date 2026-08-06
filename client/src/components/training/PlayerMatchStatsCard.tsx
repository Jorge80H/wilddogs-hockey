import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { summarizePlayerMatchStats } from "@/lib/training";
import { Activity, ShieldAlert, Target } from "lucide-react";

export function PlayerMatchStatsCard({ playerProfileId }: { playerProfileId: string }) {
  const { data } = db.useQuery({
    playerProfiles: {
      $: { where: { id: playerProfileId } },
      matchStats: {},
    },
  });

  const player = (data?.playerProfiles?.[0] as any) || {};
  const statsList = (player.matchStats || []) as any[];
  const summary = summarizePlayerMatchStats(statsList);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" /> Estadísticas en Partidos Oficiales
        </CardTitle>
        <Badge variant="outline" className="text-xs font-semibold">
          {summary.matchesPlayed} Partidos Jugados
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {summary.matchesPlayed === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aún no hay planillas de partido registradas para este jugador.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 border rounded bg-primary/5 border-primary/20">
              <span className="text-muted-foreground block text-[10px]">Puntos</span>
              <span className="font-bold text-base text-primary">{summary.totalPoints}</span>
            </div>

            <div className="p-2 border rounded bg-muted/40">
              <span className="text-muted-foreground block text-[10px]">Goles</span>
              <span className="font-bold text-sm">{summary.totalGoals}</span>
            </div>

            <div className="p-2 border rounded bg-muted/40">
              <span className="text-muted-foreground block text-[10px]">Asistencias</span>
              <span className="font-bold text-sm">{summary.totalAssists}</span>
            </div>

            <div className="p-2 border rounded bg-muted/40">
              <span className="text-muted-foreground block text-[10px] flex items-center justify-center gap-0.5">
                <Target className="h-2.5 w-2.5" /> Tiros
              </span>
              <span className="font-bold text-sm">{summary.totalShots}</span>
            </div>

            <div className="p-2 border rounded bg-muted/40">
              <span className="text-muted-foreground block text-[10px] flex items-center justify-center gap-0.5">
                <ShieldAlert className="h-2.5 w-2.5" /> PIM (Min)
              </span>
              <span className="font-bold text-sm">{summary.totalPenalties}</span>
            </div>

            <div className="p-2 border rounded bg-muted/40">
              <span className="text-muted-foreground block text-[10px]">Diferencial (+/-)</span>
              <span className={`font-bold text-sm ${summary.totalPlusMinus >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {summary.totalPlusMinus > 0 ? `+${summary.totalPlusMinus}` : summary.totalPlusMinus}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
