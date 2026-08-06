# Memoria del Proyecto (memory.md)

Este archivo sirve como la memoria a largo plazo para los asistentes de Inteligencia Artificial (Claude, Gemini, Antigravity, etc.) que trabajen en este repositorio.

## Estado de la Hoja de Ruta (Roadmap por Bloques)

- [x] **Bloque A:** Modelo de registro e identidad (titulares, perfiles de hijos, vinculación familiar, roles `guardian`/`player`/`coach`/`admin`, bandeja de aprobación y carga de documentos).
- [x] **Bloque B:** Biblioteca de contenidos didácticos, ruta de aprendizaje por categoría y sistema de gamificación (XP, niveles, insignias `primer_paso`, `quiz_perfecto`, `ruta_completa`, quizzes idempotentes, `Leaderboard` y `PathBuilder`).
- [x] **Bloque C:** Feedback continuo e informe mensual de evaluaciones (evaluación en 4 dimensiones: Técnica, Táctica, Física y Actitud; promedio global e histórico, informes mensuales consolidados y `FeedbackManager` para entrenadores).
- [ ] **Bloque D:** Entrenamientos, control de asistencia en tiempo real y estadísticas detalladas de partidos.
- [ ] **Bloque E:** Detalle fino de pagos, cartera, comprobantes y facturación.

---

## Aprendizajes y Mejoras Históricas

- **2026-03-18:** Se integró exitosamente la metadata de torneos proveniente de la base de datos de Supabase de Fede Patin, creando un workflow programado con `n8n` para traer los partidos donde participa "WILD DOGS" y sincronizarlos con InstantDB usando IDs consistentes y evitando colisiones.
- **2026-07-24:** Se finalizó la alianza con Condors. Se actualizó la página de Torneos (`Tournaments.tsx`) eliminando el badge "Jugamos como: Condors" y la etiqueta "(Condors)" en el nombre de despliegue de Fedepatín ("Optima Wild Dogs").
- **2026-08-05 (Bloque B):** Finalizado el Bloque B (Biblioteca + Ruta + Gamificación). Se definieron entidades (`quizQuestions`, `pathSteps`, `materialProgress`, `playerBadges`), `xp` acumulado, niveles (cada 50 XP) e insignias con transacciones idempotentes en InstantDB. Componentes `QuizRunner`, `PathCarousel`, `Leaderboard`, `LibraryManager`, `PathBuilder` y `CategoryProgressDashboard`. Cobertura de tests unitarios a 56 pruebas pasadas.
- **2026-08-05 (Bloque C):** Finalizado el Bloque C (Feedback Continuo + Informe Mensual). Lógica pura en `client/src/lib/feedback.ts` para agregación de 4 dimensiones (Técnica, Táctica, Física, Actitud), promedios e informes mensuales. Componentes `FeedbackMetricsCard`, `MonthlyReportCard`, `FeedbackHistoryList` en `PlayerDashboard` y `FeedbackManager` en `CoachDashboard`. Cobertura total a 63 tests unitarios pasados.
