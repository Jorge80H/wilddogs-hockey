# Bloque C — Feedback Continuo + Informe Mensual — Design Spec

**Goal:** Proporcionar un sistema de evaluación continua de jugadores por parte de los entrenadores (dimensiones Técnica, Táctica, Física y Actitud), junto con un informe de desarrollo mensual consolidado y visualización gráfica para la familia en el `PlayerDashboard`.

## Entidades Existentes (InstantDB)
- `playerFeedback`:
  - `type`: `'post-match' | 'quarterly' | 'general'`
  - `technicalScore`: number (1-10)
  - `tacticalScore`: number (1-10)
  - `physicalScore`: number (1-10)
  - `attitudeScore`: number (1-10)
  - `comments`: string
  - `strengths`: string (opcional)
  - `areasToImprove`: string (opcional)
  - `matchDate`: number (timestamp)
  - `createdAt`: number
- Relaciones:
  - `feedbackPlayer`: `playerFeedback` -> `playerProfiles`
  - `feedbackCoach`: `playerFeedback` -> `coaches`

## Componentes a Construir
1. **Lógica de Agregación (`client/src/lib/feedback.ts`)**:
   - `calculateFeedbackAverage`: Promedio general de una evaluación (0-10).
   - `computeDimensionAverages`: Promedios globales por área para un jugador.
   - `groupFeedbackByMonth`: Agrupamiento mensual (`YYYY-MM`).
   - `computeMonthlySummary`: Resumen mensual consolidado con calificaciones agregadas y fortalezas recurrentes.
2. **Componentes del Jugador (`client/src/components/feedback/`)**:
   - `FeedbackMetricsCard.tsx`: Indicadores globales por dimensión.
   - `MonthlyReportCard.tsx`: Reporte de progreso del mes con selector de período.
   - `FeedbackHistoryList.tsx`: Historial de valoraciones y observaciones del coach.
3. **Componente del Coach (`client/src/components/coach/`)**:
   - `FeedbackManager.tsx`: Formulario de calificación por jugador e historial de evaluaciones.
