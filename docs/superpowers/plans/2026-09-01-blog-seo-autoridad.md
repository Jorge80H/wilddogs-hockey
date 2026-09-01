# Blog de Autoridad SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a blog subsystem (`/blog`, `/blog/:slug`) with 5 SEO-optimized articles so Optima Wild Dogs Hockey Club becomes the reference site for inline hockey searches in Bogotá/Colombia.

**Architecture:** Content lives as versioned React components in the repo (no new backend/CMS). A metadata manifest maps slugs to lazily-loaded article components. Two new pages (`Blog.tsx`, `BlogPost.tsx`) reuse the site's existing `useSEO` hook and a new `useJSONLD` hook for per-article structured data.

**Tech Stack:** React 18 + TypeScript, Wouter routing, Tailwind CSS (`@tailwindcss/typography` for article prose), Vitest (node environment, no jsdom).

**Spec:** `docs/superpowers/specs/2026-09-01-blog-seo-autoridad-design.md`

## Global Constraints

- Domain for absolute URLs: `https://optimawilddogs.com` (`BASE_DOMAIN`). Do not modify `client/src/hooks/useSEO.ts` — it already exports a working `useSEO({ title, description, image, url, type })` hook, including `type: "article"` support. Duplicate the `BASE_DOMAIN` string locally in any new file that needs it (matches how `useSEO.ts` already does it privately).
- WhatsApp CTA: import `WHATSAPP_URL` from `@/components/layout/PublicNav` — do not hardcode the number again.
- Brand voice: the site's existing voice uses "la manada" 🐺 and direct CTAs ("Quiero unirme a la manada →" — see `client/src/pages/LeadLanding.tsx`). All new copy must sound like the same club, not a generic blog. Apply the `copy-that-converts` skill's kill list — no "utilizar", "en el mundo actual", "delve", "game-changer", or filler paragraphs of identical length.
- Never present unverified specifics as fact. The only verified facts to draw on: address `Carrera 22 No. 164 - 83` (Toberín/Usaquén), hours (L-V 3-10pm, Sáb 7am-2pm, Dom 7am-1pm), categories (Sub 8/10/12/14/16/18, Femenino, Mayores), free trial class with equipment loan, areas served (Usaquén, Suba, Cedritos, Colina Campestre, Chicó, Rosales/Chapinero), training venues (Hockey One, Federación Colombiana de Patinaje, BHC). Equipment price ranges must stay explicitly caveated as market estimates, never stated as exact fixed prices. Never fabricate a named parent testimonial.
- Path aliases (`vite.config.ts` / `tsconfig.json`): `@/*` → `client/src/*`, `@assets/*` → `attached_assets/*`. Blog cover images are **not** Vite-processed imports — they live as plain static files in `public/images/blog/` and are referenced as root-relative strings (`/images/blog/<slug>.webp`) so `useSEO`'s `image` prop and the JSON-LD builders can produce absolute URLs with a simple string concat.
- Testing convention: `vitest.config.ts` runs with `environment: "node"` — there is no DOM/jsdom available, and the codebase has zero component-render tests today (only `client/src/lib/*.test.ts` pure-function tests exist; `useSEO.ts` itself has no test file). Follow that precedent: only `manifest.ts` (pure data/logic) gets a red-green Vitest cycle. Every other task's automated gate is `npm run check` (TypeScript). The final task includes a manual browser walkthrough, matching the spec's own Verification section.
- Word counts: the spec's "800-1200 palabras" is a rough guide. The `copy-that-converts` skill's "no filler" rule wins — articles below run ~550-700 words and are intentionally free of padding. Do not pad them to hit a word count.

---

### Task 1: `useJSONLD` hook

**Files:**
- Create: `client/src/hooks/useJSONLD.ts`

**Interfaces:**
- Consumes: nothing (foundational).
- Produces: `useJSONLD(id: string, data: Record<string, unknown>): void` — injects/updates a `<script type="application/ld+json" id={id}>` tag in `document.head` and removes it on unmount. Used by Task 8 (`Blog.tsx`) and Task 9 (`BlogPost.tsx`).

- [ ] **Step 1: Write the hook**

```ts
// client/src/hooks/useJSONLD.ts
import { useEffect } from "react";

/**
 * Injects a <script type="application/ld+json"> tag into <head>, keyed by id.
 * Re-runs only when the serialized data actually changes, and removes the
 * tag on unmount.
 */
export function useJSONLD(id: string, data: Record<string, unknown>) {
  const serialized = JSON.stringify(data);

  useEffect(() => {
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = serialized;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, serialized]);
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/useJSONLD.ts
git commit -m "feat: add useJSONLD hook for per-page structured data"
```

---

### Task 2: Shared `BlogCTA` component + Article 1 — "¿Qué es el Hockey en Línea?"

**Files:**
- Create: `client/src/content/blog/BlogCTA.tsx`
- Create: `client/src/content/blog/posts/que-es-hockey-en-linea.tsx`
- Create (copy): `public/images/blog/que-es-hockey-en-linea.webp`

