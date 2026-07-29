export type StepStatus = "locked" | "available" | "completed";

export interface PathStepView {
  id: string;
  order: number;
  materialId: string;
}

export interface ProgressView {
  materialId: string;
  status: "in_progress" | "completed";
  comprehensionPct: number;
}

export function sortSteps(steps: PathStepView[]): PathStepView[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

function completedMaterialIds(progress: ProgressView[]): Set<string> {
  return new Set(progress.filter((p) => p.status === "completed").map((p) => p.materialId));
}

/**
 * Índice (0-based) del primer paso NO completado en orden = el paso disponible.
 * Si todos están completados, devuelve steps.length.
 */
export function unlockedStepIndex(steps: PathStepView[], progress: ProgressView[]): number {
  const sorted = sortSteps(steps);
  const completed = completedMaterialIds(progress);
  for (let i = 0; i < sorted.length; i++) {
    if (!completed.has(sorted[i].materialId)) return i;
  }
  return sorted.length;
}

export function stepStatus(index: number, unlockedIdx: number): StepStatus {
  if (index < unlockedIdx) return "completed";
  if (index === unlockedIdx) return "available";
  return "locked";
}

/** Porcentaje de la ruta completado (entero). 0 si no hay pasos. */
export function pathProgressPct(steps: PathStepView[], progress: ProgressView[]): number {
  if (steps.length === 0) return 0;
  const completed = completedMaterialIds(progress);
  const count = steps.filter((s) => completed.has(s.materialId)).length;
  return Math.round((count / steps.length) * 100);
}
