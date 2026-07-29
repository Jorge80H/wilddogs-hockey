import { describe, it, expect } from "vitest";
import { titularSchema, playerProfileSchema, CATEGORIES } from "./playerSchema";

describe("titularSchema", () => {
  it("acepta un titular completo", () => {
    const r = titularSchema.safeParse({
      firstName: "Carlos", lastName: "Pérez",
      phone: "3001234567", documentType: "CC", documentNumber: "123",
      address: "Calle 1",
    });
    expect(r.success).toBe(true);
  });
  it("rechaza si falta nombre", () => {
    const r = titularSchema.safeParse({ firstName: "", lastName: "Pérez", phone: "3001234567" });
    expect(r.success).toBe(false);
  });
});

describe("playerProfileSchema", () => {
  const base = {
    firstName: "Ana", lastName: "Ruiz",
    relationshipToTitular: "hija" as const,
    category: "sub12" as const,
    dateOfBirth: "2014-05-01",
  };
  it("acepta un jugador válido", () => {
    expect(playerProfileSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza categoría inválida", () => {
    const r = playerProfileSchema.safeParse({ ...base, category: "sub99" });
    expect(r.success).toBe(false);
  });
  it("rechaza relación inválida", () => {
    const r = playerProfileSchema.safeParse({ ...base, relationshipToTitular: "primo" });
    expect(r.success).toBe(false);
  });
  it("CATEGORIES expone las 6 categorías del club", () => {
    expect(CATEGORIES).toEqual(["sub8", "sub12", "sub14", "sub16", "sub18", "mayores"]);
  });
});
