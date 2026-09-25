/**
 * Wild Dogs Hockey Club - Eventos de conversión (GA4, Meta Pixel, Google Ads)
 *
 * gtag.js se carga en `client/index.html` (G-VDXB7BFZLE). Meta Pixel y Google Ads
 * se activan solo si sus IDs están en variables de entorno (Netlify):
 *   VITE_META_PIXEL_ID, VITE_GOOGLE_ADS_ID (AW-...), VITE_GOOGLE_ADS_LEAD_LABEL.
 * Nada de esto puede interrumpir el flujo de conversión.
 */

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, target: string, params?: GtagParams) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
  }
}

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined;
const GOOGLE_ADS_LEAD_LABEL = import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL as string | undefined;

function safe(fn: () => void): void {
  try {
    fn();
  } catch {
    // La analítica nunca debe interrumpir el flujo de conversión.
  }
}

function loadMetaPixel(pixelId: string): void {
  if (window.fbq) return;
  const fbq: any = function (...args: unknown[]) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", pixelId);
  fbq("track", "PageView");
}

/** Llamar una vez al cargar la app. */
export function initAdTracking(): void {
  if (typeof window === "undefined") return;
  if (META_PIXEL_ID) safe(() => loadMetaPixel(META_PIXEL_ID));
  if (GOOGLE_ADS_ID && typeof window.gtag === "function") {
    safe(() => window.gtag!("config", GOOGLE_ADS_ID));
  }
}

export function trackEvent(eventName: string, params: GtagParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  safe(() => window.gtag!("event", eventName, params));
}

function trackMeta(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  safe(() => window.fbq!("track", eventName, params));
}

/** Lead de clase de cortesía enviado. Conversión principal en GA4, Meta y Google Ads. */
export function trackLeadSubmitted(params: { slot?: string; childAge?: string | number }): void {
  trackEvent("generate_lead", {
    form: "clase_cortesia",
    slot: params.slot || "sin_franja",
    child_age: params.childAge || "no_indicada",
  });
  trackMeta("Lead", { content_name: "clase_cortesia" });
  if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL) {
    trackEvent("conversion", { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}` });
  }
}

/** Clic en cualquier CTA de WhatsApp. `location` identifica desde dónde se hizo. */
export function trackWhatsAppClick(location: string): void {
  trackEvent("click_whatsapp", { link_location: location });
  trackMeta("Contact", { content_name: location });
}
