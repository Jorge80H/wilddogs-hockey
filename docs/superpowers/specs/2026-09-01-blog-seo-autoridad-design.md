# Blog de Autoridad SEO — Wild Dogs Hockey Club

## Contexto y objetivo

El sitio ya tiene una base sólida de SEO técnico y local (metadata on-page, JSON-LD `SportsClub`/`FAQPage`, geotagging, sitemap, guía operativa de Google Business Profile — ver `docs/GUIA_GOOGLE_BUSINESS_PROFILE_Y_SEO_LOCAL.md` y `memory.md` del 2026-08-09).

Lo que falta para que el club sea un **referente** de hockey en línea en Bogotá/Colombia es contenido de autoridad: artículos que capturen búsquedas informativas de padres que aún no conocen el deporte ni al club, y los lleven a agendar una clase de prueba gratis en `/unete`.

El hockey en línea es un mercado de nicho pequeño en Colombia — el contenido debe priorizar volumen de búsquedas informativas/locales por encima de keywords de marca, que casi nadie busca todavía.

## No objetivos (fuera de alcance de este spec)

- CMS o panel de administración para el blog (se evalúa en una iteración futura si el volumen de contenido lo justifica).
- Automatización del sitemap (con 5 artículos, mantenerlo a mano es más simple que construir un generador).
- Sección "Últimos artículos" en el Landing (posible mejora futura, no se construye ahora).
- SSR/prerendering del sitio (el resto del sitio ya funciona como SPA client-side con `useSEO`; el blog sigue el mismo patrón, no se cambia la arquitectura de renderizado).

## Modelo de contenido

Contenido estático versionado en el repo (sin backend nuevo), mismo patrón que el usuario ya tiene probado en otro proyecto (Celuvendo: markdown → componente React → commit).

- `client/src/content/blog/posts/<slug>.tsx` — un componente por artículo. Cuerpo del artículo en JSX (encabezados, listas, párrafos, CTAs internos), reutilizando `Button` y estilos Tailwind ya existentes en el proyecto.
- `client/src/content/blog/manifest.ts` — array `BlogPostMeta[]` exportado:
  ```ts
  interface BlogPostMeta {
    slug: string;
    title: string;           // usado en <h1> y listing
    metaTitle: string;        // para useSEO (puede diferir del h1)
    metaDescription: string;
    excerpt: string;          // resumen corto para la tarjeta del listing
    coverImage: string;
    publishedAt: string;      // ISO date
    cluster: "informativo" | "decision" | "local";
  }
  ```
  Más un `postComponents: Record<string, React.LazyExoticComponent<...>>` que mapea `slug → React.lazy(() => import("./posts/<slug>"))`.

## Rutas y páginas

- `/blog` → nueva página `client/src/pages/Blog.tsx`:
  - Grilla de tarjetas (mismo lenguaje visual que `Categories.tsx`: cards con imagen, título, excerpt).
  - Lee metadata desde `manifest.ts`, ordenado por `publishedAt` descendente.
  - `useSEO({ title: "Blog", description: ..., url: "/blog" })`.
  - JSON-LD `Blog`/`ItemList` con las URLs de los artículos.
- `/blog/:slug` → nueva página `client/src/pages/BlogPost.tsx`:
  - Busca el slug en el manifest; si no existe, redirige a `not-found`.
  - Carga el componente del artículo con `React.lazy` + `Suspense`.
  - `useSEO({ type: "article", title: metaTitle, description: metaDescription, image: coverImage, url: "/blog/${slug}" })` — reutiliza el hook existente sin modificarlo.
  - Inyecta JSON-LD `BlogPosting` (headline, datePublished, author: Organization "Optima Wild Dogs Hockey Club", image, mainEntityOfPage) y `BreadcrumbList` (Inicio > Blog > Artículo) vía un nuevo hook pequeño `useJSONLD(id, data)` en `client/src/hooks/useJSONLD.ts` que inserta/limpia un `<script type="application/ld+json">` en el `<head>`.
  - CTA final fijo: botón a `/unete` + enlace a WhatsApp (`WHATSAPP_URL` ya exportado desde `PublicNav.tsx`).

