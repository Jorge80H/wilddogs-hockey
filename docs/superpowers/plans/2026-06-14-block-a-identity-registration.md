# Bloque A — Modelo de registro e identidad — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestructurar la identidad del club: una cuenta-titular (padre o adulto) que administra uno o más perfiles de jugador, con registro autoservicio y aprobación por hijo (admin o coach de la categoría).

**Architecture:** InstantDB (graph DB en cliente). `users` pasa a ser la cuenta-titular con datos de contacto; `playerProfiles` gana `status` + `relationshipToTitular` y se enlaza al titular por un link one-to-many (`titularPlayers`) que reemplaza el 1-a-1 actual. Se agrega enlace `coachUser` (coach↔users). La lógica pura (transiciones de estado, autorización por categoría, validación de formularios) se extrae a helpers en `client/src/lib` y se prueba con vitest; el esquema, permisos y UI se verifican con `npm run check` y ejecución manual.

**Tech Stack:** React 18, TypeScript, Vite, InstantDB (`@instantdb/react`), Wouter, Tailwind + Shadcn UI, Zod, vitest (nuevo).

**Spec de referencia:** `docs/superpowers/specs/2026-06-13-identity-registration-model-design.md`

**⚠️ Acciones contra el InstantDB en vivo:** los comandos `npx instant-cli push schema` / `push perms` modifican la app real de InstantDB. El proyecto es greenfield (datos de prueba), así que es seguro, pero esos pushes están marcados como pasos explícitos para correr **cuando el ejecutor esté listo**, no automáticamente.

---

## Verificación: línea base de TypeScript (LEER ANTES DE EMPEZAR)

`npm run check` (= `tsc`) **ya falla hoy con errores preexistentes** en código muerto/no tocado por
este plan (restos de la arquitectura Drizzle/Express previa, más dos archivos del cliente que no
modificamos). Por eso **NO uses "Expected: PASS" global**. El gate de tipos del plan es:

> **TYPECHECK ESTÁNDAR DEL CLIENTE** (esto es lo que significa "type-check del cliente" en cada task):
> ```bash
> npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
> ```
> **Expected: SIN salida.** Cualquier línea que aparezca es un error **nuevo** en código que tú
> tocaste y hay que corregirlo antes de commitear.

Fuentes preexistentes filtradas (NO las toca ninguna task de este plan): `shared/schema.ts`,
`server/**`, `client/src/hooks/useInstantAuth.ts`, `client/src/pages/Tournaments.tsx`.

**`instant.schema.ts` e `instant.perms.ts` NO están en el `tsconfig` (viven en la raíz),** así que
`tsc` no los valida. Su validación real es el **push** (Task 6): el `instant-cli` parsea y verifica
el esquema/CEL al subirlo. Antes del push, basta revisión visual.

---

## File Structure

**Nuevos:**
- `vitest.config.ts` — config de tests.
- `client/src/lib/players.ts` — helpers puros de identidad/estado/autorización.
- `client/src/lib/players.test.ts` — tests de `players.ts`.
- `client/src/lib/playerSchema.ts` — esquemas Zod (titular y jugador).
- `client/src/lib/playerSchema.test.ts` — tests de validación.
- `client/src/hooks/useFamily.ts` — hook: titular + sus jugadores para la cuenta actual.
- `client/src/components/family/PlayerSwitcher.tsx` — selector estilo Netflix.
- `client/src/components/family/TitularOnboardingForm.tsx` — datos de contacto del titular.
- `client/src/components/family/PlayerProfileForm.tsx` — alta/edición de jugador (modo self/hijo).
- `client/src/components/family/PlayerStatusBanner.tsx` — estado pendiente/rechazado + checklist docs.
- `client/src/components/admin/ApprovalQueue.tsx` — bandeja de aprobación (admin/coach).
- `client/src/components/admin/AccountManager.tsx` — gestión de usuarios/roles (admin).

**Modificados:**
- `instant.schema.ts` — campos nuevos + links.
- `instant.perms.ts` — reglas nuevas.
- `package.json` — script `test` y devDep `vitest`.
- `client/src/hooks/useAuth.ts` — `isGuardian`, `players`, `coachProfile`.
- `client/src/pages/Login.tsx` — alta de primer ingreso `role:'guardian', status:'active'`.
- `client/src/pages/PlayerDashboard.tsx` — pasa a panel de familia (selector + vista de jugador).
- `client/src/pages/AdminDashboard.tsx` — tabs de aprobación + cuentas.
- `client/src/pages/CoachDashboard.tsx` — cola de aprobación de su categoría.
- `client/src/App.tsx` — ruta `/dashboard/:playerId`.

---

## Task 1: Configurar vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Instalar vitest**

Run:
```bash
npm install -D vitest
```
Expected: `vitest` aparece en `devDependencies`, sin errores de peer deps.

- [ ] **Step 2: Crear `vitest.config.ts`**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["client/src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Agregar script de test en `package.json`**

En `package.json`, dentro de `"scripts"`, agregar después de `"check": "tsc"`:
```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 4: Smoke test del runner**

Create temporary `client/src/lib/_smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
describe("smoke", () => {
  it("runs", () => { expect(1 + 1).toBe(2); });
});
```
Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 5: Borrar el smoke y commitear**

```bash
rm client/src/lib/_smoke.test.ts
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: configurar vitest para lógica pura"
```

---

## Task 2: Helpers puros de identidad y autorización (`players.ts`)

Lógica que las pantallas reusarán: etiquetas de relación, transiciones de estado válidas, si un perfil ve contenido, y si un coach puede aprobar a un jugador. TDD.

**Files:**
- Create: `client/src/lib/players.ts`
- Test: `client/src/lib/players.test.ts`

- [ ] **Step 1: Escribir el test (falla)**

Create `client/src/lib/players.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  type PlayerStatus,
  canTransition,
  canViewContent,
  relationshipLabel,
  playerDisplayName,
  coachCanApprove,
} from "./players";

