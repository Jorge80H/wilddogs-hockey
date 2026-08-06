# Bloque D — Entrenamientos, Asistencia y Estadísticas — Implementation Plan

**Goal:** Implementar el módulo de entrenamientos, toma de asistencia en tiempo real y registro de estadísticas de partido por jugador.

---

## Tasks Breakdown

### Task 1: Esquema + Permisos (Fundación Bloque D)
- Modify: `instant.schema.ts`
- Modify: `instant.perms.ts`

---

### Task 2: Lógica Pura de Asistencia y Estadísticas (TDD)
- Create: `client/src/lib/training.ts`
- Create: `client/src/lib/training.test.ts`

---

### Task 3: Componentes del Jugador
- Create: `client/src/components/training/AttendanceSummaryCard.tsx`
- Create: `client/src/components/training/PlayerMatchStatsCard.tsx`

---

### Task 4: Componentes del Coach
- Create: `client/src/components/coach/AttendanceTracker.tsx`
- Create: `client/src/components/coach/MatchStatsManager.tsx`

---

### Task 5: Integración en Dashboards
- Modify: `client/src/pages/PlayerDashboard.tsx`
- Modify: `client/src/pages/CoachDashboard.tsx`
