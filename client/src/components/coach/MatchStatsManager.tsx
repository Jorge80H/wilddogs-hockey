import { useState } from "react";
import { db } from "@/lib/instant";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tx, id as txId } from "@instantdb/react";
import { Activity, Plus, CheckCircle } from "lucide-react";
import { playerDisplayName } from "@/lib/players";

export function MatchStatsManager({ coachCategory }: { coachCategory?: string }) {
  const { toast } = useToast();

  const { data } = db.useQuery({
    playerProfiles: {
      $: coachCategory ? { where: { category: coachCategory, status: "approved" } } : { where: { status: "approved" } },
      matchStats: {},
    },
    matches: {},
  });

  const players = (data?.playerProfiles || []) as any[];
  const matches = (data?.matches || []) as any[];

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [shots, setShots] = useState(0);
  const [plusMinus, setPlusMinus] = useState(0);

  const handleSaveStats = async () => {
    if (!selectedPlayerId) {
      toast({ title: "Error", description: "Selecciona un jugador", variant: "destructive" });
      return;
    }

    try {
      const statId = txId();
      const ops: any[] = [
        tx.playerMatchStats[statId].update({
          goals: Number(goals),
          assists: Number(assists),
          penalties: Number(penalties),
          shots: Number(shots),
          plusMinus: Number(plusMinus),
          createdAt: Date.now(),
        }),
        tx.playerMatchStats[statId].link({ player: selectedPlayerId }),
      ];

      if (selectedMatchId) {
        ops.push(tx.playerMatchStats[statId].link({ match: selectedMatchId }));
      }

      await db.transact(ops);

      toast({ title: "✅ Planilla de partido registrada correctamente" });
      setGoals(0);
      setAssists(0);
      setPenalties(0);
      setShots(0);
      setPlusMinus(0);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-blue-500" /> Planilla de Estadísticas de Partido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Seleccionar Jugador *</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Elige jugador..." />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {playerDisplayName(p)} ({p.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Partido (Opcional)</Label>
              <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Elige partido de torneo..." />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      vs {m.opponent} ({m.result || "Pendiente"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-background p-3 rounded border text-center">
            <div>
              <Label className="text-xs block text-muted-foreground">Goles</Label>
              <Input type="number" min={0} value={goals} onChange={(e) => setGoals(Number(e.target.value))} className="h-8 text-center text-xs font-bold" />
            </div>

            <div>
              <Label className="text-xs block text-muted-foreground">Asistencias</Label>
              <Input type="number" min={0} value={assists} onChange={(e) => setAssists(Number(e.target.value))} className="h-8 text-center text-xs font-bold" />
            </div>

            <div>
              <Label className="text-xs block text-muted-foreground">Tiros</Label>
              <Input type="number" min={0} value={shots} onChange={(e) => setShots(Number(e.target.value))} className="h-8 text-center text-xs font-bold" />
            </div>

            <div>
              <Label className="text-xs block text-muted-foreground">Min. Penal (PIM)</Label>
              <Input type="number" min={0} value={penalties} onChange={(e) => setPenalties(Number(e.target.value))} className="h-8 text-center text-xs font-bold" />
            </div>

            <div>
              <Label className="text-xs block text-muted-foreground">Diferencial (+/-)</Label>
              <Input type="number" value={plusMinus} onChange={(e) => setPlusMinus(Number(e.target.value))} className="h-8 text-center text-xs font-bold" />
            </div>
          </div>

          <Button onClick={handleSaveStats} className="w-full">
            <CheckCircle className="mr-2 h-4 w-4" /> Registrar Estadísticas del Partido
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