describe("canTransition", () => {
  it("pending → approved es válido", () => {
    expect(canTransition("pending", "approved")).toBe(true);
  });
  it("pending → rejected es válido", () => {
    expect(canTransition("pending", "rejected")).toBe(true);
  });
  it("rejected → pending es válido (familia corrige)", () => {
    expect(canTransition("rejected", "pending")).toBe(true);
  });
  it("approved → inactive es válido", () => {
    expect(canTransition("approved", "inactive")).toBe(true);
  });
  it("approved → pending NO es válido", () => {
    expect(canTransition("approved", "pending")).toBe(false);
  });
});

describe("canViewContent", () => {
  it("solo aprobado ve contenido", () => {
    expect(canViewContent("approved")).toBe(true);
    (["pending", "rejected", "inactive"] as PlayerStatus[]).forEach((s) =>
      expect(canViewContent(s)).toBe(false)
    );
  });
});

describe("relationshipLabel", () => {
  it("self se muestra como 'Tú'", () => {
    expect(relationshipLabel("self")).toBe("Tú");
  });
  it("hijo/hija se muestran capitalizados", () => {
    expect(relationshipLabel("hijo")).toBe("Hijo");
    expect(relationshipLabel("hija")).toBe("Hija");
  });
  it("desconocido cae a 'Jugador'", () => {
    expect(relationshipLabel("otro")).toBe("Otro");
    expect(relationshipLabel(undefined)).toBe("Jugador");
  });
});

describe("playerDisplayName", () => {
  it("usa firstName + lastName del perfil", () => {
    expect(playerDisplayName({ firstName: "Ana", lastName: "Ruiz" })).toBe("Ana Ruiz");
  });
  it("cae a 'Jugador sin nombre' si vacío", () => {
    expect(playerDisplayName({})).toBe("Jugador sin nombre");
  });
});

describe("coachCanApprove", () => {
  it("coach aprueba jugador de su categoría", () => {
    expect(coachCanApprove("sub12", "sub12")).toBe(true);
  });
  it("coach NO aprueba jugador de otra categoría", () => {
    expect(coachCanApprove("sub12", "sub14")).toBe(false);
  });
  it("sin categoría de coach, no aprueba", () => {
    expect(coachCanApprove(undefined, "sub12")).toBe(false);
  });
});
```

- [ ] **Step 2: Correr el test (debe fallar)**

Run: `npm test`
Expected: FAIL — `Cannot find module './players'`.

- [ ] **Step 3: Implementar `players.ts`**

Create `client/src/lib/players.ts`:
```ts
export type PlayerStatus = "pending" | "approved" | "rejected" | "inactive";
export type Relationship = "self" | "hijo" | "hija" | "otro";

const TRANSITIONS: Record<PlayerStatus, PlayerStatus[]> = {
  pending: ["approved", "rejected"],
  rejected: ["pending"],
  approved: ["inactive"],
  inactive: ["approved"],
};

