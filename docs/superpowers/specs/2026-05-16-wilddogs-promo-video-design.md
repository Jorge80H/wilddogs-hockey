# Wild Dogs Hockey Club — Promo Video & Website Update

## Overview

Create a 30-second HyperFrames promotional video for Optima Wild Dogs Hockey Club and embed it in a new section on the Landing page.

## Player Data (source: Basedatos_Deportistas_OWC.xlsx)

- **30 jugadores** registrados
- **6 categorías** activas (Sub 8 a Mayores)
- Ramas: masculino y femenino

## Video Spec

**Format:** HyperFrames composition → rendered .mp4  
**Duration:** ~30 seconds  
**Aspect ratio:** 16:9  
**Style:** Cinematográfico / épico — oscuro, naranja Wild Dogs, energético

### Scenes

| # | Timestamp | Content |
|---|-----------|---------|
| 1 | 0–3s | Pantalla negra → logo Wild Dogs con destello naranja |
| 2 | 3–8s | Foto equipo a pantalla completa + texto "El Poder de la Manada" |
| 3 | 8–15s | Montaje rápido 4 fotos de acción (de attached_assets/client_images) |
| 4 | 15–20s | Stats animadas: "30 Jugadores · 6 Categorías · 100% Pasión" |
| 5 | 20–26s | Foto celebración + texto "Únete a la Manada" |
| 6 | 26–30s | Logo centrado + URL del sitio |

### Brand Colors

- Background: `#0a0f1e` (negro azulado)
- Accent/Primary: `#EA580C` (naranja Wild Dogs)
- Text: `#FFFFFF`

### Assets disponibles

- Logo: `public/assets/logo.png`
- Fotos de acción: `attached_assets/client_images/` (Jugadores_Wilddogs.webp, DSC01384.webp, IMG_8260.webp, IMG_7933.webp, etc.)

### Voice-Over Copy

> *"En Bogotá, hay una manada que no se detiene.*
> *Wild Dogs Hockey Club — donde el hockey en línea se vive con pasión, disciplina y entrega.*
> *Desde los más pequeños hasta los grandes, todos forman parte de algo más grande.*
> *Treinta jugadores. Seis categorías. Un solo rugido.*
> *Únete a la manada. Únete a Optima Wild Dogs."*

## Website Update

### New Section: PromoVideoSection

**Location:** En `Landing.tsx`, entre la sección de Stats y la sección de Misión

**Design:**
- Fondo oscuro (`bg-black` o `bg-[#0a0f1e]`)
- Logo Wild Dogs centrado arriba
- Reproductor de video con aspect ratio 16:9, ancho máximo `max-w-4xl`
- Título: "Somos Wild Dogs" con acento naranja
- Botón CTA debajo del video

**Implementation:**
- Nuevo componente `PromoVideoSection` en `client/src/components/sections/PromoVideoSection.tsx`
- El .mp4 renderizado se coloca en `public/videos/promo-wild-dogs.mp4`
- Usar `<video>` HTML nativo con `controls`, `poster` (frame del logo)
- Animación de entrada con Framer Motion (ya instalado)
