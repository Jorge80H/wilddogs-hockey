# Bloque D — Entrenamientos, Asistencia y Estadísticas — Design Spec

**Goal:** Proporcionar herramientas para programar entrenamientos por categoría, registrar asistencia en tiempo real y consolidar estadísticas individuales de partidos (goles, asistencias, penalizaciones, tiros).

## Nuevas Entidades (InstantDB)
- `trainingSessions`:
  - `category`: string indexed
  - `date`: number (timestamp)
  - `startTime`: string
  - `endTime`: string
  - `location`: string
  - `objective`: string
  - `notes`: string (opcional)
  - `createdAt`: number
  - `updatedAt`: number

- `attendance`:
  - `status`: string indexed (`'present'` | `'absent'` | `'excused'` | `'late'`)
  - `notes`: string (opcional)
  - `createdAt`: number
  - `updatedAt`: number

- `playerMatchStats`:
  - `goals`: number
  - `assists`: number
  - `penalties`: number
  - `shots`: number
  - `plusMinus`: number
  - `minutesPlayed`: number
  - `createdAt`: number

## Relaciones
- `sessionCategory`: `trainingSessions` -> `categories`
- `sessionCoach`: `trainingSessions` -> `coaches`
- `attendancePlayer`: `attendance` -> `playerProfiles`
- `attendanceSession`: `attendance` -> `trainingSessions`
- `statPlayer`: `playerMatchStats` -> `playerProfiles`
- `statMatch`: `playerMatchStats` -> `matches`
