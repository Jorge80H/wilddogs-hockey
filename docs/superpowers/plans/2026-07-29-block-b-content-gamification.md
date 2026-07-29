# Bloque B — Biblioteca + Ruta + Gamificación — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el coach arme una biblioteca de contenidos y una "ruta" ordenada por categoría, y que el jugador (bajo el perfil del hijo) la recorra resolviendo quizzes, ganando XP, insignias y puesto en el ranking.

**Architecture:** Lógica pura y testeable en `client/src/lib/` (gamificación + reglas de ruta), hooks de InstantDB que arman las vistas, y componentes React por rol (jugador / coach). El estado de gamificación se materializa: `xp` en `playerProfiles` + insignias ganadas en `playerBadges`; nivel y ranking se derivan/consultan. La transacción de gamificación solo dispara en la primera transición de un contenido a `completed`.

**Tech Stack:** React 18 + Vite + InstantDB (`@instantdb/react`) + Wouter + Tailwind + Shadcn + TypeScript strict. Tests con vitest (solo lógica pura). Spec: `docs/superpowers/specs/2026-07-29-content-library-gamification-design.md`.

## Global Constraints

- **Fuente de verdad del modelo:** `instant.schema.ts` + `instant.perms.ts` (el `CLAUDE.md` describe Drizzle/Postgres pero está desactualizado; el stack real es InstantDB).
- **Aprobación del quiz:** `PASS_THRESHOLD = 70` (score ≥ 70 aprueba).
- **XP:** `XP_BASE = 10` por aprobar + `XP_PERFECT_BONUS = 5` si score === 100. (100% ⇒ 15 XP.)
- **Nivel:** `XP_PER_LEVEL = 50`. Nivel = `Math.floor(xp / 50) + 1` (1-based).
- **Insignias (keys exactas):** `"primer_paso"`, `"quiz_perfecto"`, `"ruta_completa"`. Definiciones en código, no en DB.
- **Desbloqueo:** secuencial estricto — el paso N+1 se abre solo al aprobar el N.
- **Idempotencia:** la gamificación (XP + insignias) solo dispara en la **primera** vez que un contenido pasa a `completed`; reintentos nunca duplican.
- **Permisos sin rol en CEL** (como Bloque A: link a `$users` no funciona): escritura = `auth.id != ''`; el rol coach/admin se refuerza en la UI. Datos del jugador usan bind de "familia": `auth.id in data.ref('player.titular.id')`.
- **InstantDB tx:** IDs nuevos con `id as txId` de `@instantdb/react`; escritura con `db.tx.entity[id].update({...})` + `.link({ rel: otherId })`; ejecutar con `db.transact([...ops])`.
- **Baseline typecheck:** `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"` debe salir vacío (errores en esos archivos son preexistentes y se ignoran).
- **Tests:** `npm test` (vitest run). Todos deben pasar.
- **Idioma UI:** español (labels, toasts).

---

### Task 1: Schema + permisos (fundación)

Agrega las entidades, el campo `xp` y los permisos. Sin tests unitarios (es configuración); el deliverable es que el archivo tipa y el `npm test` sigue verde. El push real a InstantDB es manual (ver paso final) — igual que en el Bloque A el CLI es interactivo (TUI) y requiere que el usuario confirme.

**Files:**
- Modify: `instant.schema.ts`
- Modify: `instant.perms.ts`

**Interfaces:**
- Produces (entidades y campos que las tareas siguientes consumen):
  - `quizQuestions`: `{ questionText: string, options: json, correctIndex: number, order: number, createdAt: number }`; link reverso desde `trainingMaterials` label `questions`.
  - `pathSteps`: `{ order: number, createdAt: number }`; links `stepCategory` (→ `categories`, reverso label `pathSteps`) y `stepMaterial` (→ `trainingMaterials`, reverso label `pathSteps`).
  - `materialProgress`: `{ status: string, comprehensionPct: number, attempts: number, completedAt?: number, updatedAt: number }`; links `progressPlayer` (→ `playerProfiles`, reverso label `progress`) y `progressMaterial` (→ `trainingMaterials`, reverso label `progress`).
  - `playerBadges`: `{ badgeKey: string, earnedAt: number }`; link `badgePlayer` (→ `playerProfiles`, reverso label `badges`).
  - `playerProfiles.xp: number`.

- [ ] **Step 1: Agregar `xp` a `playerProfiles`**

En `instant.schema.ts`, dentro de `playerProfiles: i.entity({ ... })`, junto a los stats (`gamesPlayed`, `goals`, `assists`), agrega:

```ts
      // Gamificación (Bloque B)
      xp: i.number(),
```

- [ ] **Step 2: Agregar las 4 entidades nuevas**

En `instant.schema.ts`, dentro del objeto de entidades (después de `trainingMaterials`), agrega:

```ts
    // --------------------------------------------
    // BLOQUE B — QUIZZES, RUTA, PROGRESO, INSIGNIAS
    // --------------------------------------------
    quizQuestions: i.entity({
      questionText: i.string(),
      options: i.json(),           // array de 2-4 strings
      correctIndex: i.number(),
      order: i.number(),
      createdAt: i.number(),
    }),

    pathSteps: i.entity({
      order: i.number(),
      createdAt: i.number(),
    }),

    materialProgress: i.entity({
      // status: 'in_progress' | 'completed'
      status: i.string().indexed(),
      comprehensionPct: i.number(),
      attempts: i.number(),
      completedAt: i.number().optional(),
      updatedAt: i.number(),
    }),

    playerBadges: i.entity({
      badgeKey: i.string().indexed(),
      earnedAt: i.number(),
    }),
```

- [ ] **Step 3: Agregar los links nuevos**

En `instant.schema.ts`, dentro del objeto de links (después de `materialAuthor`), agrega:

