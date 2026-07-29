import { describe, it, expect } from "vitest";
import {
  computeQuizScore,
  isPassing,
  xpForQuizPass,
  levelForXp,
  xpIntoLevel,
  evaluateNewBadges,
  BADGE_DEFINITIONS,
  PASS_THRESHOLD,
} from "./gamification";

const Q = [{ correctIndex: 0 }, { correctIndex: 2 }, { correctIndex: 1 }, { correctIndex: 3 }];

describe("computeQuizScore", () => {
  it("todas correctas => 100", () => {
    expect(computeQuizScore([0, 2, 1, 3], Q)).toBe(100);
  });
  it("ninguna correcta => 0", () => {
    expect(computeQuizScore([1, 1, 0, 0], Q)).toBe(0);
  });
  it("mitad correctas => 50", () => {
    expect(computeQuizScore([0, 2, 0, 0], Q)).toBe(50);
  });
  it("respuestas nulas cuentan como incorrectas", () => {
    expect(computeQuizScore([0, null, null, 3], Q)).toBe(50);
  });
  it("sin preguntas => 0 (no divide por cero)", () => {
    expect(computeQuizScore([], [])).toBe(0);
  });
});

describe("isPassing", () => {
  it("70 aprueba (umbral inclusivo)", () => {
    expect(isPassing(PASS_THRESHOLD)).toBe(true);
    expect(isPassing(69)).toBe(false);
    expect(isPassing(100)).toBe(true);
  });
});

describe("xpForQuizPass", () => {
  it("aprobado normal => 10 XP", () => {
    expect(xpForQuizPass(70)).toBe(10);
    expect(xpForQuizPass(99)).toBe(10);
  });
  it("100% => 15 XP (base + bono)", () => {
    expect(xpForQuizPass(100)).toBe(15);
  });
});

describe("levelForXp", () => {
  it("0-49 XP => nivel 1", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(49)).toBe(1);
  });
  it("50 XP => nivel 2", () => {
    expect(levelForXp(50)).toBe(2);
  });
  it("125 XP => nivel 3", () => {
    expect(levelForXp(125)).toBe(3);
  });
});

describe("xpIntoLevel", () => {
  it("XP acumulado dentro del nivel actual", () => {
    expect(xpIntoLevel(0)).toBe(0);
    expect(xpIntoLevel(60)).toBe(10);
    expect(xpIntoLevel(125)).toBe(25);
  });
});

describe("evaluateNewBadges", () => {
  const base = {
    completedCount: 1,
    justScored: 80,
    pathTotalSteps: 3,
    pathCompletedSteps: 1,
    alreadyEarned: [] as any[],
  };
  it("primer contenido completado => primer_paso", () => {
    expect(evaluateNewBadges(base)).toContain("primer_paso");
  });
  it("quiz perfecto => quiz_perfecto", () => {
    expect(evaluateNewBadges({ ...base, justScored: 100 })).toContain("quiz_perfecto");
  });
  it("completar toda la ruta => ruta_completa", () => {
    expect(
      evaluateNewBadges({ ...base, completedCount: 3, pathCompletedSteps: 3 })
    ).toContain("ruta_completa");
  });
  it("no re-otorga insignias ya ganadas", () => {
    expect(evaluateNewBadges({ ...base, alreadyEarned: ["primer_paso"] })).not.toContain(
      "primer_paso"
    );
  });
  it("no otorga ruta_completa si falta un paso", () => {
    expect(
      evaluateNewBadges({ ...base, completedCount: 2, pathCompletedSteps: 2, pathTotalSteps: 3 })
    ).not.toContain("ruta_completa");
  });
});

describe("BADGE_DEFINITIONS", () => {
  it("tiene las 3 insignias con label e icono", () => {
    (["primer_paso", "quiz_perfecto", "ruta_completa"] as const).forEach((k) => {
      expect(BADGE_DEFINITIONS[k].label.length).toBeGreaterThan(0);
      expect(BADGE_DEFINITIONS[k].icon.length).toBeGreaterThan(0);
    });
  });
});
