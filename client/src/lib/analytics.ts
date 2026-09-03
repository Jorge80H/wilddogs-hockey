/**
 * Wild Dogs Hockey Club - Eventos de conversión (GA4)
 *
 * gtag.js se carga en `client/index.html` (G-VDXB7BFZLE). Este módulo envuelve
 * las llamadas para que la UI no dependa del global y para que nada se rompa
 * si el script está bloqueado o aún no cargó.
 */

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: GtagParams) => void;
  }
}

export function trackEvent(eventName: string, params: GtagParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  try {
    window.gtag("event", eventName, params);
  } catch {
    // La analítica nunca debe interrumpir el flujo de conversión.
  }
}

/** Lead de clase de cortesía enviado. Marcar como conversión en GA4. */
export function trackLeadSubmitted(params: { slot?: string; childAge?: string | number }): void {
  trackEvent("generate_lead", {
    form: "clase_cortesia",
    slot: params.slot || "sin_franja",
    child_age: params.childAge || "no_indicada",
  });
}

/** Clic en cualquier CTA de WhatsApp. `location` identifica desde dónde se hizo. */
export function trackWhatsAppClick(location: string): void {
  trackEvent("click_whatsapp", { link_location: location });
}