```ts
    // --------------------------------------------
    // BLOQUE B — LINKS
    // --------------------------------------------

    // quizQuestions -> trainingMaterials (many-to-one)
    questionMaterial: {
      forward: { on: "quizQuestions", has: "one", label: "material" },
      reverse: { on: "trainingMaterials", has: "many", label: "questions" },
    },

    // pathSteps -> categories (many-to-one)
    stepCategory: {
      forward: { on: "pathSteps", has: "one", label: "category" },
      reverse: { on: "categories", has: "many", label: "pathSteps" },
    },

    // pathSteps -> trainingMaterials (many-to-one)
    stepMaterial: {
      forward: { on: "pathSteps", has: "one", label: "material" },
      reverse: { on: "trainingMaterials", has: "many", label: "pathSteps" },
    },

    // materialProgress -> playerProfiles (many-to-one)
    progressPlayer: {
      forward: { on: "materialProgress", has: "one", label: "player" },
      reverse: { on: "playerProfiles", has: "many", label: "progress" },
    },

    // materialProgress -> trainingMaterials (many-to-one)
    progressMaterial: {
      forward: { on: "materialProgress", has: "one", label: "material" },
      reverse: { on: "trainingMaterials", has: "many", label: "progress" },
    },

    // playerBadges -> playerProfiles (many-to-one)
    badgePlayer: {
      forward: { on: "playerBadges", has: "one", label: "player" },
      reverse: { on: "playerProfiles", has: "many", label: "badges" },
    },
```

- [ ] **Step 4: Agregar permisos**

En `instant.perms.ts`, agrega estos bloques dentro del objeto exportado (junto a los demás):

```ts
  pathSteps: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  quizQuestions: {
    allow: {
      // Riesgo anti-trampa aceptado: correctIndex es visible en cliente (deuda técnica documentada).
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  materialProgress: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },

  playerBadges: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "false",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },
```

- [ ] **Step 5: Verificar typecheck y tests**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.
Run: `npm test`
Expected: los tests existentes siguen pasando (20/20).

- [ ] **Step 6: Commit**

```bash
git add instant.schema.ts instant.perms.ts
git commit -m "feat(schema+perms): entidades ruta/quiz/progreso/insignias y xp del jugador"
```

---

### Task 2: `gamification.ts` — lógica pura de puntaje, XP, nivel e insignias (TDD)

El núcleo testeado del bloque. Todo funciones puras.

**Files:**
- Create: `client/src/lib/gamification.ts`
- Test: `client/src/lib/gamification.test.ts`

**Interfaces:**
- Produces (consumido por Task 8 QuizRunner y Task 9 header/leaderboard):
  - Constantes: `PASS_THRESHOLD=70`, `XP_BASE=10`, `XP_PERFECT_BONUS=5`, `XP_PER_LEVEL=50`.
  - `type BadgeKey = "primer_paso" | "quiz_perfecto" | "ruta_completa"`.
  - `BADGE_DEFINITIONS: Record<BadgeKey, { key: BadgeKey; label: string; description: string; icon: string }>`.
  - `computeQuizScore(answers: (number|null)[], questions: { correctIndex: number }[]): number` (0-100 entero).
  - `isPassing(score: number): boolean`.
  - `xpForQuizPass(score: number): number`.
  - `levelForXp(xp: number): number` (1-based).
  - `xpIntoLevel(xp: number): number` y `xpForNextLevel(): number` (para barras de progreso).
  - `evaluateNewBadges(state: BadgeEvalState): BadgeKey[]` con `BadgeEvalState = { completedCount: number; justScored: number; pathTotalSteps: number; pathCompletedSteps: number; alreadyEarned: BadgeKey[] }`.

- [ ] **Step 1: Escribir el test que falla**

Crea `client/src/lib/gamification.test.ts`:

```ts
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
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npm test -- gamification`
Expected: FAIL (módulo `./gamification` no existe).

- [ ] **Step 3: Implementar `gamification.ts`**

Crea `client/src/lib/gamification.ts`:

```ts
export const PASS_THRESHOLD = 70;
export const XP_BASE = 10;
export const XP_PERFECT_BONUS = 5;
export const XP_PER_LEVEL = 50;

export type BadgeKey = "primer_paso" | "quiz_perfecto" | "ruta_completa";

export interface BadgeDefinition {
  key: BadgeKey;
  label: string;
  description: string;
  icon: string; // emoji
}

export const BADGE_DEFINITIONS: Record<BadgeKey, BadgeDefinition> = {
  primer_paso: {
    key: "primer_paso",
    label: "Primer paso",
    description: "Completaste tu primer contenido",
    icon: "🥅",
  },
  quiz_perfecto: {
    key: "quiz_perfecto",
    label: "Puntaje perfecto",
    description: "Sacaste 100% en un quiz",
    icon: "🎯",
  },
  ruta_completa: {
    key: "ruta_completa",
    label: "Ruta completa",
    description: "Terminaste toda la ruta de tu categoría",
    icon: "🏆",
  },
};

/** Puntaje 0-100 (entero) = respuestas correctas / total. Nulos = incorrectos. */
export function computeQuizScore(
  answers: (number | null)[],
  questions: { correctIndex: number }[]
): number {
  if (questions.length === 0) return 0;
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correct++;
  });
  return Math.round((correct / questions.length) * 100);
}

export function isPassing(score: number): boolean {
  return score >= PASS_THRESHOLD;
}

export function xpForQuizPass(score: number): number {
  return XP_BASE + (score === 100 ? XP_PERFECT_BONUS : 0);
}

/** Nivel 1-based: cada XP_PER_LEVEL sube un nivel. */
export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** XP acumulado dentro del nivel actual (0..XP_PER_LEVEL-1). */
export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function xpForNextLevel(): number {
  return XP_PER_LEVEL;
}

export interface BadgeEvalState {
  completedCount: number;      // total contenidos completados (incluye el recién completado)
  justScored: number;          // puntaje del quiz recién aprobado (0-100)
  pathTotalSteps: number;      // pasos en la ruta de su categoría
  pathCompletedSteps: number;  // pasos de la ruta completados
  alreadyEarned: BadgeKey[];   // keys ya presentes en playerBadges
}

/** Devuelve las insignias recién ganadas (que NO estaban ya otorgadas). */
export function evaluateNewBadges(state: BadgeEvalState): BadgeKey[] {
  const earned = new Set(state.alreadyEarned);
  const result: BadgeKey[] = [];

  const grant = (key: BadgeKey, condition: boolean) => {
    if (condition && !earned.has(key)) result.push(key);
  };

  grant("primer_paso", state.completedCount >= 1);
  grant("quiz_perfecto", state.justScored === 100);
  grant(
    "ruta_completa",
    state.pathTotalSteps > 0 && state.pathCompletedSteps >= state.pathTotalSteps
  );

  return result;
}
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `npm test -- gamification`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/gamification.ts client/src/lib/gamification.test.ts
git commit -m "feat(lib): gamificacion pura -- score, xp, nivel e insignias"
```

