import { describe, it, expect } from "vitest";
import {
  type PlayerStatus,
  canTransition,
  canViewContent,
  relationshipLabel,
  playerDisplayName,
  coachCanApprove,
} from "./players";

describe("canTransition", () => {
  it("pending → approved es válido", () => {
    expect(canTransition("pending", "approved")).toBe(true);
  });
  it("pending → rejected es válido", () => {
    expect(canTransition("pending", "rejected")).toBe(true);
  });
  it("rejected → pending es válido (familia corrige)", () => {
    expect(canTransition("rejected", "pending")).toBe(true);
  });
  it("approved → inactive es válido", () => {
    expect(canTransition("approved", "inactive")).toBe(true);
  });
  it("approved → pending NO es válido", () => {
    expect(canTransition("approved", "pending")).toBe(false);
  });
});

describe("canViewContent", () => {
  it("solo aprobado ve contenido", () => {
    expect(canViewContent("approved")).toBe(true);
    (["pending", "rejected", "inactive"] as PlayerStatus[]).forEach((s) =>
      expect(canViewContent(s)).toBe(false)
    );
  });
});

describe("relationshipLabel", () => {
  it("self se muestra como 'Tú'", () => {
    expect(relationshipLabel("self")).toBe("Tú");
  });
  it("hijo/hija se muestran capitalizados", () => {
    expect(relationshipLabel("hijo")).toBe("Hijo");
    expect(relationshipLabel("hija")).toBe("Hija");
  });
  it("desconocido cae a 'Jugador'", () => {
    expect(relationshipLabel("otro")).toBe("Otro");
    expect(relationshipLabel(undefined)).toBe("Jugador");
  });
});

describe("playerDisplayName", () => {
  it("usa firstName + lastName del perfil", () => {
    expect(playerDisplayName({ firstName: "Ana", lastName: "Ruiz" })).toBe("Ana Ruiz");
  });
  it("cae a 'Jugador sin nombre' si vacío", () => {
    expect(playerDisplayName({})).toBe("Jugador sin nombre");
  });
});

describe("coachCanApprove", () => {
  it("coach aprueba jugador de su categoría", () => {
    expect(coachCanApprove("sub12", "sub12")).toBe(true);
  });
  it("coach NO aprueba jugador de otra categoría", () => {
    expect(coachCanApprove("sub12", "sub14")).toBe(false);
  });
  it("sin categoría de coach, no aprueba", () => {
    expect(coachCanApprove(undefined, "sub12")).toBe(false);
  });
});