## Navegación

- `PublicNav.tsx`: agregar `{ href: "/blog", label: "Blog" }` al array `navLinks` (se propaga automático a desktop y mobile, no requiere tocar el JSX de renderizado).

## Rutas en `App.tsx`

```tsx
<Route path="/blog" component={Blog} />
<Route path="/blog/:slug" component={BlogPost} />
```
Agregadas junto a las demás rutas públicas (antes de `/dashboard`).

## Sitemap

Agregar a `public/sitemap.xml` (a mano, 6 entradas nuevas):
- `/blog` — `changefreq: weekly`, `priority: 0.8`
- `/blog/<slug>` × 5 — `changefreq: monthly`, `priority: 0.7`

## Voz y guía de copy

Tono ya establecido en el sitio (ver `LeadLanding.tsx`): cercano, energético, metáfora de "la manada" 🐺, headlines en mayúsculas/bold, CTAs directos ("Quiero unirme a la manada →"). Los artículos deben sonar como el mismo club, no como un blog genérico.

Reglas de escritura (del skill `copy-that-converts`, aplicadas a estos artículos):
- **Título**: verbo/pregunta + resultado específico, no genérico. Ya definidos abajo.
- **Apertura**: cada artículo arranca con una pregunta real de padre, una escena o un dato concreto — nunca "En el mundo actual del deporte...".
- **Dolor/duda concreta**: cuantificar cuando aplique (precios reales en COP, edades exactas, horarios reales) en vez de vaguedades.
- **Cadena "¿y eso qué?"**: cada beneficio mencionado debe bajar hasta el nivel emocional del padre (ej. "mejora el equilibrio" → "menos caídas y golpes" → "tú te preocupas menos cuando entrena").
- **Ritmo**: alternar frases cortas con frases largas. Nada de párrafos uniformes.
- **Cierre**: siempre termina en CTA a clase de prueba gratis, sin ambigüedad.
- Evitar palabras vacías de la kill list del skill (nada de "utilizar", "en el mundo actual", relleno corporativo).

## Primer lote: 5 artículos

| # | Slug | Título | Cluster | Keyword objetivo |
|---|------|--------|---------|-------------------|
| 1 | `que-es-hockey-en-linea` | ¿Qué es el Hockey en Línea? Guía para Padres en Bogotá | Informativo | "qué es el hockey en línea" |
| 2 | `beneficios-hockey-en-linea-ninos` | Beneficios del Hockey en Línea para el Desarrollo de los Niños | Informativo | "beneficios hockey en línea niños" |
| 3 | `a-que-edad-empezar-hockey-en-linea` | ¿A Qué Edad Puede Empezar mi Hijo en Hockey en Línea? | Decisión | "a qué edad empezar hockey niños" |
| 4 | `equipamiento-precio-hockey-en-linea-bogota` | Equipamiento para Hockey en Línea: Guía de Precios en Bogotá | Decisión | "equipamiento hockey en línea precio" |
| 5 | `donde-practicar-hockey-en-linea-bogota` | Dónde Practicar Hockey en Línea en Bogotá: Mejores Sedes | Local | "hockey en línea Bogotá dónde practicar" |

Cada artículo: 800-1200 palabras, enlaza internamente a `/servicios` y `/categorias`, cierra con CTA a `/unete`.

## Imágenes

Por artículo, se pregunta primero si hay una foto real del club aplicable (carpeta `attached_assets/` o similar); si no, se genera una imagen ilustrativa con la identidad visual de Wild Dogs (skill `wilddogs-brand`).

## Verificación

- `npm run check` (TypeScript) sin errores nuevos.
- `npm run dev`: revisar en navegador `/blog` y cada `/blog/:slug` — título de pestaña, meta description (devtools), JSON-LD presente en `<head>`.
- Confirmar que `public/sitemap.xml` sigue siendo XML válido.
- Confirmar que los enlaces internos (`/servicios`, `/categorias`, `/unete`) funcionan desde cada artículo.