---

### Task 3: `learningPath.ts` — reglas de ruta secuencial (TDD)

**Files:**
- Create: `client/src/lib/learningPath.ts`
- Test: `client/src/lib/learningPath.test.ts`

**Interfaces:**
- Produces (consumido por Task 7 PathCarousel/usePlayerPath y Task 10 dashboard):
  - `type StepStatus = "locked" | "available" | "completed"`.
  - `interface PathStepView { id: string; order: number; materialId: string }`.
  - `interface ProgressView { materialId: string; status: "in_progress" | "completed"; comprehensionPct: number }`.
  - `sortSteps(steps: PathStepView[]): PathStepView[]`.
  - `unlockedStepIndex(steps: PathStepView[], progress: ProgressView[]): number`.
  - `stepStatus(index: number, unlockedIdx: number): StepStatus`.
  - `pathProgressPct(steps: PathStepView[], progress: ProgressView[]): number`.

- [ ] **Step 1: Escribir el test que falla**

Crea `client/src/lib/learningPath.test.ts`:

```ts
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
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npm test -- learningPath`
Expected: FAIL (módulo no existe).

- [ ] **Step 3: Implementar `learningPath.ts`**

Crea `client/src/lib/learningPath.ts`:

```ts
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
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `npm test -- learningPath`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/learningPath.ts client/src/lib/learningPath.test.ts
git commit -m "feat(lib): reglas de ruta secuencial (desbloqueo, estado, progreso)"
```

---

### Task 4: Esquemas Zod de contenido y quiz (TDD ligero)

**Files:**
- Create: `client/src/lib/materialSchema.ts`
- Test: `client/src/lib/materialSchema.test.ts`

**Interfaces:**
- Produces (consumido por Task 5 LibraryManager/QuizEditor):
  - `MATERIAL_TYPES = ["video","document","drill","tactic"] as const`.
  - `DIFFICULTIES = ["beginner","intermediate","advanced"] as const`.
  - `materialSchema` (Zod) → `MaterialInput` con `{ title, type, contentUrl, description?, duration?, difficulty }`.
  - `quizQuestionSchema` (Zod) → `QuizQuestionInput` con `{ questionText, options: string[] (2-4), correctIndex }` y validación de que `correctIndex` esté dentro del rango de `options`.

- [ ] **Step 1: Escribir el test que falla**

Crea `client/src/lib/materialSchema.test.ts`:

```ts
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
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npm test -- materialSchema`
Expected: FAIL (módulo no existe).

- [ ] **Step 3: Implementar `materialSchema.ts`**

Crea `client/src/lib/materialSchema.ts`:

```ts
import { z } from "zod";

export const MATERIAL_TYPES = ["video", "document", "drill", "tactic"] as const;
export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export const materialSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  type: z.enum(MATERIAL_TYPES),
  contentUrl: z.string().min(1, "URL requerida"),
  description: z.string().optional(),
  duration: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES),
});
export type MaterialInput = z.infer<typeof materialSchema>;

export const quizQuestionSchema = z
  .object({
    questionText: z.string().min(1, "Pregunta requerida"),
    options: z.array(z.string().min(1, "Opción vacía")).min(2, "Mínimo 2 opciones").max(4, "Máximo 4 opciones"),
    correctIndex: z.number().int().min(0),
  })
  .refine((d) => d.correctIndex < d.options.length, {
    message: "La respuesta correcta debe ser una de las opciones",
    path: ["correctIndex"],
  });
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `npm test -- materialSchema`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/materialSchema.ts client/src/lib/materialSchema.test.ts
git commit -m "feat(lib): esquemas Zod de contenido y pregunta de quiz"
```

---

### Task 5: Coach — biblioteca y editor de quizzes (`LibraryManager` + `QuizEditor`)

CRUD de contenidos del pool y edición de las preguntas de cada contenido.

**Files:**
- Create: `client/src/components/coach/LibraryManager.tsx`
- Create: `client/src/components/coach/QuizEditor.tsx`

**Interfaces:**
- Consumes: `materialSchema`, `quizQuestionSchema`, `MATERIAL_TYPES`, `DIFFICULTIES` (Task 4); entidades `trainingMaterials`, `quizQuestions` con link `questions` (Task 1).
- Produces: `<LibraryManager />` (sin props) y `<QuizEditor materialId={string} onDone={() => void} />` — usados por Task 11 (CoachDashboard).

- [ ] **Step 1: Implementar `QuizEditor.tsx`**

Crea `client/src/components/coach/QuizEditor.tsx`:

```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { quizQuestionSchema } from "@/lib/materialSchema";
import { Trash2, Plus } from "lucide-react";

export function QuizEditor({ materialId, onDone }: { materialId: string; onDone?: () => void }) {
  const { toast } = useToast();
  const { data } = db.useQuery({
    trainingMaterials: { $: { where: { id: materialId } }, questions: {} },
  });
  const questions = ((data?.trainingMaterials?.[0] as any)?.questions || []) as any[];
  const sorted = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const addQuestion = async () => {
    const parsed = quizQuestionSchema.safeParse({ questionText, options, correctIndex });
    if (!parsed.success) {
      toast({ title: "Revisa la pregunta", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    const qid = txId();
    await db.transact([
      db.tx.quizQuestions[qid].update({
        questionText: parsed.data.questionText,
        options: parsed.data.options,
        correctIndex: parsed.data.correctIndex,
        order: sorted.length,
        createdAt: Date.now(),
      }),
      db.tx.quizQuestions[qid].link({ material: materialId }),
    ]);
    setQuestionText("");
    setOptions(["", ""]);
    setCorrectIndex(0);
    toast({ title: "✅ Pregunta agregada" });
  };

  const removeQuestion = async (qid: string) => {
    await db.transact([db.tx.quizQuestions[qid].delete()]);
    toast({ title: "Pregunta eliminada" });
  };

  const setOption = (i: number, v: string) => setOptions((o) => o.map((x, j) => (j === i ? v : x)));

  return (
    <Card>
      <CardHeader><CardTitle>Quiz del contenido ({sorted.length} preguntas)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((q) => (
          <div key={q.id} className="border rounded p-3 flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{q.questionText}</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {(q.options as string[]).map((opt, i) => (
                  <li key={i} className={i === q.correctIndex ? "text-green-600 font-semibold" : ""}>
                    {i === q.correctIndex ? "✔ " : "• "}{opt}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}

        <div className="border-t pt-4 space-y-3">
          <div><Label>Nueva pregunta</Label><Input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="¿...?" /></div>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
              <Input value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Opción ${i + 1}`} />
              {options.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => { setOptions((o) => o.filter((_, j) => j !== i)); if (correctIndex >= i && correctIndex > 0) setCorrectIndex((c) => c - 1); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <Button variant="outline" size="sm" onClick={() => setOptions((o) => [...o, ""])}><Plus className="h-4 w-4 mr-1" /> Opción</Button>
          )}
          <div className="flex gap-2">
            <Button onClick={addQuestion}><Plus className="h-4 w-4 mr-1" /> Agregar pregunta</Button>
            {onDone && <Button variant="outline" onClick={onDone}>Listo</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Implementar `LibraryManager.tsx`**

Crea `client/src/components/coach/LibraryManager.tsx`:

```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { materialSchema, MATERIAL_TYPES, DIFFICULTIES } from "@/lib/materialSchema";
import { QuizEditor } from "./QuizEditor";
import { Plus, Pencil, ListChecks } from "lucide-react";

const TYPE_LABELS: Record<string, string> = { video: "Video", document: "Documento", drill: "Ejercicio", tactic: "Táctica" };
const DIFF_LABELS: Record<string, string> = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };

export function LibraryManager() {
  const { toast } = useToast();
  const { data } = db.useQuery({ trainingMaterials: { questions: {} } });
  const materials = ((data?.trainingMaterials || []) as any[]).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [quizFor, setQuizFor] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", type: "video", contentUrl: "", description: "", duration: "", difficulty: "beginner" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const resetForm = () => { setForm({ title: "", type: "video", contentUrl: "", description: "", duration: "", difficulty: "beginner" }); setEditingId(null); };

  const save = async () => {
    const parsed = materialSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Revisa los datos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    const mid = editingId || txId();
    await db.transact([
      db.tx.trainingMaterials[mid].update({
        ...parsed.data,
        description: parsed.data.description || undefined,
        duration: parsed.data.duration || undefined,
        isPublic: true,
        createdAt: editingId ? undefined as any : Date.now(),
        updatedAt: Date.now(),
      }),
    ]);
    toast({ title: editingId ? "✅ Contenido actualizado" : "✅ Contenido creado" });
    resetForm();
  };

  const edit = (m: any) => {
    setEditingId(m.id);
    setForm({ title: m.title || "", type: m.type || "video", contentUrl: m.contentUrl || "", description: m.description || "", duration: m.duration || "", difficulty: m.difficulty || "beginner" });
  };

  if (quizFor) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setQuizFor(null)}>← Volver a la biblioteca</Button>
        <QuizEditor materialId={quizFor} onDone={() => setQuizFor(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{editingId ? "Editar contenido" : "Nuevo contenido"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Título</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div>
              <Label>Tipo</Label>
              <select className="w-full border rounded h-10 px-2" value={form.type} onChange={(e) => set("type", e.target.value)}>
                {MATERIAL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div><Label>URL (YouTube, Drive, etc.)</Label><Input value={form.contentUrl} onChange={(e) => set("contentUrl", e.target.value)} placeholder="https://..." /></div>
          <div><Label>Descripción</Label><Input value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Duración</Label><Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="15 min" /></div>
            <div>
              <Label>Dificultad</Label>
              <select className="w-full border rounded h-10 px-2" value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFF_LABELS[d]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}><Plus className="h-4 w-4 mr-1" /> {editingId ? "Guardar" : "Crear"}</Button>
            {editingId && <Button variant="outline" onClick={resetForm}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        {materials.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm">{m.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[m.type] || m.type}</Badge>
                    <Badge variant="secondary" className="text-xs">{(m.questions || []).length} preguntas</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => edit(m)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setQuizFor(m.id)}><ListChecks className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/coach/LibraryManager.tsx client/src/components/coach/QuizEditor.tsx
git commit -m "feat(coach): gestor de biblioteca y editor de quizzes"
```

---

### Task 6: Coach — armar la ruta de la categoría (`PathBuilder`)

Selecciona contenidos del pool y los ordena (subir/bajar) para formar la ruta de una categoría.

**Files:**
- Create: `client/src/components/coach/PathBuilder.tsx`

**Interfaces:**
- Consumes: entidades `pathSteps` con links `stepCategory`, `stepMaterial` (Task 1); `trainingMaterials`.
- Produces: `<PathBuilder category={string} />` — usado por Task 11.

- [ ] **Step 1: Implementar `PathBuilder.tsx`**

Crea `client/src/components/coach/PathBuilder.tsx`. La ruta es la lista de `pathSteps` de la categoría, ordenada por `order`. "Agregar" crea un `pathStep` al final; subir/bajar intercambia `order`; quitar borra el step (no el material).

```tsx
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

export function PathBuilder({ category }: { category: string }) {
  const { toast } = useToast();
  const { data } = db.useQuery({
    pathSteps: { $: { where: { "category.id": category } }, material: {} },
    trainingMaterials: {},
  });
  const steps = ((data?.pathSteps || []) as any[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const materials = (data?.trainingMaterials || []) as any[];
  const inPath = new Set(steps.map((s) => s.material?.id).filter(Boolean));
  const available = materials.filter((m) => !inPath.has(m.id));

  const addStep = async (materialId: string) => {
    const sid = txId();
    await db.transact([
      db.tx.pathSteps[sid].update({ order: steps.length, createdAt: Date.now() }),
      db.tx.pathSteps[sid].link({ category, material: materialId }),
    ]);
    toast({ title: "✅ Agregado a la ruta" });
  };

  const removeStep = async (stepId: string) => {
    await db.transact([db.tx.pathSteps[stepId].delete()]);
    toast({ title: "Quitado de la ruta" });
  };

  const swap = async (i: number, j: number) => {
    if (j < 0 || j >= steps.length) return;
    const a = steps[i], b = steps[j];
    await db.transact([
      db.tx.pathSteps[a.id].update({ order: b.order }),
      db.tx.pathSteps[b.id].update({ order: a.order }),
    ]);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Ruta de {category} ({steps.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {steps.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay pasos. Agrega contenidos desde la derecha.</p>}
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 border rounded p-2">
              <Badge variant="outline">{i + 1}</Badge>
              <span className="flex-1 text-sm">{s.material?.title || "Contenido"}</span>
              <Button variant="ghost" size="icon" onClick={() => swap(i, i - 1)} disabled={i === 0}><ChevronUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => swap(i, i + 1)} disabled={i === steps.length - 1}><ChevronDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => removeStep(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contenidos disponibles</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {available.length === 0 && <p className="text-sm text-muted-foreground">Todos los contenidos ya están en la ruta.</p>}
          {available.map((m) => (
            <div key={m.id} className="flex items-center gap-2 border rounded p-2">
              <span className="flex-1 text-sm">{m.title}</span>
              <Button variant="outline" size="sm" onClick={() => addStep(m.id)}><Plus className="h-4 w-4 mr-1" /> Agregar</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/coach/PathBuilder.tsx
git commit -m "feat(coach): armador de la ruta por categoria (orden y seleccion)"
```

---

### Task 7: Jugador — hook `usePlayerPath` + carrusel de ruta + visor de contenido

**Files:**
- Create: `client/src/hooks/usePlayerPath.ts`
- Create: `client/src/components/learning/PathCarousel.tsx`
- Create: `client/src/components/learning/ContentViewer.tsx`

**Interfaces:**
- Consumes: `learningPath.ts` (Task 3); entidades `pathSteps`, `materialProgress` (Task 1).
- Produces:
  - `usePlayerPath(player: { id: string; category: string })` → `{ steps: EnrichedStep[]; progress: ProgressView[]; unlockedIdx: number; progressPct: number; isLoading: boolean }` donde `EnrichedStep = { id: string; order: number; materialId: string; material: any; status: StepStatus; comprehensionPct: number | null }`.
  - `<PathCarousel player={...} onOpen={(materialId: string) => void} />`.
  - `<ContentViewer material={any} onQuiz={() => void} onBack={() => void} />` — usado por Task 8/11.

- [ ] **Step 1: Implementar `usePlayerPath.ts`**

Crea `client/src/hooks/usePlayerPath.ts`:

```ts
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
```

> Nota para el implementador: la query pide `materialProgress` con su link `material` para poder cruzar por `materialId`. Asegúrate de que la query incluya el link `material` en `materialProgress` (ajústala a `materialProgress: { $: {...}, material: {} }`). Si InstantDB no soporta el filtro `"category.id"`/`"player.id"` como se muestra, filtra en memoria tras traer todo (`pathSteps: { material: {} }` y `materialProgress: { material: {} }`) — el volumen es pequeño (un club).

- [ ] **Step 2: Implementar `ContentViewer.tsx`**

Crea `client/src/components/learning/ContentViewer.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ListChecks, ExternalLink } from "lucide-react";

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function ContentViewer({ material, onQuiz, onBack }: { material: any; onQuiz: () => void; onBack: () => void }) {
  const embed = material?.contentUrl ? youtubeEmbed(material.contentUrl) : null;
  const hasQuiz = (material?.questions || []).length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{material?.title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {embed ? (
          <div className="aspect-video w-full">
            <iframe className="w-full h-full rounded" src={embed} title={material.title} allowFullScreen />
          </div>
        ) : (
          <a href={material?.contentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline">
            Abrir contenido <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {material?.description && <p className="text-sm text-muted-foreground">{material.description}</p>}
        {hasQuiz ? (
          <Button onClick={onQuiz} className="w-full"><ListChecks className="h-4 w-4 mr-1" /> Hacer el quiz</Button>
        ) : (
          <p className="text-sm text-muted-foreground">Este contenido aún no tiene quiz.</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Implementar `PathCarousel.tsx`**

Crea `client/src/components/learning/PathCarousel.tsx`:

```tsx
import { usePlayerPath } from "@/hooks/usePlayerPath";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, PlayCircle } from "lucide-react";

