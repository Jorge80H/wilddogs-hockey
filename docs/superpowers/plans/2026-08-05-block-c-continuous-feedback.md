# Bloque C — Feedback Continuo + Informe Mensual — Implementation Plan

**Goal:** Implementar el módulo de evaluación continua e informe mensual para el seguimiento del desarrollo deportivo de los jugadores.

---

## Tasks Breakdown

### Task 1: Lógica Pura de Agregación de Feedback (TDD)
- **Files:**
  - Create: `client/src/lib/feedback.ts`
  - Create: `client/src/lib/feedback.test.ts`
- **Interfaces:**
  - `type DimensionKey = "technical" | "tactical" | "physical" | "attitude"`
  - `calculateFeedbackAverage(item: any): number`
  - `computeDimensionAverages(items: any[]): Record<DimensionKey, number>`
  - `groupFeedbackByMonth(items: any[]): Record<string, any[]>`
  - `computeMonthlySummary(items: any[]): { month: string, averages: Record<DimensionKey, number>, overall: number, count: number }`

---

### Task 2: Componentes para la Vista del Jugador
- **Files:**
  - Create: `client/src/components/feedback/FeedbackMetricsCard.tsx`
  - Create: `client/src/components/feedback/MonthlyReportCard.tsx`
  - Create: `client/src/components/feedback/FeedbackHistoryList.tsx`
- **Interfaces:**
  - `<FeedbackMetricsCard playerProfileId={string} />`
  - `<MonthlyReportCard playerProfileId={string} />`
  - `<FeedbackHistoryList playerProfileId={string} />`

---

### Task 3: Gestor de Feedback para el Coach
- **Files:**
  - Create: `client/src/components/coach/FeedbackManager.tsx`
- **Interfaces:**
  - `<FeedbackManager coachCategory={string} />`

---

### Task 4: Integración en `PlayerDashboard` y `CoachDashboard`
- **Files:**
  - Modify: `client/src/pages/PlayerDashboard.tsx`
  - Modify: `client/src/pages/CoachDashboard.tsx`
