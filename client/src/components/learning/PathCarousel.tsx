import { usePlayerPath } from "@/hooks/usePlayerPath";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, PlayCircle } from "lucide-react";

export function PathCarousel({ player, onOpen }: { player: { id: string; category: string }; onOpen: (materialId: string) => void }) {
  const { steps, progressPct, isLoading } = usePlayerPath(player);

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Cargando ruta...</div>;
  if (steps.length === 0) return <div className="py-8 text-center text-muted-foreground">Tu entrenador aún no ha publicado la ruta de tu categoría.</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Tu ruta de formación</h3>
        <Badge variant="secondary">{progressPct}% completado</Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {steps.map((s, i) => {
          const locked = s.status === "locked";
          const completed = s.status === "completed";
          return (
            <button
              key={s.id}
              disabled={locked}
              onClick={() => onOpen(s.materialId)}
              className={`min-w-[180px] text-left ${locked ? "opacity-50 cursor-not-allowed" : "hover-elevate"}`}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Paso {i + 1}</Badge>
                    {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    {completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {s.status === "available" && <PlayCircle className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="font-medium text-sm line-clamp-2">{s.material?.title || "Contenido"}</p>
                  {completed && s.comprehensionPct != null && (
                    <p className="text-xs text-green-600 mt-1">Comprensión: {s.comprehensionPct}%</p>
                  )}
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