export function canTransition(from: PlayerStatus, to: PlayerStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function canViewContent(status: PlayerStatus): boolean {
  return status === "approved";
}

const REL_LABELS: Record<string, string> = {
  self: "Tú",
  hijo: "Hijo",
  hija: "Hija",
  otro: "Otro",
};

export function relationshipLabel(rel: string | undefined): string {
  if (!rel) return "Jugador";
  return REL_LABELS[rel] ?? "Jugador";
}

export function playerDisplayName(p: { firstName?: string; lastName?: string }): string {
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return name || "Jugador sin nombre";
}

export function coachCanApprove(
  coachCategory: string | undefined,
  playerCategory: string | undefined
): boolean {
  if (!coachCategory || !playerCategory) return false;
  return coachCategory === playerCategory;
}
```

> Nota: `playerProfiles` no tiene `firstName/lastName` hoy (el nombre viene del `users` en el modelo viejo). La Task 4 los agrega al esquema del jugador (un hijo no tiene `users` propio, así que el nombre debe vivir en el perfil).

- [ ] **Step 4: Correr el test (debe pasar)**

Run: `npm test`
Expected: PASS — todos los `describe` en verde.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/players.ts client/src/lib/players.test.ts
git commit -m "feat: helpers puros de identidad y autorización de jugador"
```

---

## Task 3: Esquemas Zod de titular y jugador (`playerSchema.ts`)

Validación de formularios, testeable sin UI.

**Files:**
- Create: `client/src/lib/playerSchema.ts`
- Test: `client/src/lib/playerSchema.test.ts`

- [ ] **Step 1: Escribir el test (falla)**

Create `client/src/lib/playerSchema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { titularSchema, playerProfileSchema, CATEGORIES } from "./playerSchema";

describe("titularSchema", () => {
  it("acepta un titular completo", () => {
    const r = titularSchema.safeParse({
      firstName: "Carlos", lastName: "Pérez",
      phone: "3001234567", documentType: "CC", documentNumber: "123",
      address: "Calle 1",
    });
    expect(r.success).toBe(true);
  });
  it("rechaza si falta nombre", () => {
    const r = titularSchema.safeParse({ firstName: "", lastName: "Pérez", phone: "3001234567" });
    expect(r.success).toBe(false);
  });
});

describe("playerProfileSchema", () => {
  const base = {
    firstName: "Ana", lastName: "Ruiz",
    relationshipToTitular: "hija" as const,
    category: "sub12" as const,
    dateOfBirth: "2014-05-01",
  };
  it("acepta un jugador válido", () => {
    expect(playerProfileSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza categoría inválida", () => {
    const r = playerProfileSchema.safeParse({ ...base, category: "sub99" });
    expect(r.success).toBe(false);
  });
  it("rechaza relación inválida", () => {
    const r = playerProfileSchema.safeParse({ ...base, relationshipToTitular: "primo" });
    expect(r.success).toBe(false);
  });
  it("CATEGORIES expone las 6 categorías del club", () => {
    expect(CATEGORIES).toEqual(["sub8", "sub12", "sub14", "sub16", "sub18", "mayores"]);
  });
});
```

- [ ] **Step 2: Correr el test (debe fallar)**

Run: `npm test`
Expected: FAIL — `Cannot find module './playerSchema'`.

- [ ] **Step 3: Implementar `playerSchema.ts`**

Create `client/src/lib/playerSchema.ts`:
```ts
import { z } from "zod";

export const CATEGORIES = ["sub8", "sub12", "sub14", "sub16", "sub18", "mayores"] as const;
export const RELATIONSHIPS = ["self", "hijo", "hija", "otro"] as const;

export const titularSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().min(7, "Teléfono requerido"),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  address: z.string().optional(),
});
export type TitularInput = z.infer<typeof titularSchema>;

export const playerProfileSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  relationshipToTitular: z.enum(RELATIONSHIPS),
  category: z.enum(CATEGORIES),
  dateOfBirth: z.string().min(1, "Fecha de nacimiento requerida"),
  gender: z.string().optional(),
  position: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  secondaryContactName: z.string().optional(),
  secondaryContactPhone: z.string().optional(),
  secondaryContactRelation: z.string().optional(),
});
export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;
```

- [ ] **Step 4: Correr el test (debe pasar)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/playerSchema.ts client/src/lib/playerSchema.test.ts
git commit -m "feat: esquemas Zod de titular y perfil de jugador"
```

---

## Task 4: Esquema InstantDB — campos y enlaces nuevos

**Files:**
- Modify: `instant.schema.ts`

- [ ] **Step 1: Agregar campos de contacto al titular en `users`**

En `instant.schema.ts`, dentro de `users: i.entity({ ... })`, agregar antes de `createdAt`:
```ts
      phone: i.string().optional(),
      documentType: i.string().optional(),
      documentNumber: i.string().optional(),
      address: i.string().optional(),
```

- [ ] **Step 2: Agregar nombre, estado y relación a `playerProfiles`**

En `playerProfiles: i.entity({ ... })`:
1. Agregar al inicio (después de la apertura), el nombre del jugador (un hijo no tiene `users` propio):
```ts
      firstName: i.string().optional(),
      lastName: i.string().optional(),
```
2. Renombrar los campos `guardianName`, `guardianRelationship`, `guardianPhone` a contacto secundario, y eliminar `guardianDocument` y `guardianEmail` (el correo ahora es el del titular). El bloque "Guardian info (for minors)" queda así:
```ts
      // Secondary contact (the other parent/contact, no login)
      secondaryContactName: i.string().optional(),
      secondaryContactRelation: i.string().optional(),
      secondaryContactPhone: i.string().optional(),
```
3. Agregar antes de `createdAt`:
```ts
      // status: 'pending' | 'approved' | 'rejected' | 'inactive'
      status: i.string().indexed(),
      // relationshipToTitular: 'self' | 'hijo' | 'hija' | 'otro'
      relationshipToTitular: i.string().optional(),
      rejectionReason: i.string().optional(),
      approvedAt: i.number().optional(),
```

- [ ] **Step 3: Reemplazar el enlace 1-a-1 por el one-to-many titular→jugadores**

En el objeto de relaciones, **reemplazar** todo el bloque `userPlayerProfile: { ... }` por:
```ts
    // users (titular) <-> playerProfiles (one-to-many)
    titularPlayers: {
      forward: {
        on: "users",
        has: "many",
        label: "players",
      },
      reverse: {
        on: "playerProfiles",
        has: "one",
        label: "titular",
      },
    },
```

- [ ] **Step 4: Agregar enlace coach↔users y aprobador**

En el mismo objeto de relaciones, agregar:
```ts
    // coaches <-> users (one-to-one): login de coach mapea a su ficha
    coachUser: {
      forward: {
        on: "coaches",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "one",
        label: "coachProfile",
      },
    },

    // playerProfiles -> users (staff que aprobó)
    playerApprovedBy: {
      forward: {
        on: "playerProfiles",
        has: "one",
        label: "approvedBy",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "approvedPlayers",
      },
    },
```

- [ ] **Step 5: Revisión + type-check del cliente**

`tsc` NO valida `instant.schema.ts` (está fuera del `tsconfig`; se valida en el push, Task 6).
Aquí: (a) revisa visualmente que el bloque `userPlayerProfile` ya no exista y que `titularPlayers`,
`coachUser` y `playerApprovedBy` estén bien formados; (b) confirma que el cliente sigue limpio con el
TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida. (El cliente usa `db` sin tipado de esquema, así que los cambios de campos no
rompen tipos del cliente.)

- [ ] **Step 6: Commit**

```bash
git add instant.schema.ts
git commit -m "feat(schema): titular con contacto, status/relación/nombre en jugador, links titularPlayers/coachUser/approvedBy"
```

> El push a InstantDB se hace en la Task 6 (junto con permisos), tras verificar el código.

---

## Task 5: Permisos InstantDB

**Files:**
- Modify: `instant.perms.ts`

- [ ] **Step 1: Reescribir la regla de `playerProfiles`**

En `instant.perms.ts`, reemplazar todo el bloque `playerProfiles: { ... }` por:
```ts
  // ============================================
  // PLAYER PROFILES
  // ============================================
  playerProfiles: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      // El titular edita los suyos pero NO cambia status; staff sí.
      update: "isTitular || isStaff",
      delete: "isStaff",
    },
    bind: [
      "isTitular", "auth.id in data.ref('titular.id')",
      "isStaff", "auth.ref('$user.profile.role') in ['admin', 'coach']",
    ],
  },
```

> Nota de implementación: que el titular no pueda cambiar `status` se refuerza también en la UI (no se le muestra el control) y, si se quiere endurecer en CEL, con una regla que compare `newData.status == data.status` para el caso `isTitular`. Para enlazar `$user.profile`, ver Step 4.

- [ ] **Step 2: Abrir `documents` con scope de familia/staff**

Reemplazar el bloque `documents: { ... }` por:
```ts
  documents: {
    allow: {
      view: "isFamily || isStaff",
      create: "auth.id != ''",
      update: "isStaff",
      delete: "isFamily || isStaff",
    },
    bind: [
      "isFamily", "auth.id in data.ref('playerProfile.titular.id')",
      "isStaff", "auth.ref('$user.profile.role') in ['admin', 'coach']",
    ],
  },
