# Selector de semestre para Resultados y Tabla de Posiciones

## Contexto

`/torneos` muestra, para cada liga (Fedehockey y Fedepatín), tres pestañas: Próximos Partidos, Resultados y Tabla de Posiciones. Hoy "Resultados" mezcla partidos de todos los semestres desde que existe el sync (enero 2026 en adelante) sin separación, y "Tabla de Posiciones" siempre muestra la última foto que escribió n8n — sin ningún filtro ni historial.

El club opera en dos semestres al año por liga (aprox. enero–junio y agosto–diciembre). Se pidió que, por defecto, Resultados y Tabla de Posiciones muestren solo el semestre en curso ("debería estar en ceros" al iniciar uno nuevo), con un selector para consultar semestres anteriores.

## Hallazgo que acota el alcance

`standings` en InstantDB no tiene historial: cada fila se identifica por un UUID determinístico `seedUUID('standing-' + division + '-' + teamName + '-' + liga)`, así que cada sync de n8n **sobreescribe en el sitio** la fila de cada equipo. No existe ningún registro de standings de semestres pasados — se perdieron en cada sobreescritura anterior. Confirmado con el usuario: no se intenta recuperar ese histórico; el selector de standings solo tendrá datos a partir de los semestres que se sincronicen **después** de este cambio.

`matches`, en cambio, sí acumula historial completo (cada partido tiene su propio `gameId` y fecha), así que Resultados sí puede reconstruir semestres pasados retroactivamente.

## Definición de "semestre"

Calendario, igual para las dos ligas, sin depender de cómo cada federación organice sus torneos internamente:

- Meses 1–6 (enero–junio) → `S1`
- Meses 7–12 (julio–diciembre) → `S2`

Formato de etiqueta: `"{año}-S{1|2}"`, ej. `"2026-S2"`. Julio cae en S2 (arranque de pretemporada/inscripciones del segundo semestre); es una convención arbitraria de corte, documentada aquí por si se necesita ajustar.

Función pura, usada tanto en el frontend como replicada en el código embebido de los nodos n8n (no hay forma de compartir un módulo entre n8n y el bundle de Vite, así que se duplica intencionalmente en ambos lugares — 3 líneas, riesgo de divergencia bajo):

```js
function semesterOf(dateMs) {
  const d = new Date(dateMs);
  const half = d.getUTCMonth() < 6 ? 1 : 2; // getUTCMonth() 0-indexado: 0-5=S1, 6-11=S2
  return `${d.getUTCFullYear()}-S${half}`;
}
```

## Cambios de datos

### `matches`
Nuevo campo `semester: string`, calculado desde `date` (la fecha del propio partido). Se agrega:
- **En n8n**: en el nodo "Build InstantDB Transaction" de los dos workflows, al construir cada step `['update', 'matches', uuid, {...}]`.
- **Backfill de los ~157 partidos existentes**: script one-off (`scratch/backfill_match_semester.mjs`) que lee todos los `matches`, calcula `semester` desde `date` y hace `update` in-place (mismo `id`, no cambia UUIDs ni rompe deduplicación existente en el frontend).

### `standings`
Nuevo campo `semester: string`, calculado desde "ahora" (el momento del sync — los standings no tienen fecha propia, representan el estado acumulado a la fecha de la sincronización). Se agrega:
- **En n8n**: mismo nodo, en cada step de `standings`. La clave del `seedUUID` cambia de `division-teamName-liga` a `division-teamName-liga-semester`, para que un cambio de semestre genere una fila **nueva** en vez de sobreescribir la anterior.
- **Migración de las 150 filas actuales**: se borran (no tienen `semester` y su UUID quedaría huérfano en cuanto n8n empiece a escribir con la clave nueva). Inmediatamente después se corre un sync manual de los dos workflows (mismo patrón ya usado para el fix de Fedehockey) para que se regeneren con `semester` ya incluido, sin esperar al cron.

## Frontend (`Tournaments.tsx`)

- Un `<Select>` (shadcn, mismo patrón que ya usan `AttendanceTracker`/`FinanceManager`) por cada liga, ubicado junto al filtro de categorías existente.
- Opciones pobladas dinámicamente: `semestres = Array.from(new Set(matches.map(semesterOf).concat(standings.map(s => s.semester))))`, ordenados descendente. No se hardcodea una lista — crece sola con cada semestre nuevo.
- Valor por defecto: el semestre actual (`semesterOf(Date.now())`), aunque no tenga datos aún (queda vacío/en cero, que es justamente el comportamiento pedido).
- El filtro de semestre se aplica **antes** del filtro de categoría existente, a `fhMatches`/`fhStandings`/`fpMatches`/`fpStandings`, y por tanto afecta a Resultados y Tabla de Posiciones. Próximos Partidos usa los mismos arrays filtrados, pero como ya filtra por `date >= now`, elegir un semestre pasado ahí naturalmente muestra "no hay partidos" — comportamiento correcto, no necesita lógica especial.
- Partidos/standings sin campo `semester` (no debería quedar ninguno tras el backfill + migración, pero por robustez): se excluyen del selector en vez de aparecer bajo un semestre incorrecto.

## Fuera de alcance

- No se reconstruye standings histórico anterior a este cambio (ya confirmado con el usuario).
- No se cambia la lógica de deduplicación de partidos existente en `Tournaments.tsx` (líneas ~488-504), que sigue funcionando igual sobre el array ya filtrado por semestre.
- No se toca `isNotStarted`/`matchCat`/`standCat` ni el fix de status del cambio anterior.

## Testing

- Backfill: correr contra InstantDB de producción, verificar con query que 0 partidos quedan sin `semester`.
- n8n: correr los dos workflows manualmente tras el cambio, verificar en InstantDB que las standings nuevas tienen `semester` y que las 150 filas viejas fueron reemplazadas (no duplicadas).
- Frontend: `npm run check` (type-check) + verificación visual con Playwright contra `localhost` — selector por defecto en semestre actual, Resultados/Tabla vacíos o con datos mínimos ("en ceros"), cambiar el selector a un semestre anterior muestra los partidos de Fedehockey de enero–junio 2026 en Resultados.
- Deploy a producción (Netlify) solo después de validar visualmente en local, igual que el fix anterior.
