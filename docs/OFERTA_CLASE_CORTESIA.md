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
- **Desde qué edad**: 5 años *(ajustar aquí si el club decide otro mínimo; hoy hay una
  inconsistencia en el sitio entre "desde los 4" del SEO y "desde los 5" de la landing —
  definir un solo número y propagarlo)*.
- **Costo**: gratis, sin compromiso.

## 2. Franjas fijas (cupos dentro de entrenamientos existentes)

| Franja | Categorías | Sede | Cupos sugeridos |
|---|---|---|---|
| Lunes 5:00 PM | Sub 8, Sub 10, Sub 12 | Hockey One (Cra 22 #164-83) | 3–4 |
| Viernes 4:30 PM | Sub 8, Sub 10, Sub 12 | Hockey One (Cra 22 #164-83) | 3–4 |
| Sábado 7:00 AM | Sub 14, Sub 16 | Hockey One (Cra 22 #164-83) | 3–4 |

*(Sub 16/18/Mayores en Guaymaral quedan fuera del embudo de cortesía por ahora — categorías
de alto rendimiento, no el foco de una campaña de captación masiva.)*

**Puertas Abiertas mensual**: un sábado al mes, evento ampliado con cupo mayor, pensado como pico
de contenido y de captación. Fecha y mecánica a definir con el club — *pendiente*.

## 3. Quién responde y en cuánto tiempo

- **Canal único**: WhatsApp del club, `+57 314 310 0208`.
- **Responsable**: *(nombre a asignar por el club — bloqueante)*.
- **SLA de respuesta**: menor a 30 minutos en horario de atención (L–V 15:00–22:00,
  Sáb 07:00–14:00). Fuera de ese horario, respuesta antes de las 9:00 AM del día hábil siguiente.
- El circuito ya construido en el sitio hace que **la familia inicie la conversación**: al
  agendar en `/unete`, se abre WhatsApp con el mensaje ya redactado (franja elegida, nombre y
  edad del niño). El club solo confirma.

### Guion de respuesta (adaptar el nombre y ajustar el día según la franja elegida)

> ¡Hola [Nombre del padre/madre]! 🐺 Gracias por tu interés en Optima Wild Dogs Hockey Club Bogotá.
>
> Para la clase de cortesía de [Nombre del niño/a], quedas agendado/a:
> 📅 [Franja elegida]
> 📍 Sede: Carrera 22 # 164-83 (Hockey One)
> 🏒 Te prestamos patines y protecciones para esa primera clase.
>
> ¿Confirmamos ese horario o prefieres otro día? Cualquier duda, escríbeme por aquí mismo.

## 4. Seguimiento post-clase

- Al día siguiente de la clase: mensaje preguntando cómo le fue y ofreciendo inscripción.
- Si no se inscribe de inmediato: recordatorio a los 7 días.
- Estado del lead se lleva en la bandeja de admin (`/admin` → pestaña **Leads**), con el embudo
  nuevo → contactado → agendado → asistió → inscrito.

---

## Pendientes que bloquean el lanzamiento

- [ ] Confirmar edad mínima única (4 o 5 años) y propagarla en SEO, landing y este documento.
- [ ] Asignar responsable y horario real de respuesta de WhatsApp.
- [ ] Definir fecha y mecánica de la primera Puertas Abiertas.
- [ ] Aprobación del club sobre cupos por franja (hoy sugeridos en 3–4).