```

- [ ] **Step 3: Restringir cambio de rol en `users` a admin**

Reemplazar el bloque `users: { ... }` por:
```ts
  users: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      // Cada quien edita su cuenta; el admin edita cualquiera (incluido el rol).
      update: "auth.id == data.id || isAdmin",
      delete: "false",
    },
    bind: ["isAdmin", "auth.ref('$user.profile.role') == 'admin'"],
  },
```

- [ ] **Step 4: Enlazar `$user` (auth de Instant) con el perfil `users`**

Para que `auth.ref('$user.profile.role')` funcione, el sistema `$users` de InstantDB debe enlazar con la entidad `users`. Agregar en `instant.schema.ts` (objeto de relaciones) y volver a type-check:
```ts
    // $users (sistema de auth de Instant) <-> users (perfil de la app)
    userProfile: {
      forward: {
        on: "$users",
        has: "one",
        label: "profile",
      },
      reverse: {
        on: "users",
        has: "one",
        label: "$user",
      },
    },
```
Run el TYPECHECK ESTÁNDAR DEL CLIENTE (los archivos `instant.*` se validan en el push, no aquí):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida.

> Importante: este enlace requiere que, al crear el `users` en el login, se enlace con `$user`. La Task 7 lo hace (`tx.users[id].link({ $user: authUser.id })`).

- [ ] **Step 5: Commit**

```bash
git add instant.perms.ts instant.schema.ts
git commit -m "feat(perms): scope titular/staff en perfiles y documentos, rol solo admin, link $user-profile"
```

---

## Task 6: Push de esquema y permisos a InstantDB

**⚠️ Acción contra la app en vivo. Greenfield (datos de prueba), seguro. Correr cuando el ejecutor esté listo.**

**Files:** ninguno (operación de CLI)

- [ ] **Step 1: Push del esquema**

Run: `npm run instant:push-schema`
Expected: el CLI lista los cambios (campos nuevos, links nuevos, link `userPlayerProfile` eliminado) y confirma. Aceptar. Si advierte que se borrará el link viejo o datos de prueba, es esperado.

- [ ] **Step 2: Push de permisos**

Run: `npm run instant:push-perms`
Expected: confirma las reglas nuevas sin error de sintaxis CEL. Si hay error de CEL (p. ej. `auth.ref` no resuelve `$user.profile`), revisar que el link `userProfile` (Task 5 Step 4) se haya pusheado en el Step 1.

- [ ] **Step 3: Verificación manual mínima**

Run: `npm run dev` y abrir la app. En la consola del navegador no debe haber errores de permisos al cargar el dashboard. (La verificación funcional completa es la Task 14.)

No hay commit (operación remota).

---

## Task 7: Login crea titular activo y enlaza `$user`

**Files:**
- Modify: `client/src/pages/Login.tsx:54-64`

- [ ] **Step 1: Cambiar el alta del primer ingreso**

En `client/src/pages/Login.tsx`, reemplazar el bloque `if (!existingUsers?.users || existingUsers.users.length === 0) { ... }` por:
```ts
      // If user doesn't exist, create their titular (guardian) account
      if (!existingUsers?.users || existingUsers.users.length === 0) {
        await db.transact([
          db.tx.users[result.user.id].update({
            email: email,
            role: "guardian", // cuenta-titular (padre o adulto)
            status: "active",  // el login no requiere aprobación; la aprobación es por hijo
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
          // Enlaza el perfil con el $user de auth para permisos basados en rol
          db.tx.users[result.user.id].link({ $user: result.user.id }),
        ]);
      }
```

- [ ] **Step 2: Type-check**

Run el TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida (sin errores nuevos en `Login.tsx`).

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Login.tsx
git commit -m "feat(auth): primer ingreso crea titular activo y enlaza \$user"
```

---

## Task 8: `useAuth` expone titular, jugadores y coachProfile

**Files:**
- Modify: `client/src/hooks/useAuth.ts`

- [ ] **Step 1: Extender la query y el retorno**

En `client/src/hooks/useAuth.ts`, en la query de `users`, traer también los jugadores y la ficha de coach. Reemplazar el bloque `db.useQuery(instantUser ? { users: { $: { where: { id: instantUser.id } } } } : null)` por:
```ts
  const { data, isLoading: dataLoading } = db.useQuery(
    instantUser
      ? {
          users: {
            $: { where: { id: instantUser.id } },
            players: {},
            coachProfile: { category: {} },
          },
        }
      : null
  );
```

- [ ] **Step 2: Actualizar tipos y retorno**

Reemplazar el `interface User { ... }` para que `role` admita los cuatro roles y agregar relaciones:
```ts
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
  role: "admin" | "coach" | "guardian";
  status: "active" | "inactive";
  players?: any[];
  coachProfile?: any[];
  createdAt: number;
  updatedAt: number;
}
```
Y en el `return`, reemplazar/añadir flags:
```ts
  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!instantUser && !!user,
    isAdmin: user?.role === "admin",
    isCoach: user?.role === "coach",
    isGuardian: user?.role === "guardian",
    players: (user?.players || []) as any[],
    coachProfile: (user?.coachProfile?.[0] || null) as any,
  };
```
(Eliminar la línea `isPlayer: user?.role === "player",`. Conservar `isGuardian` —ahora es el rol real
del titular— y el comentario de cabecera que mencionaba `isPlayer`.)

- [ ] **Step 3: Type-check**

`isPlayer` no tiene consumidores hoy (solo se define en `useAuth.ts`), así que quitarlo no rompe nada.
Run el TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/useAuth.ts
git commit -m "feat(auth): useAuth expone players y coachProfile del titular"
```

---

## Task 9: Hook `useFamily`

Devuelve el titular actual y sus jugadores, con utilidades para seleccionar uno.

**Files:**
- Create: `client/src/hooks/useFamily.ts`

- [ ] **Step 1: Implementar el hook**

Create `client/src/hooks/useFamily.ts`:
```ts
import { db } from "@/lib/instant";

/**
 * useFamily — devuelve la cuenta-titular actual y sus jugadores.
 * Los jugadores incluyen sus documentos para el banner de estado.
 */
export function useFamily() {
  const { user: authUser, isLoading: authLoading } = db.useAuth();

  const { data, isLoading: dataLoading } = db.useQuery(
    authUser
      ? {
          users: {
            $: { where: { id: authUser.id } },
            players: { documents: {} },
          },
        }
      : null
  );

  const titular = (data?.users?.[0] || null) as any;
  const players = (titular?.players || []) as any[];

  return {
    authUser,
    titular,
    players,
    isLoading: authLoading || (!!authUser && dataLoading),
    // El titular necesita completar contacto si le falta teléfono o nombre.
    needsOnboarding: !!titular && (!titular.phone || !titular.firstName),
  };
}
```

- [ ] **Step 2: Type-check**

Run el TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida (sin errores nuevos en `useFamily.ts`).

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/useFamily.ts
git commit -m "feat: hook useFamily (titular + jugadores de la cuenta)"
```

---

## Task 10: Componentes de familia (titular)

Cuatro componentes presentacionales/funcionales. Cada uno con una responsabilidad.

**Files:**
- Create: `client/src/components/family/TitularOnboardingForm.tsx`
- Create: `client/src/components/family/PlayerProfileForm.tsx`
- Create: `client/src/components/family/PlayerStatusBanner.tsx`
- Create: `client/src/components/family/PlayerSwitcher.tsx`

- [ ] **Step 1: `TitularOnboardingForm.tsx`**

Create `client/src/components/family/TitularOnboardingForm.tsx`:
```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { titularSchema } from "@/lib/playerSchema";

export function TitularOnboardingForm({ titular, onDone }: { titular: any; onDone?: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: titular?.firstName || "",
    lastName: titular?.lastName || "",
    phone: titular?.phone || "",
    documentType: titular?.documentType || "CC",
    documentNumber: titular?.documentNumber || "",
    address: titular?.address || "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const parsed = titularSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Revisa los datos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    await db.transact([
      db.tx.users[titular.id].update({ ...parsed.data, updatedAt: Date.now() }),
    ]);
    toast({ title: "✅ Datos guardados" });
    onDone?.();
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Completa tus datos de contacto</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Nombre</Label><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
          <div><Label>Apellido</Label><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
          <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><Label>Documento</Label><Input value={form.documentNumber} onChange={(e) => set("documentNumber", e.target.value)} /></div>
          <div className="col-span-2"><Label>Dirección</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
        </div>
        <Button onClick={save} className="w-full">Guardar</Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: `PlayerProfileForm.tsx`**

Create `client/src/components/family/PlayerProfileForm.tsx`:
```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { playerProfileSchema, CATEGORIES } from "@/lib/playerSchema";

const CATEGORY_LABELS: Record<string, string> = {
  sub8: "Sub 8", sub12: "Sub 12", sub14: "Sub 14", sub16: "Sub 16", sub18: "Sub 18", mayores: "Mayores",
};

/** Crea o edita un jugador. La relación 'self' (en el dropdown) => el adulto se administra a sí mismo. */
export function PlayerProfileForm({
  titularId, existing, onDone,
}: { titularId: string; existing?: any; onDone?: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: existing?.firstName || "",
    lastName: existing?.lastName || "",
    relationshipToTitular: existing?.relationshipToTitular || "hijo",
    category: existing?.category || "sub12",
    dateOfBirth: existing?.dateOfBirth || "",
    position: existing?.position || "",
    bloodType: existing?.bloodType || "",
    allergies: existing?.allergies || "",
    medicalConditions: existing?.medicalConditions || "",
    emergencyContact: existing?.emergencyContact || "",
    emergencyPhone: existing?.emergencyPhone || "",
    secondaryContactName: existing?.secondaryContactName || "",
    secondaryContactPhone: existing?.secondaryContactPhone || "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isSelf = form.relationshipToTitular === "self";

  const save = async () => {
    const parsed = playerProfileSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Revisa los datos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    const pid = existing?.id || txId();
    const ops: any[] = [
      db.tx.playerProfiles[pid].update({
        ...parsed.data,
        // Al crear: pending. Al editar: conserva el status actual.
        status: existing?.status || "pending",
        gamesPlayed: existing?.gamesPlayed ?? 0,
        goals: existing?.goals ?? 0,
        assists: existing?.assists ?? 0,
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
      }),
    ];
    if (!existing) ops.push(db.tx.playerProfiles[pid].link({ titular: titularId }));
    await db.transact(ops);
    toast({ title: existing ? "✅ Datos actualizados" : "✅ Jugador agregado (en revisión)" });
    onDone?.();
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isSelf ? "Tus datos de jugador" : existing ? "Editar jugador" : "Agregar jugador"}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Nombre</Label><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
          <div><Label>Apellido</Label><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
          <div>
            <Label>Relación contigo</Label>
            <select className="w-full border rounded h-10 px-2" value={form.relationshipToTitular}
              onChange={(e) => set("relationshipToTitular", e.target.value)}>
              <option value="hijo">Hijo</option>
              <option value="hija">Hija</option>
              <option value="otro">Otro</option>
              <option value="self">Yo mismo (jugador adulto)</option>
            </select>
          </div>
          <div>
            <Label>Categoría deseada</Label>
            <select className="w-full border rounded h-10 px-2" value={form.category}
              onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div><Label>Fecha de nacimiento</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></div>
          <div><Label>Posición</Label><Input value={form.position} onChange={(e) => set("position", e.target.value)} /></div>
          <div><Label>Tipo de sangre</Label><Input value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)} /></div>
          <div><Label>Contacto emergencia</Label><Input value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} /></div>
          <div><Label>Tel. emergencia</Label><Input value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} /></div>
          <div className="col-span-2"><Label>Alergias / condiciones médicas</Label><Input value={form.medicalConditions} onChange={(e) => set("medicalConditions", e.target.value)} /></div>
        </div>
        <Button onClick={save} className="w-full">{existing ? "Guardar cambios" : "Agregar jugador"}</Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: `PlayerStatusBanner.tsx`**

