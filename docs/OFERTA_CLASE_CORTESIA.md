# 🐺 Oferta de Clase de Cortesía — Optima Wild Dogs

Este documento cierra la Fase 0 de la campaña de captación: define exactamente qué se promete,
cuándo, dónde y quién responde. Es la fuente que debe aprobar el club antes de publicar
cualquier contenido de campaña (Instagram, Google Business Profile, referidos).

Las franjas de aquí ya están implementadas en el código de `/unete`
(`client/src/lib/leads.ts` → `TRIAL_SLOTS`), así que un cambio aquí debe reflejarse también ahí.

---

## 1. La oferta

**Clase de cortesía**: sesión real, dentro de un entrenamiento del grupo de su edad. No es una
demo aislada — el niño/a entrena con el equipo que le correspondería si se inscribe.

- **Incluye**: préstamo de patines y protecciones para la clase.
- **Duración**: la del entrenamiento normal de esa categoría (~2 horas, ver horarios en
  `Services.tsx`).
- **Desde qué edad**: **4 años** *(confirmado por el club el 2026-09-14. La landing todavía
  dice "desde los 5" — pendiente propagar a código; el SEO/GBP ya dicen 4)*.
- **Costo**: gratis, sin compromiso.

## 2. Franjas fijas (cupos dentro de entrenamientos existentes)

> **Sedes confirmadas 2026-09-14.** El club no tiene sede propia ni menciona ya a Hockey One en
> el sitio (decisión del club: no nombrarlo y no publicar dirección). Entrena en dos canchas
> alquiladas; por eso las sedes viven en constantes (`FEDEPATIN_LOCATION`, `GUAYMARAL_LOCATION`
> en `leads.ts`) para que un cambio sea una línea.

| Franja | Categorías | Sede | Cupos sugeridos |
|---|---|---|---|
| Lunes 5:00 PM | Sub 8, Sub 10, Sub 12 | Coliseo Fedepatín (San Andresito Norte) | 3–4 |
| Viernes 4:30 PM | Sub 8, Sub 10, Sub 12 | Coliseo Fedepatín (San Andresito Norte) | 3–4 |
| Sábado 7:00 AM | Sub 14, Sub 16 | Pista de Hockey Guaymaral — Fedehockey (Autopista Norte) | 3–4 |

*(Sub 18 y Mayores quedan fuera del embudo de cortesía por ahora — categorías de alto
rendimiento, no el foco de una campaña de captación masiva.)*

**Puertas Abiertas mensual**: *suspendido hasta tener sede*. Sin una cancha propia o con
disponibilidad garantizada no se puede prometer un evento ampliado con cupo mayor. Retomar
cuando se resuelva la sede.

## 3. Quién responde y en cuánto tiempo

- **Canal único**: WhatsApp del club, `+57 318 168 1336`.
- **Responsable**: **Sindy** (confirmado 2026-09-14).
- **Horario de atención**: **Lunes a Sábado, 8:00 AM – 5:00 PM** (confirmado 2026-09-14).
- **SLA de respuesta**: menor a 30 minutos dentro de ese horario. Fuera de él (noches y
  domingos), respuesta antes de las 9:00 AM del día siguiente hábil.
- Ojo con el embudo: los entrenos son en la tarde/noche y sábado temprano, pero la atención es
  de oficina — un padre que escribe a las 7 PM recibe respuesta a la mañana siguiente. Eso está
  bien siempre que el autorespondedor de WhatsApp Business lo diga.
- El circuito ya construido en el sitio hace que **la familia inicie la conversación**: al
  agendar en `/unete`, se abre WhatsApp con el mensaje ya redactado (franja elegida, nombre y
  edad del niño). El club solo confirma.

### Guion de respuesta (adaptar el nombre y ajustar el día según la franja elegida)

> ¡Hola [Nombre del padre/madre]! 🐺 Gracias por tu interés en Optima Wild Dogs Hockey Club Bogotá.
>
> Para la clase de cortesía de [Nombre del niño/a], quedas agendado/a:
> 📅 [Franja elegida]
> 📍 [Coliseo Fedepatín, San Andresito Norte — o Pista Guaymaral si es la franja del sábado]
> 🗺️ [enlace de Google Maps de esa cancha]
> 🏒 Te prestamos patines y protecciones para esa primera clase.
>
> ¿Te sirve ese horario o prefieres otro día? Cualquier duda, escríbeme por aquí mismo.

## 4. Seguimiento post-clase

- Al día siguiente de la clase: mensaje preguntando cómo le fue y ofreciendo inscripción.
- Si no se inscribe de inmediato: recordatorio a los 7 días.
- Estado del lead se lleva en la bandeja de admin (`/admin` → pestaña **Leads**), con el embudo
  nuevo → contactado → agendado → asistió → inscrito.

---

## Pendientes que bloquean el lanzamiento

- [x] Edad mínima: **4 años** — propagada a `/unete` y a `TRIAL_SLOTS` (2026-09-14).
- [x] Responsable WhatsApp: **Sindy**, L–S 8:00 AM – 5:00 PM (2026-09-14).
- [x] WhatsApp oficial: **+57 318 168 1336** — ya en `leads.ts`, Footer, Contact, GBP guide.
- [x] Franjas y sedes confirmadas: Lun 5 PM y Vie 4:30 PM en **Coliseo Fedepatín**; Sáb 7 AM en
  **Pista Guaymaral (Fedehockey)**. Reflejado en `leads.ts`, `Services.tsx` y `CategoryDetail.tsx`.
- [x] Hockey One eliminado de todo el sitio sin poner dirección nueva: Footer, Contacto, Nosotros,
  Servicios (tabla de horarios, tarjeta de sede, nota "escuela de Hockey One"), categoría
  Femenino (sesión de miércoles) y schema.org/FAQ de `index.html`. Horario de atención del
  sitio actualizado a L–S 8–5.
- [ ] Aprobación del club sobre cupos por franja (hoy sugeridos en 3–4).
- [ ] Confirmar si la sesión de **miércoles 6 PM de Femenino** (era en Hockey One) sigue en otra
  cancha o desapareció — se quitó del sitio por no poder nombrar la sede.
- [~] Puertas Abiertas: suspendido hasta tener sede propia o cancha con disponibilidad garantizada.
