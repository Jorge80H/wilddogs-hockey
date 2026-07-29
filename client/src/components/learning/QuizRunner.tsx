import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  computeQuizScore,
  isPassing,
  xpForQuizPass,
  evaluateNewBadges,
  type BadgeKey,
  BADGE_DEFINITIONS,
} from "@/lib/gamification";
import { CheckCircle2, XCircle } from "lucide-react";

export function QuizRunner({ player, material, onDone }: { player: any; material: any; onDone: () => void }) {
  const { toast } = useToast();
  const questions = ([...(material?.questions || [])] as any[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Progreso + estado del jugador para idempotencia y evaluación de insignias
  const { data } = db.useQuery({
    materialProgress: { $: { where: { "player.id": player.id } }, material: {} },
    playerProfiles: { $: { where: { id: player.id } }, badges: {} },
    pathSteps: { $: { where: { "category.id": player.category } }, material: {} },
  });

  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [result, setResult] = useState<{ score: number; passed: boolean; newBadges: BadgeKey[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pick = (qi: number, oi: number) => setAnswers((a) => a.map((x, j) => (j === qi ? oi : x)));

  const submit = async () => {
    // Guarda contra doble-submit: la snapshot de la query (existing/wasAlreadyCompleted)
    // solo se actualiza tras el round-trip de la transacción, así que un segundo click
    // antes de que resuelva vería el mismo estado "no completado" y duplicaría XP/insignias.
    if (isSubmitting) return;
    setIsSubmitting(true);

    const score = computeQuizScore(answers, questions);
    const passed = isPassing(score);

    const profile = (data?.playerProfiles?.[0] as any) || {};
    const allProgress = (data?.materialProgress || []) as any[];
    const existing = allProgress.find((p) => (p.material?.id) === material.id);
    const wasAlreadyCompleted = existing?.status === "completed";
    const bestPct = Math.max(existing?.comprehensionPct ?? 0, score);

    const progId = existing?.id || txId();
    const ops: any[] = [
      db.tx.materialProgress[progId].update({
        status: passed ? "completed" : "in_progress",
        comprehensionPct: bestPct,
        attempts: (existing?.attempts ?? 0) + 1,
        completedAt: passed ? (existing?.completedAt ?? Date.now()) : existing?.completedAt,
        updatedAt: Date.now(),
      }),
    ];
    if (!existing) {
      ops.push(db.tx.materialProgress[progId].link({ player: player.id, material: material.id }));
    }

    let newBadges: BadgeKey[] = [];

    // Gamificación SOLO en la primera transición a completed (idempotencia)
    if (passed && !wasAlreadyCompleted) {
      const xpGain = xpForQuizPass(score);
      // Tech debt aceptada: read-modify-write de XP en el cliente (sin operación atómica
      // de servidor en InstantDB). Aceptable para este flujo mono-usuario de quiz.
      ops.push(db.tx.playerProfiles[player.id].update({ xp: (profile.xp ?? 0) + xpGain }));

      // Estado para evaluar insignias (incluye este material recién completado)
      const completedMaterialIds = new Set(
        allProgress.filter((p) => p.status === "completed").map((p) => p.material?.id)
      );
      completedMaterialIds.add(material.id);
      const pathMaterialIds = new Set(((data?.pathSteps || []) as any[]).map((s) => s.material?.id).filter(Boolean));
      const pathCompleted = Array.from(completedMaterialIds).filter((id) => pathMaterialIds.has(id)).length;
      const alreadyEarned = ((profile.badges || []) as any[]).map((b) => b.badgeKey as BadgeKey);

      newBadges = evaluateNewBadges({
        completedCount: completedMaterialIds.size,
        justScored: score,
        pathTotalSteps: pathMaterialIds.size,
        pathCompletedSteps: pathCompleted,
        alreadyEarned,
      });

      newBadges.forEach((key) => {
        const bid = txId();
        ops.push(db.tx.playerBadges[bid].update({ badgeKey: key, earnedAt: Date.now() }));
        ops.push(db.tx.playerBadges[bid].link({ player: player.id }));
      });
    }

    try {
      await db.transact(ops);
      setResult({ score, passed, newBadges });
      if (passed) {
        toast({ title: `✅ Aprobado (${score}%)` });
      } else {
        toast({ title: `Puntaje: ${score}%`, description: "Necesitas 70% para aprobar. ¡Reintenta!", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">
          {result.passed ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-destructive" />}
          {result.passed ? "¡Aprobado!" : "Sigue intentando"}
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-bold">{result.score}%</p>
          {result.newBadges.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Nuevas insignias:</p>
              {result.newBadges.map((k) => (
                <p key={k} className="text-sm">{BADGE_DEFINITIONS[k].icon} {BADGE_DEFINITIONS[k].label}</p>
              ))}
            </div>
          )}
          <Button onClick={onDone} className="w-full">Continuar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Quiz: {material?.title}</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {questions.length === 0 && <p className="text-muted-foreground">Este contenido no tiene preguntas.</p>}
        {questions.map((q, qi) => (
          <div key={q.id} className="space-y-2">
            <p className="font-medium text-sm">{qi + 1}. {q.questionText}</p>
            <div className="space-y-1">
              {(q.options as string[]).map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => pick(qi, oi)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        {questions.length > 0 && (
          <Button onClick={submit} disabled={isSubmitting || answers.some((a) => a === null)} className="w-full">
            {isSubmitting ? "Enviando..." : "Enviar respuestas"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