Create `client/src/components/family/PlayerStatusBanner.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import type { PlayerStatus } from "@/lib/players";

const REQUIRED_DOCS = [
  { type: "id", label: "Documento de identidad" },
  { type: "eps", label: "EPS" },
  { type: "medical", label: "Certificado médico" },
  { type: "image_rights", label: "Derechos de imagen" },
];

export function PlayerStatusBanner({ status, rejectionReason, documents }: {
  status: PlayerStatus; rejectionReason?: string; documents?: any[];
}) {
  if (status === "approved") return null;
  const have = new Set((documents || []).map((d) => d.type));
  const missing = REQUIRED_DOCS.filter((d) => !have.has(d.type));

  return (
    <div className="rounded-lg border p-4 mb-6 bg-muted/40">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={status === "rejected" ? "destructive" : "secondary"}>
          {status === "rejected" ? "Rechazado" : status === "inactive" ? "Inactivo" : "En revisión por el club"}
        </Badge>
      </div>
      {status === "rejected" && rejectionReason && (
        <p className="text-sm text-destructive mb-2">Motivo: {rejectionReason}</p>
      )}
      {status !== "inactive" && (
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Documentos pendientes:</p>
          {missing.length === 0 ? (
            <p className="text-green-600">Todos los documentos cargados ✔</p>
          ) : (
            <ul className="list-disc ml-5">{missing.map((d) => <li key={d.type}>{d.label}</li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: `PlayerSwitcher.tsx`**

Create `client/src/components/family/PlayerSwitcher.tsx`:
```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { playerDisplayName, relationshipLabel } from "@/lib/players";

