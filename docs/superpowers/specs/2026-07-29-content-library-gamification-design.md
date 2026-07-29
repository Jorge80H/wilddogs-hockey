# Bloque B — Biblioteca de contenidos + Ruta de aprendizaje + Gamificación

**Estado:** Diseño aprobado (brainstorming) — pendiente plan de implementación.

## Contexto

Wild Dogs Hockey Club quiere "gamificar la experiencia de entrenamiento". Este es el
**Bloque B** del plan A–E (ver `memory/wilddogs-backend-blocks.md`), el de mayor valor.
Se construye sobre el **Bloque A** (modelo titular→jugadores, ya en producción): los menores
no tienen login; se accede con la cuenta del titular y se elige el perfil del hijo (estilo
Netflix). El progreso y el XP viven en cada `playerProfile`.

El objetivo: que el coach arme una **biblioteca de contenidos** (videos/links/ejercicios) y una
**"ruta de aprendizaje"** ordenada por categoría; que el jugador la recorra resolviendo un
**quiz** por contenido; y que gane **XP, insignias y posición en el ranking** de su categoría.

**Stack:** React 18 + Vite + InstantDB (`@instantdb/react`) + Wouter + Tailwind + Shadcn +
TypeScript strict. Lógica pura testeada con vitest. La fuente de verdad del modelo es
`instant.schema.ts` + `instant.perms.ts` (el `CLAUDE.md` está desactualizado: describe
Drizzle/Postgres, pero el stack real es InstantDB).

## Decisiones de diseño (acordadas en brainstorming)

- **Ruta de 12 = currículo fijo por categoría.** El coach elige contenidos del pool transversal
  y los ordena; todos los jugadores de la categoría recorren esa secuencia. (~12 es orientativo,
  no un límite rígido.)
- **Progreso = quiz por contenido.** El % de comprensión = puntaje del quiz. Aprobación **≥ 70%**.
- **Gamificación = XP + insignias + ranking** por categoría. **Sin rachas.**
- **Desbloqueo secuencial estricto:** el paso N+1 se abre solo al aprobar el N.
- **Enfoque B (estado materializado):** se guarda `xp` en `playerProfile` y las insignias ganadas
  en `playerBadges`; las **definiciones** de insignias y la curva de nivel viven como constantes en
  código (no en DB). El nivel y el ranking se derivan/consultan, no se escriben.
- **Anti-trampa: aceptado el riesgo.** InstantDB es client-side; `quizQuestions.correctIndex` es
  técnicamente visible. Es una app de niños enfocada en aprender, no examen de alto riesgo. Se
  documenta como deuda técnica (igual que las decisiones greenfield del Bloque A). Sin infra extra.
- **Rol en CEL no disponible:** como en el Bloque A, el link a `$users` no funciona, así que las
  reglas de permisos no pueden verificar rol. Escritura = `auth.id != ''`; el rol coach/admin se
  refuerza en la capa de UI/app.

## Modelo de datos

### Entidades nuevas

**`quizQuestions`** — preguntas de un contenido.
- `questionText: string`
- `options: json` — array de 2–4 strings
- `correctIndex: number` — índice de la opción correcta
- `order: number`
- `createdAt: number`
- Link `questionMaterial`: `quizQuestions` (many) → `trainingMaterials` (one), label reverso `questions`.

**`pathSteps`** — un peldaño de la ruta de una categoría (ruta = lista ordenada, 1 por categoría).
- `order: number`
- `createdAt: number`
- Link `stepCategory`: `pathSteps` (many) → `categories` (one), label reverso `pathSteps`.
- Link `stepMaterial`: `pathSteps` (many) → `trainingMaterials` (one), label reverso `pathSteps`.
- Un mismo material puede aparecer en rutas de varias categorías (pool transversal), porque el
  `pathStep` es quien crea la relación ordenada, no el material.

