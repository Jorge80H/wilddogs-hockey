import { useState } from "react";
import { db } from "@/lib/instant";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tx, id as txId } from "@instantdb/react";
import { Star, Plus, Send, CheckCircle } from "lucide-react";
import { playerDisplayName } from "@/lib/players";

export function FeedbackManager({ coachCategory }: { coachCategory?: string }) {
  const { toast } = useToast();
  const { user: authUser } = db.useAuth();

  // Get players for this coach category
  const { data: playersData } = db.useQuery({
    playerProfiles: {
      $: coachCategory ? { where: { category: coachCategory, status: "approved" } } : { where: { status: "approved" } },
      user: {},
      feedback: {},
    },
    coaches: { user: {} },
  });

  const players = (playersData?.playerProfiles || []) as any[];
  const coach = ((playersData?.coaches || []) as any[]).find((c) => c.user?.[0]?.id === authUser?.id) || null;

  const [showForm, setShowForm] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [feedbackType, setFeedbackType] = useState("post-match");
  const [technicalScore, setTechnicalScore] = useState(5);
  const [tacticalScore, setTacticalScore] = useState(5);
  const [physicalScore, setPhysicalScore] = useState(5);
  const [attitudeScore, setAttitudeScore] = useState(5);
  const [comments, setComments] = useState("");
  const [strengths, setStrengths] = useState("");
  const [areasToImprove, setAreasToImprove] = useState("");

  const handleSubmit = async () => {
    if (!selectedPlayerId || !comments.trim()) {
      toast({
        title: "Error",
        description: "Selecciona un jugador y escribe un comentario de evaluación.",
        variant: "destructive",
      });
      return;
    }

    try {
      const feedbackId = txId();
      const ops: any[] = [
        tx.playerFeedback[feedbackId].update({
          type: feedbackType,
          technicalScore: Number(technicalScore),
          tacticalScore: Number(tacticalScore),
          physicalScore: Number(physicalScore),
          attitudeScore: Number(attitudeScore),
          comments: comments.trim(),
          strengths: strengths.trim() || undefined,
          areasToImprove: areasToImprove.trim() || undefined,
          createdAt: Date.now(),
        }),
        tx.playerFeedback[feedbackId].link({ player: selectedPlayerId }),
      ];

      if (coach?.id) {
        ops.push(tx.playerFeedback[feedbackId].link({ coach: coach.id }));
      }

      await db.transact(ops);

      toast({ title: "✅ Evaluación enviada con éxito" });
      setShowForm(false);
      setSelectedPlayerId("");
      setComments("");
      setStrengths("");
      setAreasToImprove("");
    } catch (err: any) {
      toast({
        title: "Error al guardar",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" /> Gestor de Evaluación y Feedback {coachCategory ? `(${coachCategory})` : ""}
        </CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> {showForm ? "Cancelar" : "Nueva Evaluación"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {showForm && (
          <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
              <Send className="h-4 w-4 text-primary" /> Registrar Evaluación Continuada
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Seleccionar Jugador</Label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Elige un jugador..." />
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
                <Label className="text-xs">Tipo de Evaluación</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post-match">Post-Partido</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-background p-3 rounded border">
              <div>
                <Label className="text-xs">Técnica (1-10)</Label>
                <Input type="number" min={1} max={10} value={technicalScore} onChange={(e) => setTechnicalScore(Number(e.target.value))} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Táctica (1-10)</Label>
                <Input type="number" min={1} max={10} value={tacticalScore} onChange={(e) => setTacticalScore(Number(e.target.value))} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Física (1-10)</Label>
                <Input type="number" min={1} max={10} value={physicalScore} onChange={(e) => setPhysicalScore(Number(e.target.value))} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Actitud (1-10)</Label>
                <Input type="number" min={1} max={10} value={attitudeScore} onChange={(e) => setAttitudeScore(Number(e.target.value))} className="h-8 text-xs" />
              </div>
            </div>

            <div>
              <Label className="text-xs">Observaciones y Comentarios generales *</Label>
              <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Comentarios del entrenador sobre el rendimiento..." className="text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Fortalezas</Label>
                <Input value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Ej: Control de puck, velocidad..." className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Aspectos a mejorar</Label>
                <Input value={areasToImprove} onChange={(e) => setAreasToImprove(e.target.value)} placeholder="Ej: Cobertura defensiva..." className="h-8 text-xs" />
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" /> Enviar Evaluación al Jugador
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Jugadores Evaluados</h4>
          {players.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay jugadores aprobados en esta categoría.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.map((p) => {
                const count = (p.feedback || []).length;
                return (
                  <div key={p.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{playerDisplayName(p)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.category} · #{p.jerseyNumber || "N/A"}</p>
                    </div>
                    <span className="text-xs font-medium border px-2 py-1 rounded bg-muted">
                      {count} {count === 1 ? "evaluación" : "evaluaciones"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
