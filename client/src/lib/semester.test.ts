import { describe, it, expect } from "vitest";
import { semesterOf, sortSemestersDesc } from "./semester";

describe("semesterOf", () => {
  it("enero cae en S1", () => {
    expect(semesterOf(Date.UTC(2026, 0, 15))).toBe("2026-S1");
  });
  it("junio (último mes de S1) cae en S1", () => {
    expect(semesterOf(Date.UTC(2026, 5, 30))).toBe("2026-S1");
  });
  it("julio (primer mes de S2) cae en S2", () => {
    expect(semesterOf(Date.UTC(2026, 6, 1))).toBe("2026-S2");
  });
  it("diciembre cae en S2", () => {
    expect(semesterOf(Date.UTC(2026, 11, 31))).toBe("2026-S2");
  });
  it("respeta el año del timestamp, no el año actual", () => {
    expect(semesterOf(Date.UTC(2025, 0, 1))).toBe("2025-S1");
  });
});

describe("sortSemestersDesc", () => {
  it("ordena de más reciente a más antiguo", () => {
    expect(sortSemestersDesc(["2025-S2", "2026-S1", "2025-S1", "2026-S2"]))
      .toEqual(["2026-S2", "2026-S1", "2025-S2", "2025-S1"]);
  });
  it("elimina duplicados", () => {
    expect(sortSemestersDesc(["2026-S1", "2026-S1", "2025-S2"]))
      .toEqual(["2026-S1", "2025-S2"]);
  });
});