**`materialProgress`** — progreso de un jugador en un contenido.
- `status: string` — `'in_progress' | 'completed'`
- `comprehensionPct: number` — 0–100, mejor puntaje obtenido
- `attempts: number`
- `completedAt: number` (opcional)
- `updatedAt: number`
- Link `progressPlayer`: `materialProgress` (many) → `playerProfiles` (one), label reverso `progress`.
- Link `progressMaterial`: `materialProgress` (many) → `trainingMaterials` (one), label reverso `progress`.

**`playerBadges`** — insignias ganadas (definiciones en código).
- `badgeKey: string` — `'primer_paso' | 'quiz_perfecto' | 'ruta_completa'`
- `earnedAt: number`
- Link `badgePlayer`: `playerBadges` (many) → `playerProfiles` (one), label reverso `badges`.

### Cambios a entidades existentes

- **`playerProfiles`** — agregar `xp: i.number()` (default 0 en creación). El nivel se deriva de `xp`
  en código; el ranking es un query de `playerProfiles` por `category` ordenado por `xp`.
- **`trainingMaterials`** — sin cambios de campos; es la biblioteca. Su link `materialCategory`
  existente queda como "categoría primaria" informativa; la pertenencia real a rutas la maneja
  `pathSteps`.

## Flujos

### Flujo A — Coach arma biblioteca y ruta
1. Crea contenidos en `trainingMaterials` (título, tipo, URL, dificultad) → pool transversal.
2. Escribe el quiz de cada contenido (`quizQuestions`): 2–4 preguntas con su `correctIndex`.
3. Arma la ruta de su categoría: elige contenidos del pool y los ordena (drag & drop). Cada item
   es un `pathStep` con su `order`. Puede reordenar/quitar.

### Flujo B — Jugador recorre la ruta (bajo el perfil del hijo seleccionado)
1. Carrusel de la ruta de su categoría, en orden, con estado por paso (bloqueado / disponible /
   completado + %).
2. Abre un contenido disponible → ve el video/link → hace el quiz.
3. Al enviar: puntaje = aciertos/total × 100. Aprobación ≥ 70%.
   - Aprueba → `materialProgress.status = 'completed'`, guarda `comprehensionPct` (mejor puntaje),
     dispara la transacción de gamificación (Flujo C). Se desbloquea el siguiente paso.
   - No aprueba → queda `in_progress`, `attempts++`, puede reintentar. Se guarda siempre el mejor
     puntaje.

### Flujo C — Transacción de gamificación (solo la PRIMERA vez que un contenido pasa a `completed`)
Una sola escritura ordenada:
1. Suma XP a `playerProfiles.xp`: **base 10 XP** por aprobar + **bono 5 XP** si fue 100%.
2. Evalúa e inserta `playerBadges` nuevas:
   - `primer_paso` — primer contenido completado.
   - `quiz_perfecto` — primer quiz con 100%.
   - `ruta_completa` — completó todos los pasos de la ruta de su categoría.
3. Nivel y ranking no se escriben (se derivan/consultan).

**Idempotencia:** la gamificación solo dispara en la transición inicial a `completed`. Reintentos o
re-aprobaciones nunca duplican XP ni insignias.

### Flujo D — Coach ve progreso
Dashboard de su categoría: jugadores con % de ruta (pasos completados / total de la ruta), XP,
nivel e insignias; resalta a quién le falta.

## Estructura de archivos

### Lógica pura (testeable, sin React) — `client/src/lib/`
- `gamification.ts` — `computeQuizScore(answers, questions)`, `xpForQuizPass(score)`,
  `levelForXp(xp)`, `evaluateNewBadges(playerState)`, constante `BADGE_DEFINITIONS`.
- `learningPath.ts` — `pathProgressPct(steps, progress)`, `unlockedStepIndex(steps, progress)`
  (regla secuencial estricta), `stepStatus(step, progress)`.
- `quizSchema.ts` / `materialSchema.ts` — esquemas Zod para crear/editar contenidos y quizzes.

### Hooks — `client/src/hooks/`
- `usePlayerPath.ts` — dado un `playerProfile`, trae la ruta de su categoría + su `materialProgress`
  y arma el carrusel con estados.
