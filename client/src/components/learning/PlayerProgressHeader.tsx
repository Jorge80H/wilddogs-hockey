import { db } from "@/lib/instant";
import { Card, CardContent } from "@/components/ui/card";
import { levelForXp, xpIntoLevel, xpForNextLevel, BADGE_DEFINITIONS, type BadgeKey } from "@/lib/gamification";

export function PlayerProgressHeader({ player }: { player: { id: string } }) {
  const { data } = db.useQuery({ playerProfiles: { $: { where: { id: player.id } }, badges: {} } });
  const profile = (data?.playerProfiles?.[0] as any) || {};
  const xp = profile.xp ?? 0;
  const level = levelForXp(xp);
  const into = xpIntoLevel(xp);
  const pct = Math.round((into / xpForNextLevel()) * 100);
  const badges = ((profile.badges || []) as any[]).map((b) => b.badgeKey as BadgeKey);

  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Nivel</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">XP total</p>
            <p className="text-xl font-bold">{xp}</p>
          </div>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{into}/{xpForNextLevel()} XP para el siguiente nivel</p>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {badges.map((k) => (
              <span key={k} title={BADGE_DEFINITIONS[k]?.description} className="text-sm border rounded-full px-2 py-0.5">
                {BADGE_DEFINITIONS[k]?.icon} {BADGE_DEFINITIONS[k]?.label}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
