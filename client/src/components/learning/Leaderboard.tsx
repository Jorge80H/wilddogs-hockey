import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { levelForXp } from "@/lib/gamification";
import { playerDisplayName } from "@/lib/players";
import { Trophy } from "lucide-react";

export function Leaderboard({ category, currentPlayerId }: { category: string; currentPlayerId: string }) {
  const { data } = db.useQuery({ playerProfiles: { $: { where: { category, status: "approved" } } } });
  const players = ((data?.playerProfiles || []) as any[])
    .map((p) => ({ ...p, xp: p.xp ?? 0 }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Ranking {category}</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {players.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay jugadores con progreso.</p>}
        {players.map((p, i) => (
          <div key={p.id} className={`flex items-center justify-between p-2 rounded ${p.id === currentPlayerId ? "bg-primary/10" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-muted-foreground">{i + 1}</span>
              <span className="text-sm">{playerDisplayName(p)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Nv {levelForXp(p.xp)}</Badge>
              <Badge variant="secondary">{p.xp} XP</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