- `useCoachLibrary.ts` — pool de biblioteca + ruta de la categoría del coach + progreso de sus
  jugadores.

### Componentes del jugador — `client/src/components/learning/`
- `PathCarousel.tsx` — carrusel de la ruta (tarjetas con estado + %).
- `ContentViewer.tsx` — embed del contenido + botón "Hacer quiz".
- `QuizRunner.tsx` — corre el quiz, calcula puntaje, dispara la transacción de completar/gamificación.
- `PlayerProgressHeader.tsx` — XP, nivel, insignias del jugador.
- `Leaderboard.tsx` — ranking de la categoría.

### Componentes del coach — `client/src/components/coach/`
- `LibraryManager.tsx` — CRUD de contenidos.
- `QuizEditor.tsx` — editor de preguntas de un contenido.
- `PathBuilder.tsx` — armar/ordenar la ruta (drag & drop) desde el pool.
- `CategoryProgressDashboard.tsx` — tabla de progreso de jugadores.

### Integración en páginas existentes
- `PlayerDashboard.tsx` — dentro de la vista del hijo (donde el Bloque A dejó el placeholder de
  "contenido bloqueado/desbloqueado"): `PlayerProgressHeader` + `PathCarousel` →
  `ContentViewer`/`QuizRunner` + `Leaderboard`.
- `CoachDashboard.tsx` — nuevas pestañas: "Biblioteca", "Ruta", "Progreso".

## Permisos (`instant.perms.ts`)

Escritura = `auth.id != ''` (rol reforzado en app). Patrón "familia" (bind) reutilizado del Bloque A
para datos del jugador.

- `trainingMaterials` — sin cambios (`view: true`, escritura `auth.id != ''`).
- `pathSteps` — `view: "true"`; create/update/delete: `auth.id != ''`.
- `quizQuestions` — `view: "true"` (riesgo anti-trampa aceptado); create/update/delete: `auth.id != ''`.
- `materialProgress` — `view: "isFamily || auth.id != ''"`, create/update: `auth.id != ''`;
  bind `isFamily = auth.id in data.ref('player.titular.id')`.
- `playerBadges` — mismo patrón familia que `materialProgress`.
- `playerProfiles` — ya permite update `isTitular || auth.id != ''` (cubre escribir `xp`).

## Pruebas

### Unitarias (vitest) — núcleo de valor
`gamification.test.ts`:
- `computeQuizScore` — %, casos borde (0, todas correctas, parciales).
- `xpForQuizPass` — base 10, bono +5 si 100%.
- `levelForXp` — umbrales (curva simple: cada 50 XP = 1 nivel).
- `evaluateNewBadges` — otorga cada insignia en su condición y **no** re-otorga las ya ganadas.

`learningPath.test.ts`:
- `unlockedStepIndex` — secuencial estricto (solo el siguiente al último completado).
- `pathProgressPct` — completados/total.
- `stepStatus` — bloqueado/disponible/completado.

### E2E manual (checklist)
1. Coach crea 3 contenidos + quizzes y arma la ruta ordenada.
2. Bajo el perfil del hijo: solo el paso 1 disponible; 2 y 3 bloqueados.
3. Quiz del paso 1 con < 70% → sigue `in_progress`, reintento disponible, sin XP.
4. Aprobar paso 1 con 100% → +15 XP, insignias `primer_paso` y `quiz_perfecto`, se desbloquea el paso 2.
5. Completar los 3 → insignia `ruta_completa`, % de ruta = 100%.
6. Reintentar un paso aprobado → **no** duplica XP.
7. Ranking de la categoría muestra al jugador con su XP.
8. Dashboard del coach refleja el progreso.

## Deuda técnica documentada
- `quizQuestions.correctIndex` visible en cliente (sin servidor de calificación ni rol en CEL).
  Aceptado por bajo riesgo; reforzar con calificación vía n8n si en el futuro sube la exigencia.
- Permisos sin verificación de rol (heredado del Bloque A): rol reforzado solo en UI/app.
