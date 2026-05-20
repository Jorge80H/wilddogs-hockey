# Wild Dogs Promo Video & Website Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear un video promocional de 30s con HyperFrames para Wild Dogs Hockey Club e integrarlo en una nueva sección de la Landing page del sitio web.

**Architecture:** El video se crea como composición HyperFrames en un subdirectorio `wilddogs-promo-video/`, se renderiza a `.mp4`, se copia a `public/videos/`, y se embebe en un nuevo componente `PromoVideoSection` insertado en `Landing.tsx`.

**Tech Stack:** HyperFrames CLI, React 18, Framer Motion, Tailwind CSS, TypeScript

---

## File Map

| File | Action |
|------|--------|
| `wilddogs-promo-video/` | CREATE — directorio del proyecto HyperFrames |
| `wilddogs-promo-video/compositions/promo.tsx` | CREATE — composición principal del video |
| `public/videos/promo-wild-dogs.mp4` | CREATE — video renderizado final |
| `client/src/components/sections/PromoVideoSection.tsx` | CREATE — componente React del sitio |
| `client/src/pages/Landing.tsx` | MODIFY — insertar PromoVideoSection |

---

## Task 1: Inicializar proyecto HyperFrames

**Files:**
- Create: `wilddogs-promo-video/` (directorio nuevo en la raíz del proyecto)

- [ ] **Step 1.1: Cambiar al directorio raíz del proyecto**

```bash
cd "g:/EMPLEADOS DIGITALES/CLIENTES/WILDDOGS_WEB/WildDogsHockey-1"
```

- [ ] **Step 1.2: Crear directorio e inicializar HyperFrames**

```bash
mkdir wilddogs-promo-video
cd wilddogs-promo-video
npx hyperframes@latest init
```

Cuando el CLI pregunte el nombre del proyecto usar: `wilddogs-promo`  
Cuando pregunte el template: elegir el más básico (blank/default)

- [ ] **Step 1.3: Verificar que el proyecto fue creado**

```bash
ls
```

Debe existir al menos: `package.json`, `compositions/` o similar estructura base.

- [ ] **Step 1.4: Instalar dependencias**

```bash
npm install
```

---

## Task 2: Copiar assets del club al proyecto HyperFrames

**Files:**
- Create: `wilddogs-promo-video/public/images/` (directorio de imágenes)

- [ ] **Step 2.1: Crear directorio de imágenes**

```bash
mkdir -p public/images
```

(Ejecutar desde dentro de `wilddogs-promo-video/`)

- [ ] **Step 2.2: Copiar imágenes clave del club**

Desde la raíz del proyecto (`WildDogsHockey-1/`), copiar las imágenes al proyecto HyperFrames:

```bash
cp attached_assets/client_images/Jugadores_Wilddogs.webp wilddogs-promo-video/public/images/
cp attached_assets/client_images/Logo_Optima.webp wilddogs-promo-video/public/images/
cp attached_assets/client_images/DSC01384.webp wilddogs-promo-video/public/images/
cp attached_assets/client_images/IMG_8260.webp wilddogs-promo-video/public/images/
cp attached_assets/client_images/Arquero.webp wilddogs-promo-video/public/images/
cp attached_assets/client_images/IMG_7933.webp wilddogs-promo-video/public/images/
cp attached_assets/client_images/IMG_8302.webp wilddogs-promo-video/public/images/
cp attached_assets/client_images/textura_grande_wilddogs.webp wilddogs-promo-video/public/images/
```

- [ ] **Step 2.3: Verificar que los archivos existen**

```bash
ls wilddogs-promo-video/public/images/
```

Esperado: 8 archivos `.webp`

---

## Task 3: Crear la composición del video promo

**Files:**
- Create: `wilddogs-promo-video/compositions/promo.tsx`

Invocar el skill `hyperframes-cli` para confirmar la sintaxis exacta de la API antes de escribir este archivo. Luego escribir la composición siguiendo este diseño:

**Estructura de escenas (30s a 30fps = 900 frames):**