export function PlayerSwitcher({ players, onSelect, onAdd }: {
  players: any[]; onSelect: (id: string) => void; onAdd: () => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {players.map((p) => (
        <Card key={p.id} className="cursor-pointer hover-elevate" onClick={() => onSelect(p.id)}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mx-auto mb-3 flex items-center justify-center">
              {(p.firstName?.[0] || "?").toUpperCase()}
            </div>
            <div className="font-semibold">{playerDisplayName(p)}</div>
            <div className="text-xs text-muted-foreground capitalize">{p.category}</div>
            <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"} className="mt-2">
              {p.status === "approved" ? "Activo" : p.status === "rejected" ? "Rechazado" : "En revisión"}
            </Badge>
            <div className="text-[11px] text-muted-foreground mt-1">{relationshipLabel(p.relationshipToTitular)}</div>
          </CardContent>
        </Card>
      ))}
      <Card className="cursor-pointer border-dashed hover-elevate" onClick={onAdd}>
        <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full min-h-[160px]">
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <div className="text-sm font-medium">Agregar jugador</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Type-check**

Run el TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida para los cuatro componentes de `components/family/`.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/family/
git commit -m "feat(family): onboarding titular, alta/edición jugador, banner de estado y selector"
```

---

## Task 11: `PlayerDashboard` → panel de familia

Reemplaza el dashboard 1-jugador por: onboarding (si falta) → selector (si 2+) o vista directa (si 1) → vista de jugador con banner y ficha. Las pestañas de videos/cartera/estadística quedan como contenedores placeholder (bloques B/D/E).

**Files:**
- Modify: `client/src/pages/PlayerDashboard.tsx` (reescritura)

- [ ] **Step 1: Reescribir el componente**

Reemplazar **todo** el contenido de `client/src/pages/PlayerDashboard.tsx` por:
```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { useFamily } from "@/hooks/useFamily";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { PlayerSwitcher } from "@/components/family/PlayerSwitcher";
import { TitularOnboardingForm } from "@/components/family/TitularOnboardingForm";
import { PlayerProfileForm } from "@/components/family/PlayerProfileForm";
import { PlayerStatusBanner } from "@/components/family/PlayerStatusBanner";
import { canViewContent, playerDisplayName } from "@/lib/players";

export default function PlayerDashboard() {
  const { authUser, titular, players, isLoading, needsOnboarding } = useFamily();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }
  if (!authUser || !titular) { window.location.href = "/login"; return null; }

  const Header = ({ children }: { children?: React.ReactNode }) => (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">{children}
          <div><h1 className="text-xl font-bold">Mi familia</h1>
            <p className="text-xs text-muted-foreground">{titular.firstName || authUser.email}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"><Button variant="outline" size="sm"><Home className="h-4 w-4" /></Button></Link>
          <Button variant="outline" size="sm" onClick={() => { db.auth.signOut(); window.location.href = "/"; }}><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>
    </header>
  );

  // 1) Onboarding del titular
  if (needsOnboarding) {
    return <div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 py-8"><TitularOnboardingForm titular={titular} /></main></div>;
  }

  // 2) Agregar jugador (la relación —incluido "yo mismo, adulto"— se elige en el formulario)
  if (adding) {
    return <div className="min-h-screen bg-background">
      <Header><Button variant="ghost" size="icon" onClick={() => setAdding(false)}><ArrowLeft className="h-5 w-5" /></Button></Header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <PlayerProfileForm titularId={titular.id} onDone={() => setAdding(false)} />
      </main></div>;
  }

  // 3) Selección: directo si hay 1, selector si 2+
  const effectiveId = selectedId || (players.length === 1 ? players[0].id : null);
  if (!effectiveId) {
    return <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto px-4 py-8">
        {players.length === 0 && <p className="text-muted-foreground mb-4">Aún no has agregado jugadores. Agrega a tu hijo/a o regístrate como jugador.</p>}
        <PlayerSwitcher players={players} onSelect={setSelectedId} onAdd={() => setAdding(true)} />
      </main></div>;
  }

  // 4) Vista de un jugador
  const player = players.find((p) => p.id === effectiveId)!;
  const unlocked = canViewContent(player.status);
  return (
    <div className="min-h-screen bg-background">
      <Header>{players.length > 1 && <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}><ArrowLeft className="h-5 w-5" /></Button>}</Header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12"><AvatarFallback>{(player.firstName?.[0] || "?").toUpperCase()}</AvatarFallback></Avatar>
          <div><h2 className="text-2xl font-bold">{playerDisplayName(player)}</h2>
            <p className="text-sm text-muted-foreground capitalize">{player.category} · {player.position || "Sin posición"}</p></div>
        </div>

        <PlayerStatusBanner status={player.status} rejectionReason={player.rejectionReason} documents={player.documents} />

        <Card className="mb-6">
          <CardHeader><CardTitle>Ficha del jugador</CardTitle></CardHeader>
          <CardContent>
            <PlayerProfileForm titularId={titular.id} existing={player} onDone={() => {}} />
          </CardContent>
        </Card>

        {!unlocked ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">
            El contenido (videos, cartera y estadísticas) se habilita cuando el club apruebe a este jugador.
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {/* Contenedores para bloques B / E / D */}
            <Card><CardHeader><CardTitle className="text-base">Formación</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Próximamente (Bloque B)</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Cartera</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Próximamente (Bloque E)</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Estadísticas</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Próximamente (Bloque D)</CardContent></Card>
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run el TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida (sin errores nuevos en `PlayerDashboard.tsx`).

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/PlayerDashboard.tsx
git commit -m "feat(family): PlayerDashboard como panel de familia con selector y vista de jugador"
```

---

## Task 12: Bandeja de aprobación y gestión de cuentas (admin + coach)

**Files:**
- Create: `client/src/components/admin/ApprovalQueue.tsx`
- Create: `client/src/components/admin/AccountManager.tsx`
- Modify: `client/src/pages/AdminDashboard.tsx`
- Modify: `client/src/pages/CoachDashboard.tsx`

- [ ] **Step 1: `ApprovalQueue.tsx`**

Create `client/src/components/admin/ApprovalQueue.tsx`:
```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { playerDisplayName } from "@/lib/players";

/**
 * Cola de aprobación. Si `category` viene, filtra a esa categoría (uso coach).
 * `reviewerId` = users.id del staff que aprueba (para enlazar approvedBy).
 */
export function ApprovalQueue({ category, reviewerId }: { category?: string; reviewerId: string }) {
  const { toast } = useToast();
  const where: any = { status: "pending" };
  if (category) where.category = category;
  const { data } = db.useQuery({ playerProfiles: { $: { where }, titular: {}, documents: {} } });
  const pending = (data?.playerProfiles || []) as any[];
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const approve = async (p: any) => {
    await db.transact([
      db.tx.playerProfiles[p.id].update({ status: "approved", approvedAt: Date.now(), rejectionReason: undefined, updatedAt: Date.now() }),
      db.tx.playerProfiles[p.id].link({ approvedBy: reviewerId }),
    ]);
    toast({ title: `✅ ${playerDisplayName(p)} aprobado` });
  };
  const reject = async (p: any) => {
    if (!reason.trim()) { toast({ title: "Escribe un motivo", variant: "destructive" }); return; }
    await db.transact([
      db.tx.playerProfiles[p.id].update({ status: "rejected", rejectionReason: reason.trim(), updatedAt: Date.now() }),
    ]);
    toast({ title: `${playerDisplayName(p)} rechazado` });
    setRejecting(null); setReason("");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Aprobación de jugadores {category ? `(${category})` : ""}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">No hay jugadores pendientes.</p>}
        {pending.map((p) => (
          <div key={p.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{playerDisplayName(p)}</div>
                <div className="text-xs text-muted-foreground capitalize">{p.category} · Titular: {p.titular?.[0]?.firstName || p.titular?.[0]?.email || "—"}</div>
                <div className="text-xs mt-1">Documentos: {(p.documents || []).length} cargados</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve(p)}>Aprobar</Button>
                <Button size="sm" variant="destructive" onClick={() => setRejecting(rejecting === p.id ? null : p.id)}>Rechazar</Button>
              </div>
            </div>
            {rejecting === p.id && (
              <div className="flex gap-2 mt-2">
                <Input placeholder="Motivo del rechazo" value={reason} onChange={(e) => setReason(e.target.value)} />
                <Button size="sm" variant="destructive" onClick={() => reject(p)}>Confirmar</Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: `AccountManager.tsx`**

Create `client/src/components/admin/AccountManager.tsx`:
```tsx
import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["guardian", "coach", "admin"];

export function AccountManager() {
  const { toast } = useToast();
  const { data } = db.useQuery({ users: { players: {}, coachProfile: {} } });
  const users = (data?.users || []) as any[];
  const [editing, setEditing] = useState<string | null>(null);

  const setRole = async (u: any, role: string) => {
    await db.transact([db.tx.users[u.id].update({ role, updatedAt: Date.now() })]);
    toast({ title: `Rol actualizado a ${role}` });
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Cuentas</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between border rounded p-2">
            <div>
              <div className="font-medium text-sm">{u.firstName ? `${u.firstName} ${u.lastName || ""}` : u.email}</div>
              <div className="text-xs text-muted-foreground">{u.email} · {(u.players || []).length} jugador(es)</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{u.role}</Badge>
              {editing === u.id ? (
                <div className="flex gap-1">
                  {ROLES.map((r) => <Button key={r} size="sm" variant="secondary" onClick={() => setRole(u, r)}>{r}</Button>)}
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(u.id)}>Cambiar rol</Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

> Enlazar un `users` (rol coach) con una ficha `coaches` se hará desde la gestión de coaches existente; aquí basta con asignar el rol. El enlace `coachUser` se cubre cuando el admin cree/edite la ficha del coach (fuera del alcance mínimo del Bloque A; queda el rol listo).

- [ ] **Step 3: Insertar en `AdminDashboard.tsx`**

En `client/src/pages/AdminDashboard.tsx`:
1. Agregar imports tras la línea 33:
```tsx
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { AccountManager } from "@/components/admin/AccountManager";
```
2. En la `<TabsList>` agregar dos triggers (ej. junto a los existentes):
```tsx
<TabsTrigger value="approvals">Aprobaciones</TabsTrigger>
<TabsTrigger value="accounts">Cuentas</TabsTrigger>
```
3. Agregar los dos `<TabsContent>` correspondientes dentro del mismo `<Tabs>`:
```tsx
<TabsContent value="approvals"><ApprovalQueue reviewerId={user.id} /></TabsContent>
<TabsContent value="accounts"><AccountManager /></TabsContent>
```
4. Corregir el conteo de jugadores: cambiar `allUsers.filter((u) => u.role === "player").length` por el conteo de perfiles aprobados:
```tsx
  const totalPlayers = profiles.filter((p) => p.status === "approved").length;
```

- [ ] **Step 4: Insertar la cola en `CoachDashboard.tsx`**

En `client/src/pages/CoachDashboard.tsx`:
1. Importar el componente y el hook de auth extendido tras la línea 24:
```tsx
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { useAuth } from "@/hooks/useAuth";
```
2. Dentro del componente, obtener la categoría del coach:
```tsx
  const { coachProfile } = useAuth();
  const coachCategory = coachProfile?.category?.[0]?.id || coachProfile?.category || undefined;
```
3. Agregar un `<TabsTrigger value="approvals">Aprobaciones</TabsTrigger>` en la `<TabsList>` y un contenido:
```tsx
<TabsContent value="approvals">
  {coachCategory
    ? <ApprovalQueue category={coachCategory} reviewerId={user.id} />
    : <p className="text-sm text-muted-foreground">Tu ficha de coach aún no tiene categoría asignada.</p>}
</TabsContent>
```

- [ ] **Step 5: Type-check**

Run el TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida. Si `coachProfile.category` da error de tipo, déjalo como `any` (las queries devuelven `any[]` en este código).

- [ ] **Step 6: Commit**

```bash
git add client/src/components/admin/ client/src/pages/AdminDashboard.tsx client/src/pages/CoachDashboard.tsx
git commit -m "feat(admin/coach): bandeja de aprobación (con filtro por categoría) y gestión de cuentas"
```

---

## Task 13: Rutas y limpieza de referencias al modelo viejo

**Files:**
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Buscar referencias rotas al rol `player`**

Run: `grep -rn "isPlayer\|role === \"player\"\|role === 'player'" client/src`
Expected: lista de usos. Revisar cada uno; el panel del jugador ahora es para `guardian`.

- [ ] **Step 2: Ajustar el ruteo de dashboards en `App.tsx`**

En `client/src/App.tsx`, en `getDashboard()`, el caso por defecto (no admin, no coach) ya devuelve `PlayerDashboard`, que ahora es el panel de familia para el titular `guardian`. Verificar que siga así:
```tsx
  const getDashboard = () => {
    if (!isAuthenticated) return Landing;
    if (isAdmin) return AdminDashboard;
    if (isCoach) return CoachDashboard;
    return PlayerDashboard; // titular (guardian)
  };
```
La ruta privada `/dashboard` se mantiene apuntando a `PlayerDashboard` para autenticados. (No se requiere `/dashboard/:playerId`: la selección de hijo es estado interno del panel; deja la ruta simple.)

- [ ] **Step 3: Type-check del cliente completo**

Run el TYPECHECK ESTÁNDAR DEL CLIENTE (ver header):
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "shared/schema\.ts|server/|useInstantAuth\.ts|Tournaments\.tsx"
```
Expected: sin salida. Corregir cualquier referencia restante a `isPlayer` o a campos `guardianName/guardianEmail` eliminados (en `PlayerDashboard` ya no existen; si algún otro archivo los usa, reemplazar por el contacto secundario o el titular).

- [ ] **Step 4: Correr toda la suite de tests**

Run: `npm test`
Expected: PASS — tests de `players.test.ts` y `playerSchema.test.ts` en verde.

- [ ] **Step 5: Commit**

```bash
git add client/src/App.tsx
git commit -m "chore: ruteo de titular y limpieza de referencias al modelo viejo"
```

---

## Task 14: Verificación funcional manual (end-to-end)

Verifica el flujo completo en la app corriendo. Requiere que el push de la Task 6 esté hecho.

**Files:** ninguno

- [ ] **Step 1: Levantar la app**

Run: `npm run dev`
Abrir la URL local.

- [ ] **Step 2: Registro de titular + onboarding**

1. Entrar con un email nuevo (magic code).
2. Verificar que se pide completar contacto (onboarding). Guardar nombre + teléfono.
Expected: queda en el panel "Mi familia" sin jugadores.

- [ ] **Step 3: Agregar dos hijos en categorías distintas**

Agregar "Ana" (sub12) y "Luis" (sub14).
Expected: aparecen en el selector con badge "En revisión". Con 2 jugadores se muestra el selector (no entra directo).

- [ ] **Step 4: Estado pendiente bloquea contenido**

Abrir "Ana".
Expected: banner "En revisión por el club" con checklist de documentos; los contenedores de Formación/Cartera/Estadísticas NO se muestran (texto de bloqueo en su lugar).

- [ ] **Step 5: Aprobación por coach de su categoría**

1. Con una cuenta admin, en "Cuentas" cambiar un usuario a `coach` (y asegurar su ficha/categoría sub12 si aplica).
2. Entrar como ese coach → tab "Aprobaciones" → ver solo jugadores sub12 → aprobar a "Ana".
Expected: "Ana" pasa a `approved`; no aparece "Luis" (sub14) en la cola del coach sub12.

- [ ] **Step 6: Contenido desbloqueado y adulto self**

1. Como el titular, abrir "Ana": el banner desaparece y se ven los contenedores de Formación/Cartera/Estadísticas.
2. Registrar un email nuevo, agregarse a sí mismo como Mayores (`self`): con un solo perfil, el panel entra directo a la vista del jugador.
Expected: el formulario dice "Tus datos de jugador" y no pide relación.

- [ ] **Step 7: Registrar resultado**

Si algún paso falla, NO marcar la task como completa: abrir un fix con `superpowers:systematic-debugging`. Si todo pasa, dejar nota en el PR.

---

## Notas de cierre

- **Out of scope (otros bloques):** biblioteca/gamificación (B), feedback+informe (C), entrenamientos/asistencia (D), detalle de cartera (E). Aquí solo quedan listos `documents` y los contenedores placeholder.
- **Enlace coach↔ficha (`coachUser`):** el esquema y permisos quedan listos; el alta fina de la ficha de coach con su categoría se completa en la gestión de coaches (parte de D) — en A basta con el rol y la cola filtrada por categoría.
- Al terminar el Bloque A, usar `superpowers:finishing-a-development-branch` para decidir merge/PR.
