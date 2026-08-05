import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateFeedbackAverage } from "@/lib/feedback";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, ThumbsUp, Target } from "lucide-react";

export function FeedbackHistoryList({ playerProfileId }: { playerProfileId: string }) {
  const { data } = db.useQuery({
    playerProfiles: {
      $: { where: { id: playerProfileId } },
      feedback: {
        coach: { user: {} },
      },
    },
  });

  const player = (data?.playerProfiles?.[0] as any) || {};
  const feedbackList = ((player.feedback || []) as any[]).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Historial de Evaluaciones del Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbackList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No hay evaluaciones registradas en el historial.</p>
        ) : (
          feedbackList.map((item) => {
            const avg = calculateFeedbackAverage(item);
            const dateStr = item.createdAt ? format(new Date(item.createdAt), "d 'de' MMMM, yyyy", { locale: es }) : "Fecha desconocida";
            const coachName = item.coach?.user?.firstName ? `${item.coach.user.firstName} ${item.coach.user.lastName || ""}` : "Entrenador";

            return (
              <div key={item.id} className="p-4 border rounded-lg space-y-3 bg-card hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{item.type || "evaluación"}</Badge>
                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                    <span className="text-xs font-medium text-muted-foreground">· por {coachName}</span>
                  </div>
                  <Badge variant="secondary" className="font-bold">{avg} / 10</Badge>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs text-center border-y py-2">
                  <div><span className="text-muted-foreground block">Téc</span><span className="font-semibold">{item.technicalScore ?? "-"}</span></div>
                  <div><span className="text-muted-foreground block">Tác</span><span className="font-semibold">{item.tacticalScore ?? "-"}</span></div>
                  <div><span className="text-muted-foreground block">Fís</span><span className="font-semibold">{item.physicalScore ?? "-"}</span></div>
                  <div><span className="text-muted-foreground block">Act</span><span className="font-semibold">{item.attitudeScore ?? "-"}</span></div>
                </div>

                {item.comments && (
                  <p className="text-sm text-foreground/90 leading-relaxed">{item.comments}</p>
                )}

                {(item.strengths || item.areasToImprove) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                    {item.strengths && (
                      <div className="p-2 border rounded bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <span className="font-semibold flex items-center gap-1 mb-1"><ThumbsUp className="h-3 w-3" /> Fortalezas</span>
                        {item.strengths}
                      </div>
                    )}
                    {item.areasToImprove && (
                      <div className="p-2 border rounded bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300">
                        <span className="font-semibold flex items-center gap-1 mb-1"><Target className="h-3 w-3" /> Aspectos a mejorar</span>
                        {item.areasToImprove}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
