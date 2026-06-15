import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { playerDisplayName, relationshipLabel } from "@/lib/players";

export function PlayerSwitcher({ players, onSelect, onAdd }: {
  players: any[]; onSelect: (id: string) => void; onAdd: () => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {players.map((p) => (
        <Card key={p.id} className="cursor-pointer hover-elevate" onClick={() => onSelect(p.id)}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mx-auto mb-3 flex items-center justify-center">
              {(p.firstName?.[0] || "?").toUpperCase()}
            </div>
            <div className="font-semibold">{playerDisplayName(p)}</div>
            <div className="text-xs text-muted-foreground capitalize">{p.category}</div>
            <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"} className="mt-2">
              {p.status === "approved" ? "Activo" : p.status === "rejected" ? "Rechazado" : "En revisión"}
            </Badge>
            <div className="text-[11px] text-muted-foreground mt-1">{relationshipLabel(p.relationshipToTitular)}</div>
          </CardContent>
        </Card>
      ))}
      <Card className="cursor-pointer border-dashed hover-elevate" onClick={onAdd}>
        <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full min-h-[160px]">
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <div className="text-sm font-medium">Agregar jugador</div>
        </CardContent>
      </Card>
    </div>
  );
}