| Escena | Frames | Contenido |
|--------|--------|-----------|
| 1 | 0–90 | Fondo negro → Logo aparece con fade + glow naranja |
| 2 | 90–240 | Foto equipo full-screen + texto "El Poder de la Manada" |
| 3 | 240–450 | Montaje: 4 fotos de acción (3s cada una con fade) |
| 4 | 450–600 | Stats: "30 Jugadores · 6 Categorías · 100% Pasión" |
| 5 | 600–780 | Foto celebración + "Únete a la Manada" |
| 6 | 780–900 | Logo centrado + URL |

**Paleta:**
- Background: `#0a0f1e`
- Accent: `#EA580C`
- Text: `#FFFFFF`

- [ ] **Step 3.1: Invocar skill hyperframes-cli para conocer la API exacta**

Invocar el skill `hyperframes-cli` con el argumento: "show composition syntax for image slideshow with text overlays"

- [ ] **Step 3.2: Escribir la composición usando la API confirmada**

Crear `wilddogs-promo-video/compositions/promo.tsx` con la composición completa siguiendo la sintaxis que retornó el skill.

- [ ] **Step 3.3: Previsualizar en el studio**

```bash
cd wilddogs-promo-video
npx hyperframes preview
```

Abrir la URL que muestre el CLI y verificar que las escenas se ven correctas.

---

## Task 4: Renderizar el video a MP4

**Files:**
- Create: `wilddogs-promo-video/out/promo.mp4`

- [ ] **Step 4.1: Renderizar la composición**

```bash
cd wilddogs-promo-video
npx hyperframes render compositions/promo.tsx --output out/promo.mp4
```

Esperar a que termine el render (puede tomar 1-3 minutos).

- [ ] **Step 4.2: Verificar que el video fue creado y tiene el tamaño esperado**

```bash
ls -lh out/promo.mp4
```

Debe existir un archivo `.mp4` de al menos varios MB.

- [ ] **Step 4.3: Copiar el video al directorio public del sitio web**

Desde la raíz del proyecto `WildDogsHockey-1/`:

```bash
mkdir -p public/videos
cp wilddogs-promo-video/out/promo.mp4 public/videos/promo-wild-dogs.mp4
```

