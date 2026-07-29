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