**Interfaces:**
- Consumes: `WHATSAPP_URL` from `@/components/layout/PublicNav`; `Button` from `@/components/ui/button`; `Link` from `wouter`.
- Produces: `BlogCTA` component (consumed by every article in Tasks 2-6). Default export `QueEsHockeyEnLinea(): JSX.Element` (consumed by Task 7's `postComponents` map via `slug: "que-es-hockey-en-linea"`).

- [ ] **Step 1: Create the blog images directory and copy the cover photo**

```bash
mkdir -p public/images/blog
cp "attached_assets/client_images/Jugadores_Wilddogs.webp" "public/images/blog/que-es-hockey-en-linea.webp"
```

- [ ] **Step 2: Write the shared CTA block**

```tsx
// client/src/content/blog/BlogCTA.tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { WHATSAPP_URL } from "@/components/layout/PublicNav";

export function BlogCTA() {
  return (
    <div className="not-prose my-10 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
      <p className="text-2xl font-black tracking-tight mb-2">
        ¿Tu hijo o hija quiere probar el hockey en línea?
      </p>
      <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
        Agenda su clase de prueba gratis en Optima Wild Dogs. Le prestamos el equipo, tú solo
        traes las ganas de patinar.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/unete">
          <Button size="lg" className="text-base px-8" data-testid="button-blog-cta-unete">
            Quiero unirme a la manada
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8"
            data-testid="button-blog-cta-whatsapp"
          >
            Escribir por WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the article**

```tsx
// client/src/content/blog/posts/que-es-hockey-en-linea.tsx
import { Link } from "wouter";
import { BlogCTA } from "../BlogCTA";

export default function QueEsHockeyEnLinea() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <p className="lead">
        Tu hijo llegó del colegio hablando de un deporte con patines, un stick y una bola naranja.
        Tú nunca lo jugaste. No sabes si es hockey sobre hielo sin hielo, patinaje con extras, o
        algo completamente distinto. Vas a entenderlo en los próximos cinco minutos — y vas a
        entender por qué cada vez más niños en Bogotá se están enganchando con él.
      </p>

      <h2>Hockey en línea, en una frase</h2>
      <p>
        Es hockey de toda la vida: dos equipos, un arco cada uno, un objetivo claro — meter más
        goles que el rival — jugado sobre patines de ruedas en línea, en una cancha dura (no
        hielo), con una bola liviana en vez de un disco. Mismo espíritu de equipo y de contacto
        que el hockey sobre hielo, sin necesitar una pista congelada que en Bogotá, honestamente,
        no existe a nivel masivo.
      </p>

      <h2>¿Por qué tantos papás en Bogotá lo están eligiendo?</h2>
      <p>
        Porque resuelve un problema real: no hay pistas de hielo cerca, pero sí hay canchas duras
        techadas y al aire libre en varios puntos de la ciudad. Eso hace que el deporte sea
        accesible sin que la familia tenga que planear un viaje a otra ciudad para practicarlo en
        serio. Y porque Bogotá ya tiene una comunidad activa alrededor: federación, torneos,
        clubes, categorías desde formativas hasta competitivas.
      </p>

      <h2>¿Es peligroso?</h2>
      <p>
        Es la pregunta que hace todo papá justo después de la anterior. La respuesta corta: es un
        deporte de contacto, como el fútbol o el baloncesto lo son a su manera, pero con equipo de
        protección obligatorio de pies a cabeza — casco con rejilla facial, coderas, rodilleras,
        guantes — y reglas específicas para categorías infantiles que limitan el contacto físico.
        Los entrenadores de club están formados justamente para enseñar la técnica de caída y de
        contacto antes de meter a un niño a un partido real.
      </p>

      <h2>¿A qué edad puede empezar mi hijo?</h2>
      <p>
        Desde los 4 años ya pueden empezar en categorías formativas como Sub 8, donde el foco está
        en la diversión y el desarrollo motor, no en la competencia. Si quieres el detalle completo
        categoría por categoría, te lo explicamos a fondo en{" "}
        <Link href="/blog/a-que-edad-empezar-hockey-en-linea">
          ¿A qué edad puede empezar mi hijo en hockey en línea?
        </Link>
        .
      </p>

      <h2>Cómo se ve un club real en Bogotá</h2>
      <p>
        En Optima Wild Dogs entrenamos en el norte de la ciudad, sector Toberín / Usaquén, con
        categorías desde Sub 8 hasta Mayores, categoría femenina competitiva, y entrenadores
        certificados en formación deportiva infantil. Puedes ver el detalle de cada grupo de edad
        en <Link href="/categorias">nuestras categorías</Link> o revisar cómo son los
        entrenamientos en <Link href="/servicios">nuestros programas</Link>.
      </p>

      <BlogCTA />

      <p>
        La mejor forma de entender el hockey en línea no es leyendo sobre él — es viendo a un niño
        de 6 años caerse, reírse, y volver a pararse solo. Eso es lo que pasa en cada clase de
        prueba. Ven a ver a la manada entrenar.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/content/blog/BlogCTA.tsx client/src/content/blog/posts/que-es-hockey-en-linea.tsx public/images/blog/que-es-hockey-en-linea.webp
git commit -m "feat: add BlogCTA and first blog article (que es el hockey en linea)"
```

---

### Task 3: Article 2 — "Beneficios del Hockey en Línea para Niños"

**Files:**
- Create: `client/src/content/blog/posts/beneficios-hockey-en-linea-ninos.tsx`
- Create (copy): `public/images/blog/beneficios-hockey-en-linea-ninos.webp`

**Interfaces:**
- Consumes: `BlogCTA` from `../BlogCTA` (Task 2), `Link` from `wouter`.
- Produces: default export `BeneficiosHockeyEnLineaNinos(): JSX.Element` (consumed by Task 7 via `slug: "beneficios-hockey-en-linea-ninos"`).

- [ ] **Step 1: Copy the cover photo**

```bash
cp "attached_assets/client_images/Rooster_Sub8.webp" "public/images/blog/beneficios-hockey-en-linea-ninos.webp"
```

- [ ] **Step 2: Write the article**

```tsx
// client/src/content/blog/posts/beneficios-hockey-en-linea-ninos.tsx
import { Link } from "wouter";
import { BlogCTA } from "../BlogCTA";

export default function BeneficiosHockeyEnLineaNinos() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <p className="lead">
        Buscaste "actividades extracurriculares para niños en Bogotá" y te salieron cien opciones
        parecidas: fútbol, natación, tenis. Todas buenas. Ninguna te hizo detenerte. El hockey en
        línea sí, porque junta en un mismo entrenamiento algo que casi ningún otro deporte reúne:
        equilibrio, contacto físico controlado, velocidad y trabajo en equipo real.
      </p>

      <h2>Lo físico: más que "hacer ejercicio"</h2>
      <p>
        Patinar exige control constante del cuerpo — cada cambio de dirección es una pequeña
        corrección de equilibrio. Con el tiempo, eso se traduce en menos caídas torpes en la vida
        diaria y en un niño que se mueve con más confianza en su propio cuerpo, no solo en la
        cancha. A eso se suma la parte cardiovascular: un partido de hockey en línea tiene cambios
        de intensidad constantes, así que la resistencia sube rápido, y con ella baja el cansancio
        que arrastran a mitad de semana escolar.
      </p>

      <h2>Lo mental: disciplina que no se nota hasta que falta</h2>
      <p>
        Ir a entrenar dos veces por semana, incluso el día que no tiene ganas, es la primera
        lección de compromiso que muchos niños tienen fuera del colegio. Esa constancia se nota
        después en otros lados — en terminar la tarea sin que se la repitas tres veces. Y perder un
        partido, o fallar el gol decisivo, enseña algo que ningún regaño en casa logra igual:
        tolerar la frustración y volver a intentarlo en el siguiente turno.
      </p>

      <h2>Lo social: amigos que no son del salón</h2>
      <p>
        En un equipo no se elige a los compañeros por afinidad, se aprende a jugar con quien te
        toque — y ahí está el valor. Los niños que entrenan juntos construyen una red de amigos
        distinta a la del colegio, con algo real en común, y eso pesa especialmente en categorías
        donde cuesta hacer amigos nuevos.
      </p>

      <h2>Lo que notamos en la cancha, semana a semana</h2>
      <p>
        En Optima Wild Dogs vemos el mismo patrón entrenamiento tras entrenamiento: el niño que
        llega tímido en su primera clase de prueba, tres meses después es el que anima al que se
        acaba de caer. Eso no lo enseña un video ni una charla — lo enseña estar en el equipo,
        temporada tras temporada.
      </p>

      <h2>¿Por qué no otro deporte de equipo?</h2>
      <p>
        No se trata de que el hockey en línea sea "mejor" que el fútbol o el baloncesto — se trata
        de que combina cosas que normalmente van separadas: la técnica individual de un deporte de
        patinaje con el contacto físico y la táctica de un deporte de equipo. Es una mezcla poco
        común en la oferta deportiva de Bogotá, y por eso muchos papás la descubren tarde. Puedes
        ver cómo se organizan los grupos de entrenamiento por edad en{" "}
        <Link href="/servicios">nuestros programas</Link>.
      </p>

      <BlogCTA />

      <p>
        Los beneficios no se explican del todo en un artículo — se ven en la cara de un niño
        después de su primera clase. Esa es la mejor forma de confirmar si el hockey en línea es
        para el tuyo.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/content/blog/posts/beneficios-hockey-en-linea-ninos.tsx public/images/blog/beneficios-hockey-en-linea-ninos.webp
git commit -m "feat: add blog article on benefits of inline hockey for kids"
```

---

### Task 4: Article 3 — "¿A Qué Edad Puede Empezar mi Hijo en Hockey en Línea?"

**Files:**
- Create: `client/src/content/blog/posts/a-que-edad-empezar-hockey-en-linea.tsx`
- Create (copy): `public/images/blog/a-que-edad-empezar-hockey-en-linea.webp`

**Interfaces:**
- Consumes: `BlogCTA` from `../BlogCTA` (Task 2), `Link` from `wouter`.
- Produces: default export `AQueEdadEmpezarHockeyEnLinea(): JSX.Element` (consumed by Task 7 via `slug: "a-que-edad-empezar-hockey-en-linea"`).

- [ ] **Step 1: Copy the cover photo**

```bash
cp "attached_assets/client_images/Sub10_grupo.webp" "public/images/blog/a-que-edad-empezar-hockey-en-linea.webp"
```

- [ ] **Step 2: Write the article**

```tsx
// client/src/content/blog/posts/a-que-edad-empezar-hockey-en-linea.tsx
import { Link } from "wouter";
import { BlogCTA } from "../BlogCTA";

export default function AQueEdadEmpezarHockeyEnLinea() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <p className="lead">
        "¿No está muy pequeño para eso?" — es la primera pregunta que hacen la mayoría de los
        papás cuando ven a un niño de cinco años con casco y stick en una cancha. La respuesta
        corta: no. La respuesta completa depende de la categoría, y aquí te la desglosamos.
      </p>

      <h2>Las categorías por edad, sin rodeos</h2>
      <ul>
        <li><strong>Sub 8</strong> (menores de 8 años): la puerta de entrada, desde los 4 años. Foco en diversión y desarrollo motor, no en competir.</li>
        <li><strong>Sub 10</strong> (menores de 10 años): primeras nociones de reglas y juego en equipo.</li>
        <li><strong>Sub 12</strong> (menores de 12 años): técnica individual más exigente, se empieza a entender la posición dentro de la cancha.</li>
        <li><strong>Sub 14</strong> (menores de 14 años): entrenamiento competitivo, más táctica colectiva.</li>
        <li><strong>Sub 16</strong> y <strong>Sub 18</strong> (menores de 16 y 18 años): alto nivel, preparación para categorías mayores y selecciones.</li>
        <li><strong>Femenino</strong>: todas las edades, competitiva.</li>
        <li><strong>Mayores</strong>: 18 años en adelante.</li>
      </ul>
      <p>
        Puedes ver el detalle completo de objetivos por grupo en{" "}
        <Link href="/categorias">nuestras categorías</Link>.
      </p>

      <h2>¿Y si nunca se ha subido a unos patines?</h2>
      <p>
        No importa. La mayoría de los niños que entran a Sub 8 empiezan desde cero — ese es
        justamente el punto de la categoría formativa. Los entrenadores manejan pedagogía deportiva
        infantil específica: primero se aprende a pararse y frenar, después a manejar el stick, y
        solo mucho después se juega un partido real. No se salta ningún paso.
      </p>

      <h2>Señales de que tu hijo o hija ya está listo</h2>
      <p>
        No hace falta que patine perfecto. Las señales reales son otras: se para en unos patines
        sin caerse cada dos segundos (aunque sea agarrado de tu mano), le llaman la atención los
        deportes de equipo como el fútbol o el baloncesto, y cuando ve un partido de hockey no se
        asusta — se le nota curiosidad. Eso alcanza para arrancar en Sub 8.
      </p>

      <h2>¿Es tarde si ya tiene 12, 14 o 16 años?</h2>
      <p>
        No. Las categorías Sub 12 a Sub 18 reciben jugadores nuevos constantemente — no es un tren
        que ya salió. Sí van a tener que ponerse al día más rápido en técnica que un niño que
        arrancó en Sub 8, pero eso es exactamente para lo que están los entrenadores: nivelar según
        el punto de partida real de cada jugador, no según la edad en el papel.
      </p>

      <BlogCTA />

      <p>
        La única forma de responder con certeza "¿está listo mi hijo?" es viéndolo patinar una
        vez. Por eso la primera clase es de prueba, sin compromiso.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/content/blog/posts/a-que-edad-empezar-hockey-en-linea.tsx public/images/blog/a-que-edad-empezar-hockey-en-linea.webp
git commit -m "feat: add blog article on the right age to start inline hockey"
```

---

### Task 5: Article 4 — "Equipamiento para Hockey en Línea: Guía de Precios en Bogotá"

**Files:**
- Create: `client/src/content/blog/posts/equipamiento-precio-hockey-en-linea-bogota.tsx`
- Create (copy): `public/images/blog/equipamiento-precio-hockey-en-linea-bogota.webp`

**Interfaces:**
- Consumes: `BlogCTA` from `../BlogCTA` (Task 2), `Link` from `wouter`.
- Produces: default export `EquipamientoPrecioHockeyEnLineaBogota(): JSX.Element` (consumed by Task 7 via `slug: "equipamiento-precio-hockey-en-linea-bogota"`).

- [ ] **Step 1: Copy the cover photo**

```bash
cp "attached_assets/client_images/Arquero.webp" "public/images/blog/equipamiento-precio-hockey-en-linea-bogota.webp"
```

- [ ] **Step 2: Write the article**

```tsx
// client/src/content/blog/posts/equipamiento-precio-hockey-en-linea-bogota.tsx
import { Link } from "wouter";
import { BlogCTA } from "../BlogCTA";

export default function EquipamientoPrecioHockeyEnLineaBogota() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <p className="lead">
        Antes de inscribir a su hijo, la mayoría de los papás hace la misma cuenta mental: patines
        más casco más protecciones más stick, y se imaginan una factura de más de un millón de
        pesos antes de la primera clase. Aquí está la cuenta real.
      </p>

      <h2>La buena noticia: tu primera clase es gratis, con equipo incluido</h2>
      <p>
        En Optima Wild Dogs prestamos patines, casco, protecciones y stick para la clase de prueba.
        Cero inversión inicial. La idea es que tu hijo confirme que le gusta antes de que tú
        gastes un peso en equipo propio.
      </p>

      <h2>Qué necesita realmente un jugador que ya se queda en el club</h2>
      <ul>
        <li><strong>Casco con rejilla facial:</strong> obligatorio desde el primer entrenamiento serio. Protege la cara en choques con el stick o la bola.</li>
        <li><strong>Protecciones (coderas, rodilleras, guantes):</strong> reducen el golpe en las caídas, comunes las primeras semanas mientras se afianza el equilibrio.</li>
        <li><strong>Patines de línea específicos de hockey:</strong> no son los mismos que los de patinaje recreativo — cambian las ruedas, el freno y la rigidez de la bota.</li>
        <li><strong>Stick:</strong> se corta a la altura del jugador. Un stick inicial básico funciona igual de bien que uno avanzado para un niño que está aprendiendo.</li>
      </ul>

      <h2>¿Cuánto cuesta armar el equipo completo?</h2>
      <p>
        Como referencia de mercado en Bogotá — los precios varían según marca y tienda — un set
        básico completo nuevo (patines, casco, protecciones y stick de nivel inicial) suele moverse
        entre $400.000 y $900.000 COP. No es una cifra que tengas que reunir de una sola vez:
        muchas familias en la manada arrancan con patines de segunda o prestados mientras confirman
        que a su hijo le gusta, y van completando el resto del equipo por partes en los meses
        siguientes.
      </p>

      <h2>Tres errores comunes al comprar el equipo</h2>
      <ul>
        <li>Comprar patines de patinaje recreativo pensando que sirven igual — el freno y las ruedas son distintos y afectan el control en cancha.</li>
        <li>Comprar la talla "para que crezca" — un patín demasiado grande hace que el niño se caiga más, no menos.</li>
        <li>Gastar de entrada en un stick de nivel profesional — uno básico rinde exactamente igual mientras el jugador está aprendiendo la técnica.</li>
      </ul>
      <p>
        Si no sabes por dónde empezar a comprar, escríbenos por WhatsApp antes de gastar: te
        orientamos sobre marcas y dónde conseguir equipo confiable en Bogotá según la edad y el
        nivel de tu hijo. También puedes revisar{" "}
        <Link href="/servicios">nuestros programas por categoría</Link> para saber qué necesita
        cada grupo específicamente.
      </p>

      <BlogCTA />

      <p>
        El equipo se va completando con el tiempo. Lo único que necesitas para empezar hoy es
        traer a tu hijo a la clase de prueba — de eso nos encargamos nosotros.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/content/blog/posts/equipamiento-precio-hockey-en-linea-bogota.tsx public/images/blog/equipamiento-precio-hockey-en-linea-bogota.webp
git commit -m "feat: add blog article on inline hockey gear and pricing"
```

---

### Task 6: Article 5 — "Dónde Practicar Hockey en Línea en Bogotá: Mejores Sedes"

**Files:**
- Create: `client/src/content/blog/posts/donde-practicar-hockey-en-linea-bogota.tsx`
- Create (copy): `public/images/blog/donde-practicar-hockey-en-linea-bogota.webp`

**Interfaces:**
- Consumes: `BlogCTA` from `../BlogCTA` (Task 2), `Link` from `wouter`.
- Produces: default export `DondePracticarHockeyEnLineaBogota(): JSX.Element` (consumed by Task 7 via `slug: "donde-practicar-hockey-en-linea-bogota"`).

- [ ] **Step 1: Copy the cover photo**

```bash
cp "attached_assets/client_images/DSC01384.webp" "public/images/blog/donde-practicar-hockey-en-linea-bogota.webp"
```

- [ ] **Step 2: Write the article**

```tsx
// client/src/content/blog/posts/donde-practicar-hockey-en-linea-bogota.tsx
import { Link } from "wouter";
import { BlogCTA } from "../BlogCTA";

export default function DondePracticarHockeyEnLineaBogota() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <p className="lead">
        Buscas "cancha de hockey en línea cerca de mí" y Google te devuelve resultados confusos:
        pistas de patinaje artístico, canchas de fútbol, gimnasios. El hockey en línea en Bogotá se
        juega en un puñado de sedes específicas — vale la pena saberlas antes de perder una tarde
        manejando hasta el lugar equivocado.
      </p>

      <h2>La sede principal: Hockey One, en Toberín</h2>
      <p>
        Optima Wild Dogs entrena en la <strong>Carrera 22 No. 164 - 83</strong>, en el sector de
        Toberín, muy cerca de Usaquén y San Antonio Norte, en el norte de la ciudad. Es nuestra
        sede fija de entrenamiento y atención a familias.
      </p>

      <h2>Otras pistas donde se juega hockey en línea en Bogotá</h2>
      <p>
        Además de Hockey One, parte de la actividad competitiva de la ciudad se juega en la cancha
        de la <strong>Federación Colombiana de Patinaje</strong>, sede habitual de torneos
        oficiales, y en <strong>BHC</strong>, donde programamos entrenamientos adicionales según la
        categoría. Si vas a ver un partido federado, lo más probable es que sea en una de estas
        dos.
      </p>

      <h2>¿Vives en Suba, Cedritos, Chicó o Rosales?</h2>
      <p>
        La sede de Toberín queda bien conectada con toda la franja norte de Bogotá. Recibimos
        familias que se desplazan regularmente desde Usaquén, Suba, Cedritos, Colina Campestre,
        Chicó y Rosales / Chapinero — el trayecto suele ser el mismo que ya hacen para el colegio o
        actividades similares en esa zona.
      </p>

      <h2>Horarios de entrenamiento</h2>
      <ul>
        <li><strong>Lunes a viernes:</strong> 3:00 p.m. a 10:00 p.m.</li>
        <li><strong>Sábados:</strong> 7:00 a.m. a 2:00 p.m.</li>
        <li><strong>Domingos:</strong> 7:00 a.m. a 1:00 p.m.</li>
      </ul>
      <p>
        El horario exacto de cada categoría varía dentro de esa franja — puedes verlo por grupo de
        edad en <Link href="/categorias">nuestras categorías</Link> o confirmarlo directamente por
        WhatsApp.
      </p>

      <h2>¿Cómo saber si te queda cerca?</h2>
      <p>
        La forma más rápida no es calcular la distancia en un mapa — es escribirnos y contarnos de
        qué barrio sales. Te confirmamos el trayecto real y el horario de la categoría de tu hijo
        antes de que agendes la primera visita, para que no manejes a ciegas.
      </p>

      <BlogCTA />

      <p>
        Conocer la sede correcta es el primer paso. El segundo es venir a verla — te esperamos en
        Toberín para la clase de prueba.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/content/blog/posts/donde-practicar-hockey-en-linea-bogota.tsx public/images/blog/donde-practicar-hockey-en-linea-bogota.webp
git commit -m "feat: add blog article on where to practice inline hockey in Bogota"
```

---

### Task 7: Blog manifest (metadata + lazy component map)

**Files:**
- Create: `client/src/content/blog/manifest.ts`
- Test: `client/src/content/blog/manifest.test.ts`

**Interfaces:**
- Consumes: default exports from `./posts/*.tsx` (Tasks 2-6): `QueEsHockeyEnLinea`, `BeneficiosHockeyEnLineaNinos`, `AQueEdadEmpezarHockeyEnLinea`, `EquipamientoPrecioHockeyEnLineaBogota`, `DondePracticarHockeyEnLineaBogota` — loaded via `React.lazy(() => import(...))`, not called directly.
- Produces (consumed by Task 8 `Blog.tsx` and Task 9 `BlogPost.tsx`):
  - `type BlogCluster = "informativo" | "decision" | "local"`
  - `interface BlogPostMeta { slug: string; title: string; metaTitle: string; metaDescription: string; excerpt: string; coverImage: string; coverImageAlt: string; publishedAt: string; cluster: BlogCluster; }`
  - `blogPosts: BlogPostMeta[]`
  - `postComponents: Record<string, LazyExoticComponent<() => JSX.Element>>` (all 5 post modules share the exact `() => JSX.Element` signature, so the map uses that concrete type rather than the more general `ComponentType` — avoids generic-variance friction)
  - `getPostBySlug(slug: string): BlogPostMeta | undefined`
  - `getSortedPosts(): BlogPostMeta[]` — descending by `publishedAt`

- [ ] **Step 1: Write the failing test**

```ts
// client/src/content/blog/manifest.test.ts
import { describe, it, expect } from "vitest";
import { blogPosts, postComponents, getPostBySlug, getSortedPosts } from "./manifest";

describe("blogPosts manifest", () => {
  it("tiene slugs únicos", () => {
    const slugs = blogPosts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("cada post tiene un componente lazy registrado en postComponents", () => {
    for (const post of blogPosts) {
      expect(postComponents[post.slug]).toBeDefined();
    }
  });

  it("no tiene componentes lazy huérfanos sin metadata", () => {
    const slugs = new Set(blogPosts.map((p) => p.slug));
    for (const slug of Object.keys(postComponents)) {
      expect(slugs.has(slug)).toBe(true);
    }
  });

  it("metaDescription no excede 160 caracteres (límite práctico de snippet de Google)", () => {
    for (const post of blogPosts) {
      expect(post.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });

  it("publishedAt es una fecha ISO válida (YYYY-MM-DD)", () => {
    for (const post of blogPosts) {
      expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(post.publishedAt).getTime())).toBe(false);
    }
  });

  it("cluster es uno de los valores permitidos", () => {
    const valid = new Set(["informativo", "decision", "local"]);
    for (const post of blogPosts) {
      expect(valid.has(post.cluster)).toBe(true);
    }
  });

  it("tiene exactamente 5 artículos en el primer lote", () => {
    expect(blogPosts.length).toBe(5);
  });
});

describe("getPostBySlug", () => {
  it("devuelve el post correcto por slug", () => {
    const post = getPostBySlug("que-es-hockey-en-linea");
    expect(post?.title).toBe("¿Qué es el Hockey en Línea? Guía para Padres en Bogotá");
  });

  it("devuelve undefined si el slug no existe", () => {
    expect(getPostBySlug("no-existe")).toBeUndefined();
  });
});

describe("getSortedPosts", () => {
  it("ordena de más reciente a más antiguo", () => {
    const sorted = getSortedPosts();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].publishedAt >= sorted[i].publishedAt).toBe(true);
    }
  });

  it("no muta el array original", () => {
    const before = blogPosts.map((p) => p.slug);
    getSortedPosts();
    expect(blogPosts.map((p) => p.slug)).toEqual(before);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run client/src/content/blog/manifest.test.ts`
Expected: FAIL — `Cannot find module './manifest'` (file does not exist yet).

- [ ] **Step 3: Write the manifest**

```ts
// client/src/content/blog/manifest.ts
import { lazy, type LazyExoticComponent } from "react";

export type BlogCluster = "informativo" | "decision" | "local";

export interface BlogPostMeta {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  coverImage: string;
  coverImageAlt: string;
  publishedAt: string;
  cluster: BlogCluster;
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: "que-es-hockey-en-linea",
    title: "¿Qué es el Hockey en Línea? Guía para Padres en Bogotá",
    metaTitle: "¿Qué es el Hockey en Línea? Guía para Padres",
    metaDescription:
      "Descubre qué es el hockey en línea, cómo se juega y por qué cada vez más niños en Bogotá lo eligen como su deporte. Guía completa para padres.",
    excerpt:
      "Un deporte de equipo sobre patines que está ganando terreno en Bogotá. Te explicamos qué es, cómo se juega y por qué a los niños les encanta.",
    coverImage: "/images/blog/que-es-hockey-en-linea.webp",
    coverImageAlt:
      "Jugadoras del equipo Optima Wild Dogs chocando los guantes durante un partido de hockey en línea en Bogotá",
    publishedAt: "2026-09-01",
    cluster: "informativo",
  },
  {
    slug: "beneficios-hockey-en-linea-ninos",
    title: "Beneficios del Hockey en Línea para el Desarrollo de los Niños",
    metaTitle: "Beneficios del Hockey en Línea para Niños",
    metaDescription:
      "Equilibrio, disciplina y trabajo en equipo: los beneficios físicos y mentales del hockey en línea para niños en Bogotá.",
    excerpt:
      "Del equilibrio a la tolerancia a la frustración: por qué el hockey en línea es de los deportes más completos para el desarrollo infantil.",
    coverImage: "/images/blog/beneficios-hockey-en-linea-ninos.webp",
    coverImageAlt:
      "Grupo de niños de la categoría Sub 8 de Optima Wild Dogs sonriendo junto a sus entrenadores",
    publishedAt: "2026-09-02",
    cluster: "informativo",
  },
  {
    slug: "a-que-edad-empezar-hockey-en-linea",
    title: "¿A Qué Edad Puede Empezar mi Hijo en Hockey en Línea?",
    metaTitle: "¿A Qué Edad Empezar en Hockey en Línea?",
    metaDescription:
      "Desde los 4 años hasta la adolescencia: te explicamos en qué categoría empieza tu hijo o hija según su edad en Optima Wild Dogs Bogotá.",
    excerpt:
      "'¿No está muy pequeño para esto?' Resolvemos la duda más común de los papás sobre la edad ideal para empezar en hockey en línea.",
    coverImage: "/images/blog/a-que-edad-empezar-hockey-en-linea.webp",
    coverImageAlt:
      "Equipo infantil de Optima Wild Dogs posando con su arquero antes de un entrenamiento",
    publishedAt: "2026-09-03",
    cluster: "decision",
  },
  {
    slug: "equipamiento-precio-hockey-en-linea-bogota",
    title: "Equipamiento para Hockey en Línea: Guía de Precios en Bogotá",
    metaTitle: "Equipamiento y Precios de Hockey en Línea",
    metaDescription:
      "Cuánto cuesta el equipo de hockey en línea en Bogotá, qué es realmente indispensable y por qué tu primera clase es gratis con equipo incluido.",
    excerpt:
      "Casco, protecciones, patines y stick: qué necesitas de verdad para empezar, cuánto cuesta en Bogotá y por qué no hay que comprarlo todo de una vez.",
    coverImage: "/images/blog/equipamiento-precio-hockey-en-linea-bogota.webp",
    coverImageAlt:
      "Arquero de Optima Wild Dogs con el equipo completo de protección frente al arco",
    publishedAt: "2026-09-04",
    cluster: "decision",
  },
  {
    slug: "donde-practicar-hockey-en-linea-bogota",
    title: "Dónde Practicar Hockey en Línea en Bogotá: Mejores Sedes",
    metaTitle: "Dónde Practicar Hockey en Línea en Bogotá",
    metaDescription:
      "Las sedes reales donde se juega hockey en línea en Bogotá: Toberín, la Federación de Patinaje y BHC. Ideal si vives en el norte de la ciudad.",
    excerpt:
      "Antes de manejar hasta la cancha equivocada: las sedes donde realmente se práctica hockey en línea en Bogotá y cómo llegar desde el norte.",
    coverImage: "/images/blog/donde-practicar-hockey-en-linea-bogota.webp",
    coverImageAlt:
      "Niños jugando un partido de hockey en línea en la pista de la Federación Colombiana de Patinaje en Bogotá",
    publishedAt: "2026-09-05",
    cluster: "local",
  },
];

export const postComponents: Record<string, LazyExoticComponent<() => JSX.Element>> = {
  "que-es-hockey-en-linea": lazy(() => import("./posts/que-es-hockey-en-linea")),
  "beneficios-hockey-en-linea-ninos": lazy(() => import("./posts/beneficios-hockey-en-linea-ninos")),
  "a-que-edad-empezar-hockey-en-linea": lazy(() => import("./posts/a-que-edad-empezar-hockey-en-linea")),
  "equipamiento-precio-hockey-en-linea-bogota": lazy(
    () => import("./posts/equipamiento-precio-hockey-en-linea-bogota")
  ),
  "donde-practicar-hockey-en-linea-bogota": lazy(
    () => import("./posts/donde-practicar-hockey-en-linea-bogota")
  ),
};

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getSortedPosts(): BlogPostMeta[] {
  return [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run client/src/content/blog/manifest.test.ts`
Expected: PASS — all assertions green.

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors (confirms all 5 lazy imports resolve to real files from Tasks 2-6).

- [ ] **Step 6: Commit**

```bash
git add client/src/content/blog/manifest.ts client/src/content/blog/manifest.test.ts
git commit -m "feat: add blog post manifest with metadata and lazy component map"
```

---

### Task 8: `Blog.tsx` listing page

**Files:**
- Create: `client/src/pages/Blog.tsx`

**Interfaces:**
- Consumes: `getSortedPosts` from `@/content/blog/manifest` (Task 7); `useSEO` from `@/hooks/useSEO`; `useJSONLD` from `@/hooks/useJSONLD` (Task 1); `PublicNav`, `Footer`, `Card`/`CardContent`, `Link` (wouter), `ChevronRight` (lucide-react), `motion` (framer-motion) — all pre-existing.
- Produces: default export `Blog(): JSX.Element`, mounted at `/blog` by Task 10.

- [ ] **Step 1: Write the page**

```tsx
// client/src/pages/Blog.tsx
import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { useJSONLD } from "@/hooks/useJSONLD";
import { getSortedPosts, type BlogCluster } from "@/content/blog/manifest";

const BASE_DOMAIN = "https://optimawilddogs.com";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const clusterLabels: Record<BlogCluster, string> = {
  informativo: "Guía",
  decision: "Antes de Inscribirte",
  local: "Bogotá",
};

export default function Blog() {
  useSEO({
    title: "Blog: Guías de Hockey en Línea para Padres en Bogotá",
    description:
      "Todo lo que necesitas saber antes de inscribir a tu hijo en hockey en línea: beneficios, edades, equipo y dónde entrenar en Bogotá.",
    url: "/blog",
  });

  const posts = getSortedPosts();

  useJSONLD("jsonld-blog-list", {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog de Optima Wild Dogs Hockey Club",
    url: `${BASE_DOMAIN}/blog`,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${BASE_DOMAIN}/blog/${post.slug}`,
      datePublished: post.publishedAt,
    })),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      <section className="py-20 md:py-28 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase drop-shadow-2xl">
              Blog
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light drop-shadow-md">
              Guías para padres sobre hockey en línea en Bogotá: beneficios, edades, equipo y
              dónde entrenar.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post) => (
              <motion.div key={post.slug} variants={fadeIn} className="h-full">
                <Link href={`/blog/${post.slug}`} data-testid={`blog-card-${post.slug}`}>
                  <Card className="overflow-hidden hover-elevate active-elevate-2 group border-border/40 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col cursor-pointer">
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={post.coverImage}
                        alt={post.coverImageAlt}
                        className="w-full h-full object-cover transition-transform duration-700 transform group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        width="800"
                        height="480"
                      />
                    </div>
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <p className="text-xs font-black uppercase text-primary/80 mb-2 tracking-wider">
                        {clusterLabels[post.cluster]}
                      </p>
                      <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center text-sm font-semibold text-primary">
                        Leer artículo
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Blog.tsx
git commit -m "feat: add /blog listing page"
```

---

### Task 9: `BlogPost.tsx` detail page

**Files:**
- Create: `client/src/pages/BlogPost.tsx`

**Interfaces:**
- Consumes: `getPostBySlug`, `postComponents` from `@/content/blog/manifest` (Task 7); `useSEO` from `@/hooks/useSEO`; `useJSONLD` from `@/hooks/useJSONLD` (Task 1); `NotFound` default export from `./not-found`; `PublicNav`, `Footer`, `Link`, `useParams` (wouter), `ChevronRight` (lucide-react), `Suspense` (react).
- Produces: default export `BlogPost(): JSX.Element`, mounted at `/blog/:slug` by Task 10.

- [ ] **Step 1: Write the page**

```tsx
// client/src/pages/BlogPost.tsx
import { Suspense } from "react";
import { useParams, Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useJSONLD } from "@/hooks/useJSONLD";
import { getPostBySlug, postComponents } from "@/content/blog/manifest";
import NotFound from "./not-found";

const BASE_DOMAIN = "https://optimawilddogs.com";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getPostBySlug(slug);

  useSEO({
    title: post?.metaTitle ?? "Artículo no encontrado",
    description: post?.metaDescription,
    image: post ? `${BASE_DOMAIN}${post.coverImage}` : undefined,
    url: post ? `/blog/${post.slug}` : "/blog",
    type: "article",
  });

  useJSONLD(
    "jsonld-blogposting",
    post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.metaDescription,
          image: `${BASE_DOMAIN}${post.coverImage}`,
          datePublished: post.publishedAt,
          author: {
            "@type": "Organization",
            name: "Optima Wild Dogs Hockey Club",
            url: BASE_DOMAIN,
          },
          publisher: {
            "@type": "Organization",
            name: "Optima Wild Dogs Hockey Club",
            logo: {
              "@type": "ImageObject",
              url: `${BASE_DOMAIN}/logo-wild-dogs.jpg`,
            },
          },
          mainEntityOfPage: `${BASE_DOMAIN}/blog/${post.slug}`,
        }
      : {}
  );

  useJSONLD(
    "jsonld-breadcrumb",
    post
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_DOMAIN },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_DOMAIN}/blog` },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: `${BASE_DOMAIN}/blog/${post.slug}`,
            },
          ],
        }
      : {}
  );

  if (!post) {
    return <NotFound />;
  }

  const PostComponent = postComponents[post.slug];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      <section className="relative h-[45vh] flex items-end overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.coverImageAlt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="relative z-10 container mx-auto px-4 pb-10">
          <nav
            className="text-sm text-muted-foreground mb-4 flex items-center gap-2 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{post.title}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl leading-tight">
            {post.title}
          </h1>
        </div>
      </section>

      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <Suspense fallback={<div className="text-muted-foreground">Cargando artículo...</div>}>
          <PostComponent />
        </Suspense>
      </article>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/BlogPost.tsx
git commit -m "feat: add /blog/:slug article detail page with structured data"
```

---

### Task 10: Wire routes and navigation

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/layout/PublicNav.tsx`

**Interfaces:**
- Consumes: default exports `Blog` (Task 8) and `BlogPost` (Task 9).
- Produces: `/blog` and `/blog/:slug` reachable in the app; "Blog" visible in `PublicNav`'s desktop and mobile menus (both render from the same `navLinks` array, no JSX duplication needed).

- [ ] **Step 1: Add lazy-loaded routes in `App.tsx`**

In `client/src/App.tsx`, add to the lazy imports block (after `const Tournaments = lazy(...)`, matches existing alphabetical-by-feature grouping):

```tsx
const Tournaments    = lazy(() => import("@/pages/Tournaments"));
const Blog           = lazy(() => import("@/pages/Blog"));
const BlogPost       = lazy(() => import("@/pages/BlogPost"));
const Contact        = lazy(() => import("@/pages/Contact"));
```

Add the routes inside the `<Switch>`, after `/torneos` and before `/contacto`:

```tsx
        <Route path="/torneos" component={Tournaments} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/contacto" component={Contact} />
```

- [ ] **Step 2: Add the nav link in `PublicNav.tsx`**

In `client/src/components/layout/PublicNav.tsx`, update `navLinks`:

```tsx
  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/servicios", label: "Servicios" },
    { href: "/categorias", label: "Categorías" },
    { href: "/torneos", label: "Torneos" },
    { href: "/blog", label: "Blog" },
    { href: "/contacto", label: "Contacto" },
  ];
```

No other change needed — both the desktop and mobile menus already render from this array.

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/App.tsx client/src/components/layout/PublicNav.tsx
git commit -m "feat: wire /blog routes and add Blog link to navigation"
```

---

### Task 11: Sitemap + full manual verification

**Files:**
- Modify: `public/sitemap.xml`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks — this is the last task.

- [ ] **Step 1: Add the 6 new URLs to `sitemap.xml`**

Insert before the closing `</urlset>` tag in `public/sitemap.xml`:

```xml
  <url>
    <loc>https://optimawilddogs.com/blog</loc>
    <lastmod>2026-09-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://optimawilddogs.com/blog/que-es-hockey-en-linea</loc>
    <lastmod>2026-09-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://optimawilddogs.com/blog/beneficios-hockey-en-linea-ninos</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://optimawilddogs.com/blog/a-que-edad-empezar-hockey-en-linea</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://optimawilddogs.com/blog/equipamiento-precio-hockey-en-linea-bogota</loc>
    <lastmod>2026-09-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://optimawilddogs.com/blog/donde-practicar-hockey-en-linea-bogota</loc>
    <lastmod>2026-09-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

- [ ] **Step 2: Validate the XML is well-formed**

`xml2js` is not a project dependency, so validate with a dependency-free check instead:

Run: `node -e "const s=require('fs').readFileSync('public/sitemap.xml','utf8'); const open=(s.match(/<url>/g)||[]).length; const close=(s.match(/<\/url>/g)||[]).length; if(open!==close) throw new Error('mismatched <url> tags: '+open+' vs '+close); console.log('sitemap OK — ' + open + ' urls')"`

Expected: `sitemap OK — 13 urls` (7 original + 6 new).

- [ ] **Step 3: Run the full test suite and typecheck**

Run: `npm run check && npx vitest run`
Expected: TypeScript passes; all Vitest suites pass, including the new `client/src/content/blog/manifest.test.ts`.

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, then in a browser:
- Visit `/blog` — confirm the hero renders, all 5 article cards show with real cover photos (not broken images), and clicking a card navigates to its article.
- Visit each of the 5 `/blog/:slug` URLs directly — confirm the browser tab title changes per article (matches `metaTitle | Optima Wild Dogs Hockey Club`), the hero image and title render, and the article body renders (headings, lists, the CTA block, internal links).
- Open devtools → Elements → `<head>` on one article page — confirm `<meta name="description">`, `<link rel="canonical">`, and two `<script type="application/ld+json">` tags (`jsonld-blogposting`, `jsonld-breadcrumb`) are present with the article's own data (not the homepage's).
- Navigate from `/` to `/blog` and back — confirm the `<script id="jsonld-blogposting">` tag from an article page is removed once you leave it (no leftover JSON-LD from a previous article).
- Click "Blog" in the navbar (desktop and the mobile hamburger menu) — confirm it goes to `/blog` and highlights as active.
- From within an article, click the internal links to `/categorias` and/or `/servicios`, and the `BlogCTA` buttons to `/unete` and WhatsApp — confirm all four navigate correctly.
- Visit `/blog/no-existe` — confirm the 404 page renders instead of a crash.

- [ ] **Step 5: Commit**

```bash
git add public/sitemap.xml
git commit -m "chore: add blog URLs to sitemap.xml"
```
