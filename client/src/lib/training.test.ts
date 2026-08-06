import { describe, it, expect } from "vitest";
import {
  computeAttendanceRate,
  summarizeAttendance,
  summarizePlayerMatchStats,
} from "./training";

describe("computeAttendanceRate", () => {
  it("calcula el porcentaje de asistencia (presentes + tardíos / total)", () => {
    const items = [
      { status: "present" },
      { status: "present" },
      { status: "late" },
      { status: "absent" },
    ];
    // 3 de 4 = 75%
    expect(computeAttendanceRate(items)).toBe(75);
  });

  it("retorna 0 si no hay sesiones registradas", () => {
    expect(computeAttendanceRate([])).toBe(0);
  });
});

describe("summarizeAttendance", () => {
  it("retorna el desglose de asistencia por categoría de estado", () => {
    const items = [
      { status: "present" },
      { status: "present" },
      { status: "late" },
      { status: "absent" },
      { status: "excused" },
    ];

    const summary = summarizeAttendance(items);
    expect(summary.total).toBe(5);
    expect(summary.present).toBe(2);
    expect(summary.late).toBe(1);
    expect(summary.absent).toBe(1);
    expect(summary.excused).toBe(1);
    expect(summary.rate).toBe(60); // 3 de 5 = 60%
  });
});

describe("summarizePlayerMatchStats", () => {
  it("suma los totales acumulados de partidos del jugador", () => {
    const statsList = [
      { goals: 2, assists: 1, penalties: 2, shots: 5, plusMinus: 3 },
      { goals: 1, assists: 2, penalties: 0, shots: 4, plusMinus: 1 },
    ];

    const summary = summarizePlayerMatchStats(statsList);
    expect(summary.matchesPlayed).toBe(2);
    expect(summary.totalGoals).toBe(3);
    expect(summary.totalAssists).toBe(3);
    expect(summary.totalPoints).toBe(6);
    expect(summary.totalPenalties).toBe(2);
    expect(summary.totalShots).toBe(9);
    expect(summary.totalPlusMinus).toBe(4);
  });

  it("retorna ceros si no hay estadísticas de partidos", () => {
    const summary = summarizePlayerMatchStats([]);
    expect(summary.matchesPlayed).toBe(0);
    expect(summary.totalGoals).toBe(0);
    expect(summary.totalPoints).toBe(0);
  });
});
