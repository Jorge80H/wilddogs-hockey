import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

export function PathBuilder({ category }: { category: string }) {
  const { toast } = useToast();
  const { data } = db.useQuery({
    pathSteps: { $: { where: { "category.id": category } }, material: {} },
    trainingMaterials: {},
  });
  const steps = ((data?.pathSteps || []) as any[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const materials = (data?.trainingMaterials || []) as any[];
  const inPath = new Set(steps.map((s) => s.material?.id).filter(Boolean));
  const available = materials.filter((m) => !inPath.has(m.id));

  const addStep = async (materialId: string) => {
    const sid = txId();
    await db.transact([
      db.tx.pathSteps[sid].update({ order: steps.length, createdAt: Date.now() }),
      db.tx.pathSteps[sid].link({ category, material: materialId }),
    ]);
    toast({ title: "✅ Agregado a la ruta" });
  };

  const removeStep = async (stepId: string) => {
    await db.transact([db.tx.pathSteps[stepId].delete()]);
    toast({ title: "Quitado de la ruta" });
  };

  const swap = async (i: number, j: number) => {
    if (j < 0 || j >= steps.length) return;
    const a = steps[i], b = steps[j];
    await db.transact([
      db.tx.pathSteps[a.id].update({ order: b.order }),
      db.tx.pathSteps[b.id].update({ order: a.order }),
    ]);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Ruta de {category} ({steps.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {steps.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay pasos. Agrega contenidos desde la derecha.</p>}
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 border rounded p-2">
              <Badge variant="outline">{i + 1}</Badge>
              <span className="flex-1 text-sm">{s.material?.title || "Contenido"}</span>
              <Button variant="ghost" size="icon" onClick={() => swap(i, i - 1)} disabled={i === 0}><ChevronUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => swap(i, i + 1)} disabled={i === steps.length - 1}><ChevronDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => removeStep(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contenidos disponibles</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {available.length === 0 && <p className="text-sm text-muted-foreground">Todos los contenidos ya están en la ruta.</p>}
          {available.map((m) => (
            <div key={m.id} className="flex items-center gap-2 border rounded p-2">
              <span className="flex-1 text-sm">{m.title}</span>
              <Button variant="outline" size="sm" onClick={() => addStep(m.id)}><Plus className="h-4 w-4 mr-1" /> Agregar</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
