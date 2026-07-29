import { db } from "@/lib/instant";
import {
  type PathStepView,
  type ProgressView,
  type StepStatus,
  sortSteps,
  unlockedStepIndex,
  stepStatus,
  pathProgressPct,
} from "@/lib/learningPath";

export interface EnrichedStep {
  id: string;
  order: number;
  materialId: string;
  material: any;
  status: StepStatus;
  comprehensionPct: number | null;
}

export function usePlayerPath(player: { id: string; category: string } | null) {
  const { data, isLoading } = db.useQuery(
    player
      ? {
          pathSteps: { $: { where: { "category.id": player.category } }, material: { questions: {} } },
          materialProgress: { $: { where: { "player.id": player.id } }, material: {} },
        }
      : null
  );

  const rawSteps = (data?.pathSteps || []) as any[];
  const rawProgress = (data?.materialProgress || []) as any[];

  const stepViews: PathStepView[] = rawSteps.map((s) => ({
    id: s.id,
    order: s.order ?? 0,
    materialId: s.material?.id || "",
  }));
  const progress: ProgressView[] = rawProgress.map((p) => ({
    materialId: p.material?.id || p.materialId || "",
    status: p.status,
    comprehensionPct: p.comprehensionPct ?? 0,
  }));

  const unlockedIdx = unlockedStepIndex(stepViews, progress);
  const progressPct = pathProgressPct(stepViews, progress);

  const sorted = sortSteps(stepViews);
  const byMaterial = new Map(rawProgress.map((p) => [p.material?.id || p.materialId, p]));
  const materialById = new Map(rawSteps.map((s) => [s.material?.id, s.material]));

  const steps: EnrichedStep[] = sorted.map((s, i) => {
    const prog = byMaterial.get(s.materialId);
    return {
      id: s.id,
      order: s.order,
      materialId: s.materialId,
      material: materialById.get(s.materialId),
      status: stepStatus(i, unlockedIdx),
      comprehensionPct: prog?.comprehensionPct ?? null,
    };
  });

  return { steps, progress, unlockedIdx, progressPct, isLoading: !!player && isLoading };
}
