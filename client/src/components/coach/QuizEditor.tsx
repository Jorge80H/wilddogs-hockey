import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { quizQuestionSchema } from "@/lib/materialSchema";
import { Trash2, Plus } from "lucide-react";

export function QuizEditor({ materialId, onDone }: { materialId: string; onDone?: () => void }) {
  const { toast } = useToast();
  const { data } = db.useQuery({
    trainingMaterials: { $: { where: { id: materialId } }, questions: {} },
  });
  const questions = ((data?.trainingMaterials?.[0] as any)?.questions || []) as any[];
  const sorted = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const addQuestion = async () => {
    const parsed = quizQuestionSchema.safeParse({ questionText, options, correctIndex });
    if (!parsed.success) {
      toast({ title: "Revisa la pregunta", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    const qid = txId();
    await db.transact([
      db.tx.quizQuestions[qid].update({
        questionText: parsed.data.questionText,
        options: parsed.data.options,
        correctIndex: parsed.data.correctIndex,
        order: sorted.length,
        createdAt: Date.now(),
      }),
      db.tx.quizQuestions[qid].link({ material: materialId }),
    ]);
    setQuestionText("");
    setOptions(["", ""]);
    setCorrectIndex(0);
    toast({ title: "✅ Pregunta agregada" });
  };

  const removeQuestion = async (qid: string) => {
    await db.transact([db.tx.quizQuestions[qid].delete()]);
    toast({ title: "Pregunta eliminada" });
  };

  const setOption = (i: number, v: string) => setOptions((o) => o.map((x, j) => (j === i ? v : x)));

  return (
    <Card>
      <CardHeader><CardTitle>Quiz del contenido ({sorted.length} preguntas)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((q) => (
          <div key={q.id} className="border rounded p-3 flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{q.questionText}</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {(q.options as string[]).map((opt, i) => (
                  <li key={i} className={i === q.correctIndex ? "text-green-600 font-semibold" : ""}>
                    {i === q.correctIndex ? "✔ " : "• "}{opt}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}

        <div className="border-t pt-4 space-y-3">
          <div><Label>Nueva pregunta</Label><Input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="¿...?" /></div>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
              <Input value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Opción ${i + 1}`} />
              {options.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => { setOptions((o) => o.filter((_, j) => j !== i)); if (correctIndex >= i && correctIndex > 0) setCorrectIndex((c) => c - 1); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <Button variant="outline" size="sm" onClick={() => setOptions((o) => [...o, ""])}><Plus className="h-4 w-4 mr-1" /> Opción</Button>
          )}
          <div className="flex gap-2">
            <Button onClick={addQuestion}><Plus className="h-4 w-4 mr-1" /> Agregar pregunta</Button>
            {onDone && <Button variant="outline" onClick={onDone}>Listo</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
