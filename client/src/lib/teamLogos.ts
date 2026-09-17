// Escudos de rivales: attached_assets/team_logos/<slug>.webp, resueltos por slug del nombre
// (mismo criterio que wilddogs-match-video/build.mjs). Un nombre sin archivo devuelve null.
const files = import.meta.glob("@assets/team_logos/*.webp", { eager: true, import: "default" }) as Record<string, string>;

const bySlug: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const slug = path.split("/").pop()!.replace(/\.webp$/, "");
  bySlug[slug] = url;
}

export const teamSlug = (name: string) =>
  String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Las ligas registran variantes del mismo club: por color ("Rabbits Azul", "Katios Naranja")
// y por alianza ("AVS-Rabbits"). Se prueba el nombre exacto, luego sin el color, luego
// cada segmento de la alianza.
const COLORES = /\b(blanco|blanca|negro|negra|rojo|roja|azul|naranja|verde|amarillo|amarilla|gris|dorado|plateado)\b/gi;

export const getTeamLogo = (name: string): string | null => {
  const raw = String(name ?? "");
  const candidatos = [raw, raw.replace(COLORES, " ")];
  for (const parte of raw.split(/\s*[-/]\s*/)) candidatos.push(parte, parte.replace(COLORES, " "));
  for (const c of candidatos) {
    const hit = bySlug[teamSlug(c)];
    if (hit) return hit;
  }
  return null;
};

// Iniciales para el monograma: 1 palabra => 2 letras, varias => 1 por palabra (máx 3).
export const teamInitials = (name: string) => {
  const stop = new Set(["de", "del", "la", "el", "los", "las", "club", "hc", "cd"]);
  const w = String(name ?? "").split(/\s+/).filter((x) => x && !stop.has(x.toLowerCase()));
  if (w.length === 0) return "?";
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return w.slice(0, 3).map((x) => x[0]).join("").toUpperCase();
};

// Color estable derivado del nombre, evitando la franja naranja del club.
export const teamHue = (name: string) => {
  let h = 0;
  for (const ch of String(name ?? "").toUpperCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 300) + 45;
};
