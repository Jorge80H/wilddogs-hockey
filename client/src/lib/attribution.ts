/**
 * Wild Dogs Hockey Club - Atribución de leads
 *
 * Responde "¿de dónde vino esta familia?" para poder medir cada peso de pauta.
 * Se captura al aterrizar (UTM, gclid, referrer) y viaja con el lead a la bandeja.
 * Gana el último contacto no directo, con vigencia de 30 días.
 */

export const LEAD_SOURCES = [
  "meta_ads",
  "google_ads",
  "instagram",
  "facebook",
  "google",
  "colegio",
  "referido",
  "whatsapp",
  "directo",
  "otro",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  meta_ads: "Anuncio Meta",
  google_ads: "Anuncio Google",
  instagram: "Instagram orgánico",
  facebook: "Facebook orgánico",
  google: "Google orgánico",
  colegio: "Colegio",
  referido: "Referido",
  whatsapp: "WhatsApp directo",
  directo: "Directo / sin dato",
  otro: "Otro",
};

export interface Attribution {
  source: LeadSource;
  campaign?: string;
  landedAt: number;
}

const STORAGE_KEY = "wd_attribution";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PAID_MEDIUMS = ["cpc", "ppc", "paid", "paid_social", "paidsocial", "ads", "ad"];
const META_SOURCES = ["facebook", "fb", "instagram", "ig", "meta"];

function sourceFromUtm(utmSource: string, paid: boolean): LeadSource {
  if (META_SOURCES.includes(utmSource)) {
    if (paid) return "meta_ads";
    return utmSource === "instagram" || utmSource === "ig" ? "instagram" : "facebook";
  }
  if (utmSource === "google") return paid ? "google_ads" : "google";
  if (utmSource.startsWith("colegio")) return "colegio";
  if (utmSource.startsWith("referido")) return "referido";
  if (utmSource === "whatsapp") return "whatsapp";
  return "otro";
}

function sourceFromReferrer(referrer: string, ownHost: string): LeadSource | null {
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (!host || host === ownHost || host.endsWith(`.${ownHost}`)) return null;
  if (host.includes("instagram.")) return "instagram";
  if (host.includes("facebook.") || host === "fb.com" || host.endsWith(".fb.com")) return "facebook";
  if (/(^|\.)google\./.test(host)) return "google";
  if (host.includes("whatsapp.")) return "whatsapp";
  return "otro";
}

/**
 * Clasifica una visita. Devuelve null cuando no hay señal (visita directa o
 * navegación interna), para no pisar una atribución previa que sí la tenía.
 */
export function classifyVisit(
  search: string,
  referrer: string,
  ownHost: string,
  now: number = Date.now(),
): Attribution | null {
  const params = new URLSearchParams(search);
  const utmSource = (params.get("utm_source") || "").trim().toLowerCase();
  const utmMedium = (params.get("utm_medium") || "").trim().toLowerCase();
  const campaign = params.get("utm_campaign")?.trim() || undefined;

  if (utmSource) {
    const paid = PAID_MEDIUMS.includes(utmMedium);
    return { source: sourceFromUtm(utmSource, paid), campaign, landedAt: now };
  }
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) {
    return { source: "google_ads", campaign, landedAt: now };
  }

  const fromReferrer = sourceFromReferrer(referrer, ownHost.toLowerCase());
  if (fromReferrer) return { source: fromReferrer, campaign, landedAt: now };

  // fbclid sin referrer: clic desde la app de Instagram/Facebook (orgánico o
  // anuncio sin UTM). Sin más señal no se puede distinguir; se asume orgánico.
  if (params.has("fbclid")) return { source: "instagram", campaign, landedAt: now };

  return null;
}

function readStored(now: number): Attribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (!parsed?.source || now - parsed.landedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Llamar una vez al cargar la app. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const visit = classifyVisit(window.location.search, document.referrer, window.location.hostname);
  if (!visit) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visit));
  } catch {
    // Sin almacenamiento (modo privado): el lead quedará como "directo".
  }
}

/** Campos que se guardan con cada lead en `contactSubmissions`. */
export function leadAttributionFields(): { source: LeadSource; campaign?: string } {
  if (typeof window === "undefined") return { source: "directo" };
  const stored = readStored(Date.now());
  if (!stored) return { source: "directo" };
  return stored.campaign ? { source: stored.source, campaign: stored.campaign } : { source: stored.source };
}

export function normalizeLeadSource(value?: string): LeadSource {
  return (LEAD_SOURCES as readonly string[]).includes(value || "") ? (value as LeadSource) : "directo";
}
