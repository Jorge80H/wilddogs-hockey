import { describe, it, expect } from "vitest";
import { materialSchema, quizQuestionSchema } from "./materialSchema";

describe("materialSchema", () => {
  it("acepta un material válido", () => {
    const r = materialSchema.safeParse({
      title: "Pases cortos",
      type: "video",
      contentUrl: "https://youtu.be/abc",
      difficulty: "beginner",
    });
    expect(r.success).toBe(true);
  });
  it("rechaza título vacío", () => {
    const r = materialSchema.safeParse({ title: "", type: "video", contentUrl: "x", difficulty: "beginner" });
    expect(r.success).toBe(false);
  });
  it("rechaza tipo inválido", () => {
    const r = materialSchema.safeParse({ title: "T", type: "meme", contentUrl: "x", difficulty: "beginner" });
    expect(r.success).toBe(false);
  });
});

describe("quizQuestionSchema", () => {
  it("acepta pregunta con 3 opciones y correctIndex válido", () => {
    const r = quizQuestionSchema.safeParse({
      questionText: "¿Cuál es la posición correcta?",
      options: ["A", "B", "C"],
      correctIndex: 1,
    });
    expect(r.success).toBe(true);
  });
  it("rechaza menos de 2 opciones", () => {
    const r = quizQuestionSchema.safeParse({ questionText: "Q", options: ["A"], correctIndex: 0 });
    expect(r.success).toBe(false);
  });
  it("rechaza más de 4 opciones", () => {
    const r = quizQuestionSchema.safeParse({ questionText: "Q", options: ["A","B","C","D","E"], correctIndex: 0 });
    expect(r.success).toBe(false);
  });
  it("rechaza correctIndex fuera de rango", () => {
    const r = quizQuestionSchema.safeParse({ questionText: "Q", options: ["A", "B"], correctIndex: 5 });
    expect(r.success).toBe(false);
  });
});
