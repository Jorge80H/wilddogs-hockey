# Bloque A — Modelo de registro e identidad (familia, titular, hijos)

**Fecha:** 2026-06-13
**Estado:** Diseño aprobado, pendiente de plan de implementación
**Stack:** React 18 + Vite + InstantDB (graph DB en cliente) + Wouter + Tailwind/Shadcn

---

## 1. Contexto y problema

Wild Dogs Hockey Club va a "gamificar la experiencia de entrenamiento" mediante varios subsistemas
nuevos en la parte privada del sitio. El trabajo total se descompuso en bloques independientes:

| Bloque | Alcance | Estado |
|---|---|---|
| **A** | Modelo de registro e identidad (padre → varios hijos, roles) | **este spec** |
| B | Biblioteca de contenidos + asignación + gamificación | pendiente |
| C | Evaluación del coach: feedback + informe mensual | pendiente |
| D | Entrenamientos + asistencia + estadística | pendiente |
| E | Pagos y cartera en el perfil del padre | pendiente |

Todo lo demás cuelga del Bloque A, por eso va primero.

### Problema con el modelo actual
- `users` (login por magic code) está en relación **1‑a‑1** con `playerProfiles`: un usuario **es** un jugador.
- Existe un rol `guardian` pero "es igual que player"; los datos del acudiente están **embebidos**
  dentro de `playerProfiles` (`guardianName`, `guardianEmail`, `guardianPhone`…).
- No existe una cuenta de padre que enlace a **varios hijos**.
- La entidad `coaches` **no está enlazada** a `users`, así que un coach no puede iniciar sesión "como coach".

### Decisiones de producto (tomadas en brainstorming)
1. **Menores sin login.** La cuenta es del padre; cambia entre perfiles de hijos (estilo Netflix).
2. **Registro autoservicio + aprobación.** El padre se registra, agrega hijos; cada hijo queda
   `pending` hasta que lo apruebe un admin **o un coach de esa categoría**.
3. **Greenfield.** Los datos actuales son de prueba; no hay plan de migración formal.
4. **Modelo unificado de "titular".** Toda cuenta no-staff administra uno o más perfiles de jugador;
   un adulto (Mayores, 18+) se administra a sí mismo (un solo perfil).
5. **Una cuenta por familia.** Cada hijo pertenece a un solo titular (one‑to‑many). El segundo
   padre/contacto se guarda como dato, sin login propio.
6. **Estado pendiente = papeleo sí, contenido no.** Con el hijo en `pending` la familia puede
   completar datos y subir documentos, pero no ve videos, cartera ni estadísticas.
7. **Selector:** con un solo perfil entra directo; con dos o más se muestra la pantalla de selección.

---

## 2. Roles

- **admin** — control total; aprueba/rechaza jugadores; gestiona cuentas y roles.
- **coach** — entrena, evalúa y asigna contenido (bloques B/C/D); aprueba/rechaza jugadores **de su categoría**.
- **guardian** (titular) — la cuenta familiar de login: un padre con uno o más hijos, o un adulto
  que se administra a sí mismo.
- *(Se elimina `player` como rol de **login**. Un jugador ya no inicia sesión; es un `playerProfiles`
  administrado por un titular.)*

---

## 3. Modelo de datos (InstantDB)

### 3.1 `users` = titular / cuenta de login
Se le agregan los datos de contacto del titular (hoy mal ubicados dentro de `playerProfiles`).

```
users:
  email            string unique indexed   (existe)
  firstName        string?                  (existe)
  lastName         string?                  (existe)
  profileImageUrl  string?                  (existe)
  role             string indexed           (existe)  'admin'|'coach'|'guardian'
  status           string indexed           (existe)  'active'|'inactive'  (ver §5)
  phone            string?                  NUEVO
  documentType     string?                  NUEVO
  documentNumber   string?                  NUEVO
  address          string?                  NUEVO
  createdAt        number                   (existe)
  updatedAt        number                   (existe)
```

**Por qué el contacto del titular vive en `users` y no en una entidad `guardianProfiles` aparte:**
en el modelo unificado el adulto es su propio titular; con una entidad separada tendría que llenar
dos fichas casi iguales. *(Alternativa descartada: `guardianProfiles` 1‑a‑1 — más limpia
conceptualmente pero redundante para el jugador adulto.)*

### 3.2 `playerProfiles` = un hijo/jugador
Conserva todos los campos deportivos, personales y médicos actuales. Cambios:

```
playerProfiles:
  ...campos actuales (documentType, dateOfBirth, gender, category, position,
     jerseyNumber, uniformSize, bloodType, allergies, medicalConditions,
     emergencyContact, emergencyPhone, gamesPlayed, goals, assists, ...)

  status                string indexed   NUEVO  'pending'|'approved'|'rejected'|'inactive'
  relationshipToTitular string           NUEVO  'self'|'hijo'|'hija'|'otro'
  rejectionReason       string?          NUEVO  (motivo visible para la familia si rejected)
  approvedAt            number?          NUEVO

  // Los campos guardian* dejan de representar "el acudiente" (ahora es el titular en users)
  // y pasan a ser CONTACTO SECUNDARIO OPCIONAL (el otro papá/mamá, sin login):
  secondaryContactName     string?   (renombra/repurposa guardianName)
  secondaryContactPhone    string?   (renombra/repurposa guardianPhone)
  secondaryContactRelation string?   (renombra/repurposa guardianRelationship)
```
La aprobación es **por hijo**: `playerProfiles.status` es independiente de `users.status`.

### 3.3 `coaches` = ficha del entrenador
Sin cambios de campos; se agrega el **enlace a `users`** (§3.4) para que el login con rol `coach`
mapee a su ficha. Esto desbloquea los bloques C y D.

### 3.4 Enlaces (links)
- **`titularPlayers`** — `users` (uno) → `playerProfiles` (varios). **Reemplaza** el actual
  `userPlayerProfile` (1‑a‑1). Label directo: `users.players`; reverso: `playerProfiles.titular`.
- **`coachUser`** — `coaches` ↔ `users` (1‑a‑1). NUEVO. Label: `users.coachProfile` / `coaches.user`.
- **`playerApprovedBy`** — `playerProfiles` → `users` (qué staff aprobó). NUEVO.
  Label: `playerProfiles.approvedBy` / `users.approvedPlayers`.
- Se conservan los enlaces existentes de `playerProfiles` a `documents`, `accountsReceivable`,
  `payments`, `playerFeedback`, etc.

---

## 4. Permisos (InstantDB CEL)

### 4.1 Matriz de intención

| Entidad | Titular (guardian) | Coach | Admin |
|---|---|---|---|
| `users` (propia) | ver/editar la suya | ver la suya | ver/editar todas; cambiar rol |
| `playerProfiles` | crear y editar los de **su familia**; **no** cambia `status` | ver los de **su categoría**; editar datos deportivos; **aprobar/rechazar** los de su categoría | todos; aprobar/rechazar cualquiera |
| `documents` | subir/ver los de su familia | ver/revisar los de su categoría | todos |
| `coaches` | ver (público) | ver/editar su ficha | crear/editar/enlazar |

### 4.2 Mecanismo
- Para distinguir rol y categoría se enlaza el `$users` de Instant con la entidad `users`
  (perfil) y se leen vía `auth.ref('$user.<...>.role')`.
- **"Coach aprueba solo su categoría"**: se compara `playerProfiles.category` contra la categoría
  enlazada del coach (`coachUser` → `coaches.category`).
- **Titular no cambia `status`**: la familia puede `update` de datos pero el cambio de `status`
  a `approved/rejected` solo lo permiten coach (de la categoría) o admin. *(En CEL esto se modela
  con `newData.status == data.status` para guardians, y la regla amplia para staff.)*

> El CEL exacto se concreta en el plan de implementación; aquí se fija la intención. Cambios vs.
> permisos actuales: `playerProfiles.update` pasa de `isOwner` a `isTitular || isStaffDeCategoria`;
> `documents` pasa de `view:false` total a scope de familia/categoría.

---

## 5. Flujo de registro, aprobación y estado pendiente

### 5.1 Registro del titular (autoservicio)
1. `/login` → magic code por email (sin cambios en el mecanismo).
2. Primer ingreso → se crea `users` con `role:'guardian'`, `status:'active'`.
   **Cambio respecto a hoy:** hoy crea `role:'player', status:'pending'`. El login del padre no
   requiere aprobación; la aprobación es **por hijo**. Una cuenta sin hijos aprobados simplemente
   no ve contenido.
3. Onboarding del titular: si faltan datos de contacto (`phone`, `documentNumber`…), se piden
   antes de continuar.

### 5.2 Agregar hijos
4. Panel "Mis jugadores" (selector). Vacío al inicio → "Agregar jugador".
5. Formulario del hijo: datos personales, **categoría deseada**, posición, datos médicos, contacto
   de emergencia, contacto secundario. Se crea `playerProfiles` con `status:'pending'` y
   `relationshipToTitular`.
6. Un adulto se agrega a sí mismo: mismo formulario, `relationshipToTitular:'self'`; la UI dice
   "Tus datos" en vez de "Datos del hijo".

### 5.3 Estado pendiente
7. Con el hijo en `pending` la familia **puede**: ver/editar la ficha y **subir documentos**
   (entidad `documents`, ya existe: `id`, `eps`, `medical`, `image_rights`, `other`).
8. La familia **no ve**: videos asignados, cartera activa, estadísticas. Se muestra "En revisión
   por el club" con checklist de documentos faltantes.

