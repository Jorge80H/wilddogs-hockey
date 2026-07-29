import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { materialSchema, MATERIAL_TYPES, DIFFICULTIES } from "@/lib/materialSchema";
import { QuizEditor } from "./QuizEditor";
import { Plus, Pencil, ListChecks } from "lucide-react";

const TYPE_LABELS: Record<string, string> = { video: "Video", document: "Documento", drill: "Ejercicio", tactic: "Táctica" };
const DIFF_LABELS: Record<string, string> = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };

export function LibraryManager() {
  const { toast } = useToast();
  const { data } = db.useQuery({ trainingMaterials: { questions: {} } });
  const materials = ((data?.trainingMaterials || []) as any[]).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [quizFor, setQuizFor] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", type: "video", contentUrl: "", description: "", duration: "", difficulty: "beginner" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const resetForm = () => { setForm({ title: "", type: "video", contentUrl: "", description: "", duration: "", difficulty: "beginner" }); setEditingId(null); };

  const save = async () => {
    const parsed = materialSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Revisa los datos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    const mid = editingId || txId();
    await db.transact([
      db.tx.trainingMaterials[mid].update({
        ...parsed.data,
        description: parsed.data.description || undefined,
        duration: parsed.data.duration || undefined,
        isPublic: true,
        createdAt: editingId ? undefined as any : Date.now(),
        updatedAt: Date.now(),
      }),
    ]);
    toast({ title: editingId ? "✅ Contenido actualizado" : "✅ Contenido creado" });
    resetForm();
  };

  const edit = (m: any) => {
    setEditingId(m.id);
    setForm({ title: m.title || "", type: m.type || "video", contentUrl: m.contentUrl || "", description: m.description || "", duration: m.duration || "", difficulty: m.difficulty || "beginner" });
  };

  if (quizFor) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setQuizFor(null)}>← Volver a la biblioteca</Button>
        <QuizEditor materialId={quizFor} onDone={() => setQuizFor(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{editingId ? "Editar contenido" : "Nuevo contenido"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Título</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div>
              <Label>Tipo</Label>
              <select className="w-full border rounded h-10 px-2" value={form.type} onChange={(e) => set("type", e.target.value)}>
                {MATERIAL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div><Label>URL (YouTube, Drive, etc.)</Label><Input value={form.contentUrl} onChange={(e) => set("contentUrl", e.target.value)} placeholder="https://..." /></div>
          <div><Label>Descripción</Label><Input value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Duración</Label><Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="15 min" /></div>
            <div>
              <Label>Dificultad</Label>
              <select className="w-full border rounded h-10 px-2" value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFF_LABELS[d]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}><Plus className="h-4 w-4 mr-1" /> {editingId ? "Guardar" : "Crear"}</Button>
            {editingId && <Button variant="outline" onClick={resetForm}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        {materials.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm">{m.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[m.type] || m.type}</Badge>
                    <Badge variant="secondary" className="text-xs">{(m.questions || []).length} preguntas</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => edit(m)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setQuizFor(m.id)}><ListChecks className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
