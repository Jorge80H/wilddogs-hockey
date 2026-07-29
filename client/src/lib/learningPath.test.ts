import { describe, it, expect } from "vitest";
import {
  type PathStepView,
  type ProgressView,
  sortSteps,
  unlockedStepIndex,
  stepStatus,
  pathProgressPct,
} from "./learningPath";

const steps: PathStepView[] = [
  { id: "s1", order: 0, materialId: "m1" },
  { id: "s2", order: 1, materialId: "m2" },
  { id: "s3", order: 2, materialId: "m3" },
];
const done = (materialId: string): ProgressView => ({
  materialId,
  status: "completed",
  comprehensionPct: 80,
});

describe("sortSteps", () => {
  it("ordena por order ascendente", () => {
    const shuffled = [steps[2], steps[0], steps[1]];
    expect(sortSteps(shuffled).map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
  });
});

describe("unlockedStepIndex", () => {
  it("sin progreso, el desbloqueado es el 0", () => {
    expect(unlockedStepIndex(steps, [])).toBe(0);
  });
  it("con paso 1 completado, el desbloqueado es el 1", () => {
    expect(unlockedStepIndex(steps, [done("m1")])).toBe(1);
  });
  it("todos completados => length (ninguno disponible)", () => {
    expect(unlockedStepIndex(steps, [done("m1"), done("m2"), done("m3")])).toBe(3);
  });
  it("in_progress no cuenta como completado", () => {
    expect(
      unlockedStepIndex(steps, [{ materialId: "m1", status: "in_progress", comprehensionPct: 40 }])
    ).toBe(0);
  });
});

describe("stepStatus", () => {
  it("antes del desbloqueado => completed", () => {
    expect(stepStatus(0, 2)).toBe("completed");
  });
  it("en el desbloqueado => available", () => {
    expect(stepStatus(2, 2)).toBe("available");
  });
  it("después del desbloqueado => locked", () => {
    expect(stepStatus(2, 1)).toBe("locked");
  });
});

describe("pathProgressPct", () => {
  it("0 de 3 => 0", () => {
    expect(pathProgressPct(steps, [])).toBe(0);
  });
  it("2 de 3 => 67 (redondeado)", () => {
    expect(pathProgressPct(steps, [done("m1"), done("m2")])).toBe(67);
  });
  it("ruta vacía => 0 (no divide por cero)", () => {
    expect(pathProgressPct([], [])).toBe(0);
  });
});
