import { describe, it, expect } from "vitest";
import {
  calculateFeedbackAverage,
  computeDimensionAverages,
  groupFeedbackByMonth,
  computeMonthlySummary,
} from "./feedback";

describe("calculateFeedbackAverage", () => {
  it("calcula el promedio de las 4 dimensiones (1-10)", () => {
    const item = {
      technicalScore: 8,
      tacticalScore: 7,
      physicalScore: 9,
      attitudeScore: 10,
    };
    expect(calculateFeedbackAverage(item)).toBe(8.5);
  });

  it("calcula promedio omitiendo dimensiones ausentes", () => {
    const item = {
      technicalScore: 8,
      physicalScore: 10,
    };
    expect(calculateFeedbackAverage(item)).toBe(9);
  });

  it("retorna 0 si no hay ninguna puntuación", () => {
    expect(calculateFeedbackAverage({})).toBe(0);
  });
});

describe("computeDimensionAverages", () => {
  it("retorna promedios globales por área para múltiples evaluaciones", () => {
    const items = [
      { technicalScore: 8, tacticalScore: 6, physicalScore: 8, attitudeScore: 10 },
      { technicalScore: 10, tacticalScore: 8, physicalScore: 6, attitudeScore: 8 },
    ];
    const avg = computeDimensionAverages(items);
    expect(avg.technical).toBe(9);
    expect(avg.tactical).toBe(7);
    expect(avg.physical).toBe(7);
    expect(avg.attitude).toBe(9);
  });

  it("retorna ceros cuando la lista está vacía", () => {
    const avg = computeDimensionAverages([]);
    expect(avg.technical).toBe(0);
    expect(avg.tactical).toBe(0);
    expect(avg.physical).toBe(0);
    expect(avg.attitude).toBe(0);
  });
});

describe("groupFeedbackByMonth", () => {
  it("agrupa evaluaciones por mes YYYY-MM", () => {
    // 2026-08-01 vs 2026-07-15
    const dateAug = new Date("2026-08-01T12:00:00Z").getTime();
    const dateJul = new Date("2026-07-15T12:00:00Z").getTime();

    const items = [
      { id: "1", createdAt: dateAug },
      { id: "2", createdAt: dateJul },
      { id: "3", createdAt: dateAug },
    ];

    const grouped = groupFeedbackByMonth(items);
    expect(Object.keys(grouped)).toContain("2026-08");
    expect(Object.keys(grouped)).toContain("2026-07");
    expect(grouped["2026-08"].length).toBe(2);
    expect(grouped["2026-07"].length).toBe(1);
  });
});

describe("computeMonthlySummary", () => {
  it("consolida resumen mensual con promedios y total de evaluaciones", () => {
    const dateAug = new Date("2026-08-05T12:00:00Z").getTime();
    const items = [
      { createdAt: dateAug, technicalScore: 8, tacticalScore: 8, physicalScore: 8, attitudeScore: 8 },
      { createdAt: dateAug, technicalScore: 10, tacticalScore: 10, physicalScore: 10, attitudeScore: 10 },
    ];

    const summary = computeMonthlySummary("2026-08", items);
    expect(summary.month).toBe("2026-08");
    expect(summary.count).toBe(2);
    expect(summary.overall).toBe(9);
    expect(summary.averages.technical).toBe(9);
  });
});