- [ ] **Step 4.4: Verificar el archivo en public/**

```bash
ls -lh public/videos/
```

---

## Task 5: Crear componente PromoVideoSection

**Files:**
- Create: `client/src/components/sections/PromoVideoSection.tsx`

- [ ] **Step 5.1: Crear directorio sections si no existe**

```bash
mkdir -p WildDogsHockey-1/client/src/components/sections
```

- [ ] **Step 5.2: Crear el componente**

Crear `client/src/components/sections/PromoVideoSection.tsx` con este contenido exacto:

```tsx
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/client_images/Logo_Optima.webp";

export function PromoVideoSection() {
  return (
    <section className="py-24 bg-[#0a0f1e] relative overflow-hidden">
      {/* Texture overlay sutil */}
      <div className="absolute inset-0 opacity-5 bg-[url('/images/textura_grande_wilddogs.webp')] bg-cover" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <img
            src={logoImg}
            alt="Wild Dogs Hockey Club"
            className="h-20 w-auto mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,88,12,0.6)]"
          />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Somos <span className="text-[#EA580C]">Wild Dogs</span>
          </h2>
          <p className="text-white/50 text-sm uppercase tracking-widest font-semibold">
            El Poder de la Manada
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-[0_0_60px_-10px_rgba(234,88,12,0.4)] border border-[#EA580C]/20"
        >
          <video
            className="w-full aspect-video bg-black"
            controls
            preload="metadata"
            poster="/assets/logo.png"
          >
            <source src="/videos/promo-wild-dogs.mp4" type="video/mp4" />
            Tu navegador no soporta la reproducción de video.
          </video>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex justify-center gap-10 md:gap-16 mt-10 mb-8"
        >
          {[
            { value: "30", label: "Jugadores" },
            { value: "6", label: "Categorías" },
            { value: "100%", label: "Pasión" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-[#EA580C]">{stat.value}</div>
              <div className="text-xs text-white/50 uppercase tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Link href="/Unete">
            <Button
              size="lg"
              className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white rounded-full px-10 py-6 h-auto text-lg shadow-[0_0_30px_-5px_rgba(234,88,12,0.5)] hover:shadow-[0_0_50px_-5px_rgba(234,88,12,0.7)] transition-all duration-300"
            >
              Únete a la Manada
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.3: Verificar que no hay errores de TypeScript**

```bash
cd WildDogsHockey-1
npm run check
```

Si hay errores, corregirlos antes de continuar.

---

## Task 6: Insertar PromoVideoSection en Landing.tsx

**Files:**
- Modify: `client/src/pages/Landing.tsx`

- [ ] **Step 6.1: Agregar el import del componente**

En `client/src/pages/Landing.tsx`, agregar al bloque de imports existente (línea ~16, después del último import):

```tsx
import { PromoVideoSection } from "@/components/sections/PromoVideoSection";
```

- [ ] **Step 6.2: Insertar la sección entre Stats y Mission**

En `Landing.tsx`, localizar el cierre de la sección Stats (la que tiene `py-16 bg-card border-b border-border/40`) y el inicio de la sección Mission (`py-24 relative overflow-hidden`).

Insertar `<PromoVideoSection />` entre ellas:

```tsx
      {/* Stats Section */}
      <section className="py-16 bg-card border-b border-border/40">
        {/* ... contenido existente sin cambios ... */}
      </section>

      {/* NEW: Promo Video Section */}
      <PromoVideoSection />

      {/* Mission & Vision */}
      <section className="py-24 relative overflow-hidden">
        {/* ... contenido existente sin cambios ... */}
      </section>
```

- [ ] **Step 6.3: Verificar TypeScript**

```bash
cd WildDogsHockey-1
npm run check
```

Esperado: 0 errores relacionados con los cambios.

- [ ] **Step 6.4: Correr el servidor de desarrollo y verificar visualmente**

```bash
npm run dev
```

Abrir `http://localhost:5000` y:
1. Verificar que la sección "Somos Wild Dogs" aparece entre Stats y Misión
2. Verificar que el logo se muestra con el glow naranja
3. Verificar que el reproductor de video aparece (puede mostrar "poster" si el .mp4 aún no está)
4. Verificar que el botón "Únete a la Manada" lleva a `/Unete`
5. Verificar que en móvil la sección se ve bien (responsive)

- [ ] **Step 6.5: Commit de los cambios del sitio web**

```bash
cd WildDogsHockey-1
git add client/src/components/sections/PromoVideoSection.tsx
git add client/src/pages/Landing.tsx
git commit -m "feat: add PromoVideoSection to Landing page with Wild Dogs branding"
```

---

## Voice-Over Copy (para grabar)

> *"En Bogotá, hay una manada que no se detiene.*
> *Wild Dogs Hockey Club — donde el hockey en línea se vive con pasión, disciplina y entrega.*
> *Desde los más pequeños hasta los grandes, todos forman parte de algo más grande.*
> *Treinta jugadores. Seis categorías. Un solo rugido.*
> *Únete a la manada. Únete a Optima Wild Dogs."*

---

## Self-Review

**Spec coverage:**
- ✅ Video HyperFrames 30s — Task 1–4
- ✅ Logo incluido — Task 3 (composición) y Task 5 (sección web)
- ✅ Datos reales del club (30 jugadores, 6 categorías) — Task 5 stats bar y Task 3 escena 4
- ✅ Copy voz en off — documentado arriba
- ✅ Actualización del website — Task 5–6
- ✅ Mejora visual (glow naranja, fondo oscuro, textura) — Task 5

**Placeholder check:** Ninguno. Task 3 requiere invocar hyperframes-cli para la sintaxis exacta — esto es intencional porque el API puede evolucionar.

**Type consistency:** El componente `PromoVideoSection` exportado en Task 5 es el mismo importado en Task 6.