### 5.4 Aprobación
9. **Bandeja de aprobación** (admin global; coach filtrada a su categoría): lista de `playerProfiles`
   con `status:'pending'` y sus documentos.
10. El staff confirma/ajusta categoría, revisa documentos y **aprueba** → `status:'approved'`,
    guarda `approvedBy` + `approvedAt`. O **rechaza** con nota → `status:'rejected'` +
    `rejectionReason` (visible para la familia, que corrige y vuelve a `pending`).
11. Al aprobar se desbloquea el contenido de ese hijo (categoría, cartera, estadísticas).

### 5.5 Alta interna de staff
12. Coaches y admins no se autorregistran. Un admin promueve un `users` existente a `coach`/`admin`
    y, para coach, crea/enlaza su ficha `coaches` con su categoría.

### 5.6 Máquina de estados por hijo
```
[crear] → pending ──aprobar──▶ approved ──(baja)──▶ inactive
                  └─rechazar─▶ rejected ──(corrige)──▶ pending
```

---

## 6. Superficies de interfaz (lo que toca el Bloque A)

**Titular (expande/reemplaza `PlayerDashboard.tsx`):**
- **Selector de jugadores** estilo Netflix: tarjeta por hijo + "Agregar jugador". Un solo perfil →
  entra directo; dos o más → muestra selección.
- **Onboarding del titular** (completar contacto) + **formulario de alta de jugador** (reutilizable
  para crear y editar).
- **Vista de un jugador**: cabecera con estado (`pendiente`/`aprobado`/`rechazado` + motivo), ficha
  editable, sección de documentos. Las pestañas de videos/cartera/estadística llegan en B/E/D; aquí
  quedan los **contenedores** vacíos/placeholder.

**Admin (`AdminDashboard.tsx`):**
- **Bandeja de aprobación**: jugadores `pending` con documentos, aprobar/rechazar + ajuste de categoría.
- **Gestión de cuentas**: lista de titulares/usuarios, cambiar rol, enlazar coach a su ficha.

**Coach (`CoachDashboard.tsx`):**
- **Mi categoría**: roster de jugadores aprobados + cola de `pending` de su categoría para aprobar.

### Componentes nuevos sugeridos (cada uno con un propósito claro)
- `PlayerSwitcher` — selector de hijos.
- `TitularOnboardingForm` — datos de contacto del titular.
- `PlayerProfileForm` — alta/edición de un jugador (modo "self" vs "hijo").
- `PlayerStatusBanner` — estado pendiente/rechazado + checklist de documentos.
- `ApprovalQueue` — bandeja de aprobación (admin/coach), reutiliza filtro por categoría.
- `AccountManager` — gestión de usuarios/roles (admin).

---

## 7. Impacto en el código existente

- **`instant.schema.ts`** — campos nuevos en `users` y `playerProfiles`; enlaces `titularPlayers`
  (reemplaza `userPlayerProfile`), `coachUser`, `playerApprovedBy`. Push con `npm run instant:push-schema`.
- **`instant.perms.ts`** — reglas nuevas para `playerProfiles` (titular vs staff de categoría),
  `documents`, `users` (cambio de rol solo admin), `coaches`. Push con `npm run instant:push-perms`.
- **`client/src/pages/Login.tsx`** — cambia el alta del primer ingreso a `role:'guardian'`,
  `status:'active'`.
- **`client/src/hooks/useAuth.ts`** — agrega helpers: `isGuardian`, lista de `players` del titular,
  `coachProfile`. Quita la suposición 1‑login‑1‑jugador.
- **`client/src/pages/PlayerDashboard.tsx`** — se reestructura hacia el selector + vista de jugador.
- **`client/src/pages/AdminDashboard.tsx`** — agrega bandeja de aprobación y gestión de cuentas.
- **`client/src/pages/CoachDashboard.tsx`** — agrega cola de aprobación de su categoría.
- **`App.tsx`** — rutas para vista de jugador seleccionado (p. ej. `/dashboard/:playerId`).

---

## 8. Fuera de alcance (otros bloques)
- Biblioteca/asignación/gamificación de contenidos (Bloque B).
- Feedback continuo + informe mensual (Bloque C).
- Entrenamientos + asistencia + estadística (Bloque D).
- Detalle fino de pagos y cartera (Bloque E) — aquí solo se dejan listos `documents` y los
  contenedores de las pestañas.

## 9. Criterios de éxito
- Un padre se registra, agrega 2 hijos en categorías distintas y los ve en el selector.
- Cada hijo queda `pending`; la familia sube documentos pero no ve contenido.
- Un coach ve en su categoría los `pending`, aprueba uno y lo ve pasar a `approved`.
- Un admin cambia el rol de un `users` a `coach` y lo enlaza a su ficha; ese usuario entra como coach.
- Un adulto (Mayores) se registra y se administra a sí mismo con un solo perfil (`self`), entra directo.
