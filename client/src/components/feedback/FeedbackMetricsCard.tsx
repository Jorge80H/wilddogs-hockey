import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeDimensionAverages } from "@/lib/feedback";
import { Award, Zap, Shield, Heart } from "lucide-react";

export function FeedbackMetricsCard({ playerProfileId }: { playerProfileId: string }) {
  const { data } = db.useQuery({
    playerProfiles: {
      $: { where: { id: playerProfileId } },
      feedback: {},
    },
  });

  const player = (data?.playerProfiles?.[0] as any) || {};
  const feedbackList = (player.feedback || []) as any[];
  const averages = computeDimensionAverages(feedbackList);

  const dimensions = [
    { label: "Técnica", key: "technical", score: averages.technical, icon: Award, color: "text-blue-500", bg: "bg-blue-500" },
    { label: "Táctica", key: "tactical", score: averages.tactical, icon: Zap, color: "text-amber-500", bg: "bg-amber-500" },
    { label: "Física", key: "physical", score: averages.physical, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500" },
    { label: "Actitud", key: "attitude", score: averages.attitude, icon: Heart, color: "text-rose-500", bg: "bg-rose-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Promedio de Evaluación por Dimensión</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbackList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">Aún no hay evaluaciones registradas para este jugador.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              const pct = (dim.score / 10) * 100;
              return (
                <div key={dim.key} className="p-3 border rounded-lg space-y-2 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${dim.color}`} />
                      <span className="text-xs font-medium">{dim.label}</span>
                    </div>
                    <span className="text-sm font-bold">{dim.score} / 10</span>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div className={`h-full ${dim.bg}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
