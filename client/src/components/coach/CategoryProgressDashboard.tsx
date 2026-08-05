import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { levelForXp } from "@/lib/gamification";
import { pathProgressPct, type PathStepView, type ProgressView } from "@/lib/learningPath";
import { playerDisplayName } from "@/lib/players";

export function CategoryProgressDashboard({ category }: { category: string }) {
  const { data } = db.useQuery({
    pathSteps: { $: { where: { "category.id": category } }, material: {} },
    playerProfiles: { $: { where: { category, status: "approved" } }, progress: { material: {} }, badges: {} },
  });

  const steps: PathStepView[] = ((data?.pathSteps || []) as any[]).map((s) => ({
    id: s.id, order: s.order ?? 0, materialId: s.material?.id || "",
  }));
  const players = ((data?.playerProfiles || []) as any[])
    .map((p) => ({ ...p, xp: p.xp ?? 0 }))
    .sort((a, b) => b.xp - a.xp);

  return (
    <Card>
      <CardHeader><CardTitle>Progreso de {category} — ruta de {steps.length} pasos</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {players.length === 0 && <p className="text-sm text-muted-foreground">No hay jugadores aprobados en esta categoría.</p>}
        {players.map((p) => {
          const prog: ProgressView[] = ((p.progress || []) as any[]).map((x) => ({
            materialId: x.material?.id || "", status: x.status, comprehensionPct: x.comprehensionPct ?? 0,
          }));
          const pct = pathProgressPct(steps, prog);
          return (
            <div key={p.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <p className="font-medium text-sm">{playerDisplayName(p)}</p>
                <p className="text-xs text-muted-foreground">{(p.badges || []).length} insignias</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                <Badge variant="outline">{pct}%</Badge>
                <Badge variant="secondary">Nv {levelForXp(p.xp)}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