export function PathCarousel({ player, onOpen }: { player: { id: string; category: string }; onOpen: (materialId: string) => void }) {
  const { steps, progressPct, isLoading } = usePlayerPath(player);

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Cargando ruta...</div>;
  if (steps.length === 0) return <div className="py-8 text-center text-muted-foreground">Tu entrenador aún no ha publicado la ruta de tu categoría.</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Tu ruta de formación</h3>
        <Badge variant="secondary">{progressPct}% completado</Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {steps.map((s, i) => {
          const locked = s.status === "locked";
          const completed = s.status === "completed";
          return (
            <button
              key={s.id}
              disabled={locked}
              onClick={() => onOpen(s.materialId)}
              className={`min-w-[180px] text-left ${locked ? "opacity-50 cursor-not-allowed" : "hover-elevate"}`}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Paso {i + 1}</Badge>
                    {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    {completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {s.status === "available" && <PlayCircle className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="font-medium text-sm line-clamp-2">{s.material?.title || "Contenido"}</p>
                  {completed && s.comprehensionPct != null && (
                    <p className="text-xs text-green-600 mt-1">Comprensión: {s.comprehensionPct}%</p>
                  )}
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/usePlayerPath.ts client/src/components/learning/PathCarousel.tsx client/src/components/learning/ContentViewer.tsx
git commit -m "feat(learning): hook de ruta del jugador, carrusel y visor de contenido"
```

---

### Task 8: Jugador — `QuizRunner` con transacción de gamificación

Corre el quiz, calcula el puntaje y, al aprobar por primera vez, escribe progreso + XP + insignias en una sola transacción idempotente.

**Files:**
- Create: `client/src/components/learning/QuizRunner.tsx`

**Interfaces:**
- Consumes: `gamification.ts` (`computeQuizScore`, `isPassing`, `xpForQuizPass`, `evaluateNewBadges`) Task 2; entidades `materialProgress`, `playerBadges`, `playerProfiles.xp` Task 1.
- Produces: `<QuizRunner player={any} material={any} onDone={() => void} />` — usado por Task 11.

- [ ] **Step 1: Implementar `QuizRunner.tsx`**

Crea `client/src/components/learning/QuizRunner.tsx`. Lógica clave de la transacción:
1. Calcula `score`. Si no aprueba: actualiza `materialProgress` (`in_progress`, `attempts++`, mejor `comprehensionPct`), sin XP.
2. Si aprueba: determina si es la **primera** vez que este material pasa a `completed` para este jugador (mirando el `materialProgress` existente). Solo entonces suma XP y evalúa insignias.

```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  computeQuizScore,
  isPassing,
  xpForQuizPass,
  evaluateNewBadges,
  type BadgeKey,
  BADGE_DEFINITIONS,
} from "@/lib/gamification";
import { CheckCircle2, XCircle } from "lucide-react";

export function QuizRunner({ player, material, onDone }: { player: any; material: any; onDone: () => void }) {
  const { toast } = useToast();
  const questions = ([...(material?.questions || [])] as any[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Progreso + estado del jugador para idempotencia y evaluación de insignias
  const { data } = db.useQuery({
    materialProgress: { $: { where: { "player.id": player.id } }, material: {} },
    playerProfiles: { $: { where: { id: player.id } }, badges: {}, progress: { material: {} } },
    pathSteps: { $: { where: { "category.id": player.category } }, material: {} },
  });

  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [result, setResult] = useState<{ score: number; passed: boolean; newBadges: BadgeKey[] } | null>(null);

  const pick = (qi: number, oi: number) => setAnswers((a) => a.map((x, j) => (j === qi ? oi : x)));

  const submit = async () => {
    const score = computeQuizScore(answers, questions);
    const passed = isPassing(score);

    const profile = (data?.playerProfiles?.[0] as any) || {};
    const allProgress = (data?.materialProgress || []) as any[];
    const existing = allProgress.find((p) => (p.material?.id) === material.id);
    const wasAlreadyCompleted = existing?.status === "completed";
    const bestPct = Math.max(existing?.comprehensionPct ?? 0, score);

    const progId = existing?.id || txId();
    const ops: any[] = [
      db.tx.materialProgress[progId].update({
        status: passed ? "completed" : "in_progress",
        comprehensionPct: bestPct,
        attempts: (existing?.attempts ?? 0) + 1,
        completedAt: passed ? (existing?.completedAt ?? Date.now()) : existing?.completedAt,
        updatedAt: Date.now(),
      }),
    ];
    if (!existing) {
      ops.push(db.tx.materialProgress[progId].link({ player: player.id, material: material.id }));
    }

    let newBadges: BadgeKey[] = [];

    // Gamificación SOLO en la primera transición a completed (idempotencia)
    if (passed && !wasAlreadyCompleted) {
      const xpGain = xpForQuizPass(score);
      ops.push(db.tx.playerProfiles[player.id].update({ xp: (profile.xp ?? 0) + xpGain }));

      // Estado para evaluar insignias (incluye este material recién completado)
      const completedMaterialIds = new Set(
        allProgress.filter((p) => p.status === "completed").map((p) => p.material?.id)
      );
      completedMaterialIds.add(material.id);
      const pathMaterialIds = new Set(((data?.pathSteps || []) as any[]).map((s) => s.material?.id).filter(Boolean));
      const pathCompleted = [...completedMaterialIds].filter((id) => pathMaterialIds.has(id)).length;
      const alreadyEarned = ((profile.badges || []) as any[]).map((b) => b.badgeKey as BadgeKey);

      newBadges = evaluateNewBadges({
        completedCount: completedMaterialIds.size,
        justScored: score,
        pathTotalSteps: pathMaterialIds.size,
        pathCompletedSteps: pathCompleted,
        alreadyEarned,
      });

      newBadges.forEach((key) => {
        const bid = txId();
        ops.push(db.tx.playerBadges[bid].update({ badgeKey: key, earnedAt: Date.now() }));
        ops.push(db.tx.playerBadges[bid].link({ player: player.id }));
      });
    }

    await db.transact(ops);
    setResult({ score, passed, newBadges });
    if (passed) {
      toast({ title: `✅ Aprobado (${score}%)` });
    } else {
      toast({ title: `Puntaje: ${score}%`, description: "Necesitas 70% para aprobar. ¡Reintenta!", variant: "destructive" });
    }
  };

  if (result) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">
          {result.passed ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-destructive" />}
          {result.passed ? "¡Aprobado!" : "Sigue intentando"}
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-bold">{result.score}%</p>
          {result.newBadges.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Nuevas insignias:</p>
              {result.newBadges.map((k) => (
                <p key={k} className="text-sm">{BADGE_DEFINITIONS[k].icon} {BADGE_DEFINITIONS[k].label}</p>
              ))}
            </div>
          )}
          <Button onClick={onDone} className="w-full">Continuar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Quiz: {material?.title}</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {questions.length === 0 && <p className="text-muted-foreground">Este contenido no tiene preguntas.</p>}
        {questions.map((q, qi) => (
          <div key={q.id} className="space-y-2">
            <p className="font-medium text-sm">{qi + 1}. {q.questionText}</p>
            <div className="space-y-1">
              {(q.options as string[]).map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => pick(qi, oi)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        {questions.length > 0 && (
          <Button onClick={submit} disabled={answers.some((a) => a === null)} className="w-full">Enviar respuestas</Button>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/learning/QuizRunner.tsx
git commit -m "feat(learning): quiz con transaccion idempotente de progreso, xp e insignias"
```

---

### Task 9: Jugador — encabezado de progreso e insignias + ranking

**Files:**
- Create: `client/src/components/learning/PlayerProgressHeader.tsx`
- Create: `client/src/components/learning/Leaderboard.tsx`

**Interfaces:**
- Consumes: `gamification.ts` (`levelForXp`, `xpIntoLevel`, `xpForNextLevel`, `BADGE_DEFINITIONS`) Task 2; `playerProfiles.xp`, link `badges` Task 1.
- Produces: `<PlayerProgressHeader player={any} />` y `<Leaderboard category={string} currentPlayerId={string} />` — usados por Task 11.

- [ ] **Step 1: Implementar `PlayerProgressHeader.tsx`**

Crea `client/src/components/learning/PlayerProgressHeader.tsx`:

```tsx
import { db } from "@/lib/instant";
import { Card, CardContent } from "@/components/ui/card";
import { levelForXp, xpIntoLevel, xpForNextLevel, BADGE_DEFINITIONS, type BadgeKey } from "@/lib/gamification";

export function PlayerProgressHeader({ player }: { player: { id: string } }) {
  const { data } = db.useQuery({ playerProfiles: { $: { where: { id: player.id } }, badges: {} } });
  const profile = (data?.playerProfiles?.[0] as any) || {};
  const xp = profile.xp ?? 0;
  const level = levelForXp(xp);
  const into = xpIntoLevel(xp);
  const pct = Math.round((into / xpForNextLevel()) * 100);
  const badges = ((profile.badges || []) as any[]).map((b) => b.badgeKey as BadgeKey);

  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Nivel</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">XP total</p>
            <p className="text-xl font-bold">{xp}</p>
          </div>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{into}/{xpForNextLevel()} XP para el siguiente nivel</p>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {badges.map((k) => (
              <span key={k} title={BADGE_DEFINITIONS[k]?.description} className="text-sm border rounded-full px-2 py-0.5">
                {BADGE_DEFINITIONS[k]?.icon} {BADGE_DEFINITIONS[k]?.label}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Implementar `Leaderboard.tsx`**

Crea `client/src/components/learning/Leaderboard.tsx`:

```tsx
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { levelForXp } from "@/lib/gamification";
import { playerDisplayName } from "@/lib/players";
import { Trophy } from "lucide-react";

export function Leaderboard({ category, currentPlayerId }: { category: string; currentPlayerId: string }) {
  const { data } = db.useQuery({ playerProfiles: { $: { where: { category, status: "approved" } } } });
  const players = ((data?.playerProfiles || []) as any[])
    .map((p) => ({ ...p, xp: p.xp ?? 0 }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Ranking {category}</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {players.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay jugadores con progreso.</p>}
        {players.map((p, i) => (
          <div key={p.id} className={`flex items-center justify-between p-2 rounded ${p.id === currentPlayerId ? "bg-primary/10" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-muted-foreground">{i + 1}</span>
              <span className="text-sm">{playerDisplayName(p)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Nv {levelForXp(p.xp)}</Badge>
              <Badge variant="secondary">{p.xp} XP</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/learning/PlayerProgressHeader.tsx client/src/components/learning/Leaderboard.tsx
git commit -m "feat(learning): encabezado de progreso/insignias y ranking de categoria"
```

---

### Task 10: Coach — dashboard de progreso de la categoría

**Files:**
- Create: `client/src/components/coach/CategoryProgressDashboard.tsx`

**Interfaces:**
- Consumes: `gamification.ts` (`levelForXp`), `learningPath.ts` (`pathProgressPct`, tipos) Tasks 2-3; entidades `pathSteps`, `playerProfiles` con links `progress`, `badges`.
- Produces: `<CategoryProgressDashboard category={string} />` — usado por Task 11.

- [ ] **Step 1: Implementar `CategoryProgressDashboard.tsx`**

Crea `client/src/components/coach/CategoryProgressDashboard.tsx`:

```tsx
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { levelForXp } from "@/lib/gamification";
import { pathProgressPct, type PathStepView, type ProgressView } from "@/lib/learningPath";
import { playerDisplayName } from "@/lib/players";

export function CategoryProgressDashboard({ category }: { category: string }) {
  const { data } = db.useQuery({
    pathSteps: { $: { where: { "category.id": category } }, material: {} },
    playerProfiles: { $: { where: { category, status: "approved" } }, progress: { material: {} }, badges: {} },
  });

  const steps: PathStepView[] = ((data?.pathSteps || []) as any[]).map((s) => ({
    id: s.id, order: s.order ?? 0, materialId: s.material?.id || "",
  }));
  const players = ((data?.playerProfiles || []) as any[])
    .map((p) => ({ ...p, xp: p.xp ?? 0 }))
    .sort((a, b) => b.xp - a.xp);

  return (
    <Card>
      <CardHeader><CardTitle>Progreso de {category} — ruta de {steps.length} pasos</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {players.length === 0 && <p className="text-sm text-muted-foreground">No hay jugadores aprobados en esta categoría.</p>}
        {players.map((p) => {
          const prog: ProgressView[] = ((p.progress || []) as any[]).map((x) => ({
            materialId: x.material?.id || "", status: x.status, comprehensionPct: x.comprehensionPct ?? 0,
          }));
          const pct = pathProgressPct(steps, prog);
          return (
            <div key={p.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <p className="font-medium text-sm">{playerDisplayName(p)}</p>
                <p className="text-xs text-muted-foreground">{(p.badges || []).length} insignias</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                <Badge variant="outline">{pct}%</Badge>
                <Badge variant="secondary">Nv {levelForXp(p.xp)}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/coach/CategoryProgressDashboard.tsx
git commit -m "feat(coach): dashboard de progreso de la categoria"
```

---

### Task 11: Integración en `PlayerDashboard` y `CoachDashboard`

Monta los componentes en las páginas existentes. Deliverable: el flujo completo se navega en la app.

**Files:**
- Modify: `client/src/pages/PlayerDashboard.tsx`
- Modify: `client/src/pages/CoachDashboard.tsx`

**Interfaces:**
- Consumes: todos los componentes de Tasks 5-10.

- [ ] **Step 1: Integrar la vista de formación del jugador en `PlayerDashboard.tsx`**

En `client/src/pages/PlayerDashboard.tsx`, agrega los imports:

```tsx
import { useState as useLocalState } from "react";
import { PlayerProgressHeader } from "@/components/learning/PlayerProgressHeader";
import { PathCarousel } from "@/components/learning/PathCarousel";
import { ContentViewer } from "@/components/learning/ContentViewer";
import { QuizRunner } from "@/components/learning/QuizRunner";
import { Leaderboard } from "@/components/learning/Leaderboard";
```

Reemplaza el bloque de tarjetas placeholder (el `<div className="grid gap-4 md:grid-cols-3">` con "Formación / Cartera / Estadísticas — Próximamente") por una sección de formación. Justo antes del `return` de la vista del jugador (sección 4), agrega estado local para la navegación de contenido:

```tsx
  // (dentro del componente, junto a los otros useState)
  const [openMaterialId, setOpenMaterialId] = useState<string | null>(null);
  const [inQuiz, setInQuiz] = useState(false);
```

Y sustituye el bloque `unlocked ? (…placeholder…)` por:

```tsx
        {!unlocked ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">
            El contenido se habilita cuando el club apruebe a este jugador.
          </CardContent></Card>
        ) : (
          <FormacionSection player={player} openMaterialId={openMaterialId} setOpenMaterialId={setOpenMaterialId} inQuiz={inQuiz} setInQuiz={setInQuiz} />
        )}
```

Y agrega, al final del archivo (fuera del componente principal), el subcomponente:

```tsx
import { db as _db } from "@/lib/instant";

function FormacionSection({ player, openMaterialId, setOpenMaterialId, inQuiz, setInQuiz }: any) {
  const { data } = _db.useQuery(
    openMaterialId ? { trainingMaterials: { $: { where: { id: openMaterialId } }, questions: {} } } : null
  );
  const material = (data?.trainingMaterials?.[0] as any) || null;

  if (openMaterialId && material) {
    if (inQuiz) {
      return <QuizRunner player={player} material={material} onDone={() => { setInQuiz(false); setOpenMaterialId(null); }} />;
    }
    return <ContentViewer material={material} onQuiz={() => setInQuiz(true)} onBack={() => setOpenMaterialId(null)} />;
  }

  return (
    <div className="space-y-6">
      <PlayerProgressHeader player={player} />
      <PathCarousel player={player} onOpen={(mid: string) => { setOpenMaterialId(mid); setInQuiz(false); }} />
      <Leaderboard category={player.category} currentPlayerId={player.id} />
    </div>
  );
}
```

> Nota: quita el import duplicado `useState as useLocalState` si no lo usas; el ejemplo usa `useState` ya importado en el archivo. Mantén un solo import de `useState`.

- [ ] **Step 2: Verificar typecheck y arranque del cliente**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.

- [ ] **Step 3: Integrar las herramientas del coach en `CoachDashboard.tsx`**

En `client/src/pages/CoachDashboard.tsx` agrega imports:

```tsx
import { LibraryManager } from "@/components/coach/LibraryManager";
import { PathBuilder } from "@/components/coach/PathBuilder";
import { CategoryProgressDashboard } from "@/components/coach/CategoryProgressDashboard";
import { Library, Route, BarChart3 } from "lucide-react";
```

Cambia `grid-cols-4` de la `TabsList` a `grid-cols-7` y agrega estos tres triggers junto a los existentes:

```tsx
            <TabsTrigger value="library"><Library className="mr-1 h-4 w-4" /> Biblioteca</TabsTrigger>
            <TabsTrigger value="path"><Route className="mr-1 h-4 w-4" /> Ruta</TabsTrigger>
            <TabsTrigger value="progress"><BarChart3 className="mr-1 h-4 w-4" /> Progreso</TabsTrigger>
```

Y agrega los tres `TabsContent` (después del de "materials"):

```tsx
          <TabsContent value="library"><LibraryManager /></TabsContent>

          <TabsContent value="path">
            {coachCategory
              ? <PathBuilder category={coachCategory} />
              : <p className="text-sm text-muted-foreground">Tu ficha de coach aún no tiene categoría asignada.</p>}
          </TabsContent>

          <TabsContent value="progress">
            {coachCategory
              ? <CategoryProgressDashboard category={coachCategory} />
              : <p className="text-sm text-muted-foreground">Tu ficha de coach aún no tiene categoría asignada.</p>}
          </TabsContent>
```

- [ ] **Step 4: Verificar typecheck completo y tests**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"`
Expected: sin salida.
Run: `npm test`
Expected: PASS (todos los tests, incluidos los nuevos de Tasks 2-4).

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/PlayerDashboard.tsx client/src/pages/CoachDashboard.tsx
git commit -m "feat: integrar biblioteca/ruta/gamificacion en paneles de jugador y coach"
```

---

## Paso manual final (fuera de las tareas de código)

Como en el Bloque A, el push del schema/perms a InstantDB es interactivo (TUI) y lo debe correr el usuario en su terminal, dentro de `WildDogsHockey-1`:

```bash
instant-cli push schema    # confirmar en "Push these changes?"
instant-cli push perms     # confirmar en "Push these changes?"
```

## Verificación E2E (checklist manual tras el push)

1. Como coach: crear 3 contenidos + sus quizzes en "Biblioteca"; en "Ruta" agregarlos y ordenarlos.
2. Como titular, bajo el perfil de un hijo **aprobado**: solo el paso 1 disponible; 2 y 3 bloqueados.
3. Hacer el quiz del paso 1 con < 70% → sigue `in_progress`, sin XP, se puede reintentar.
4. Aprobar el paso 1 con 100% → +15 XP, insignias `primer_paso` y `quiz_perfecto`, se desbloquea el paso 2.
5. Completar los 3 pasos → insignia `ruta_completa`, carrusel al 100%.
6. Reintentar un paso ya aprobado → el XP **no** aumenta (idempotencia).
7. "Ranking" muestra al jugador con su XP y nivel.
8. Como coach, "Progreso" refleja el % de ruta, nivel e insignias de cada jugador.

## Notas de deuda técnica (documentadas en el spec)
- `quizQuestions.correctIndex` es visible en cliente (sin servidor de calificación). Riesgo aceptado.
- Permisos sin verificación de rol (heredado del Bloque A): el rol coach/admin se refuerza solo en la UI.
- El filtro por links anidados (`"category.id"`, `"player.id"`) en `db.useQuery` debe verificarse contra la versión de InstantDB; si no funciona, traer sin filtro y filtrar en memoria (volumen pequeño).
