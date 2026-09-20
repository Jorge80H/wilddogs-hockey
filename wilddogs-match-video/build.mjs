// Genera index.html (composición HyperFrames vertical 1080x1920) a partir de match.json.
// Determinista: misma entrada => mismo HTML. No hace red, no usa Date.now() ni Math.random().
import { readFileSync, writeFileSync, existsSync, chmodSync, symlinkSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));

// HyperFrames busca `ffmpeg` en el PATH. En entornos sin ffmpeg del sistema (contenedores,
// CI), se expone el binario que trae la dependencia npm a través de node_modules/.bin,
// que npm ya pone en el PATH de cualquier `npm run`.
function prepararFfmpeg() {
  const herramientas = [
    ["ffmpeg", "node_modules/@ffmpeg-installer/linux-x64/ffmpeg"],
    ["ffprobe", "node_modules/@ffprobe-installer/linux-x64/ffprobe"],
  ];
  for (const [nombre, ruta] of herramientas) {
    const bin = join(ROOT, ruta);
    const enlace = join(ROOT, "node_modules/.bin", nombre);
    if (!existsSync(bin) || existsSync(enlace)) continue;
    try {
      chmodSync(bin, 0o755);
      mkdirSync(dirname(enlace), { recursive: true });
      symlinkSync(bin, enlace);
    } catch { /* si ya hay uno del sistema, se usa ese */ }
  }
}
prepararFfmpeg();

const m = JSON.parse(readFileSync(join(ROOT, "match.json"), "utf8"));

// ---------------------------------------------------------------- timings (s)
// 30s: la carátula (frame 0) debe verse completa porque WhatsApp la usa como miniatura.
const T = { open: 0, score: 3.0, photos: 8.0, outro: 27.9, end: 30 };
const PHOTO_WINDOW = T.outro - T.photos;

// ------------------------------------------------------------------- utilidades
const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const esc = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

function fechaLarga(iso) {
  const [y, mo, d] = String(iso).split("-").map(Number);
  return `${String(d).padStart(2,"0")} ${MESES[mo-1]} ${y}`;
}

// Color estable derivado del nombre: mismo rival => siempre el mismo color.
function colorDeEquipo(nombre) {
  let h = 0;
  for (const ch of nombre.toUpperCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // Se evita la franja naranja (10-40) que pertenece a Wild Dogs.
  const hue = (h % 300) + 45;
  return { base: `hsl(${hue} 62% 52%)`, dark: `hsl(${hue} 55% 16%)` };
}

// Iniciales para el escudo monograma: 1 palabra => 2 letras, varias => 1 por palabra (máx 3).
function iniciales(nombre) {
  const stop = new Set(["de","del","la","el","los","las","club","hc","cd"]);
  const w = nombre.split(/\s+/).filter((x) => x && !stop.has(x.toLowerCase()));
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return w.slice(0, 3).map((x) => x[0]).join("").toUpperCase();
}

// Escudo: usa el PNG/WEBP/SVG real si existe en assets/teams/, si no genera un monograma.
const EXT = ["png", "webp", "svg", "jpg"];
function escudo(team, size, id) {
  const s = slug(team.name);
  for (const ext of EXT) {
    const rel = `assets/teams/${s}.${ext}`;
    if (existsSync(join(ROOT, rel))) {
      return `<img id="${id}" src="${rel}" alt="${esc(team.name)}" style="width:${size}px;height:${size}px;object-fit:contain;" />`;
    }
  }
  const c = team.isWildDogs ? { base: "#EA580C", dark: "#3a1405" } : colorDeEquipo(team.name);
  const ini = iniciales(team.name);
  const fs = ini.length >= 3 ? 68 : 86;
  return `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 200 220" role="img" aria-label="${esc(team.name)}">
        <defs><linearGradient id="g-${s}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c.base}" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="${c.dark}" stop-opacity="0.92"/>
        </linearGradient></defs>
        <path d="M100 6 L192 38 V118 C192 170 148 200 100 214 C52 200 8 170 8 118 V38 Z"
              fill="url(#g-${s})" stroke="${c.base}" stroke-width="7"/>
        <text x="100" y="128" text-anchor="middle" font-family="BigShoulders, sans-serif"
              font-size="${fs}" font-weight="700" fill="#fff" letter-spacing="2">${esc(ini)}</text>
      </svg>`;
}

// ---------------------------------------------------------------- datos derivados
const { home, away } = m;
const wd = home.isWildDogs ? home : away;
const rival = home.isWildDogs ? away : home;
const RESULTADO =
  wd.score > rival.score ? { texto: "VICTORIA", color: "#EA580C" }
  : wd.score < rival.score ? { texto: "DERROTA", color: "#64748b" }
  : { texto: "EMPATE", color: "#38bdf8" };

const fotos = m.photos ?? [];
if (fotos.length === 0) throw new Error("match.json: se necesita al menos una foto en 'photos'.");
const dur = PHOTO_WINDOW / fotos.length;

// ------------------------------------------------------------------------ música
// assets/music/tracks.json guarda, por pista, el segundo de entrada (la ventana de 15s
// más enérgica). match.json `music`: nombre de archivo, "auto" (elige por partido, estable
// entre builds) o "none".
const MUSIC_DIR = "assets/music";
const tracks = JSON.parse(readFileSync(join(ROOT, MUSIC_DIR, "tracks.json"), "utf8"));
function elegirPista() {
  const pedido = m.music ?? "auto";
  if (pedido === "none") return null;
  const nombres = Object.keys(tracks).sort();
  if (pedido !== "auto") {
    if (!tracks[pedido]) throw new Error(`match.json: pista '${pedido}' no está en ${MUSIC_DIR}/tracks.json`);
    return pedido;
  }
  const semilla = `${m.date}|${m.division}|${rival.name}`;
  let h = 0;
  for (const ch of semilla) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return nombres[h % nombres.length];
}
const pista = elegirPista();
const MUSIC_PEAK = 0.85;
// Fades como carril de automatización: lo hornea el mezclador de render (requiere hyperframes >= 0.8).
const automation = JSON.stringify({
  version: 1,
  lanes: [{
    target: "volume",
    points: [
      { t: 0, v: 0 },
      { t: 0.8, v: MUSIC_PEAK },
      { t: +(T.end - 2.2).toFixed(2), v: MUSIC_PEAK },
      { t: T.end, v: 0 },
    ],
  }],
});
const audioHtml = pista ? `
      <audio id="bgm" src="${MUSIC_DIR}/${pista}"
             data-start="0" data-duration="${T.end}"
             data-media-start="${tracks[pista].start}"
             data-automation='${automation}'></audio>` : "";

// --------------------------------------------------------------- fila de marcador
// El ancho útil del nombre en la fila es ~460px; se baja el cuerpo si el nombre es largo.
function tamanoNombre(nombre) {
  const n = nombre.length;
  if (n <= 10) return 64;
  if (n <= 16) return 56;
  if (n <= 22) return 46;
  return 38;
}

function fila(team, idx) {
  const destacado = team.isWildDogs;
  return `
        <div id="row${idx}" style="
          display:flex; align-items:center; gap:34px; padding:38px 44px;
          background:${destacado ? "rgba(234,88,12,0.10)" : "transparent"};
          border-left:8px solid ${destacado ? "#EA580C" : "rgba(255,255,255,0.10)"};
        ">
          ${escudo(team, 150, `shield${idx}`)}
          <div style="flex:1; min-width:0;">
            <div style="
              font-size:${tamanoNombre(team.name)}px; font-weight:700; line-height:1.22; color:#fff;
              text-transform:uppercase; letter-spacing:0.01em;
              overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
            ">${esc(team.name)}</div>
            <div style="
              font-family:Outfit,sans-serif; font-size:26px; font-weight:400;
              color:rgba(255,255,255,0.55); letter-spacing:0.22em; margin-top:10px;
            ">${team === home ? "LOCAL" : "VISITANTE"}</div>
          </div>
          <div id="score${idx}" data-target="${team.score}" style="
            font-size:168px; font-weight:700; line-height:0.82;
            color:${destacado ? "#EA580C" : "#fff"}; min-width:160px; text-align:right;
            font-variant-numeric:tabular-nums;
          ">0</div>
        </div>`;
}

// -------------------------------------------------------------- escenas de fotos
const escenasFoto = fotos.map((src, i) => `
      <div id="p${i}" class="scene" style="z-index:${20 + i}; opacity:0;">
        <img id="p${i}-img" class="full-img" data-layout-allow-overflow src="${esc(src)}" alt="Partido Wild Dogs ${i + 1}" />
        <div class="grad-bottom"></div>
        <div class="grad-top"></div>
      </div>`).join("");

const tweensFoto = fotos.map((_, i) => {
  const t0 = +(T.photos + i * dur).toFixed(2);
  const cut = +(t0 - 0.1).toFixed(2);
  const entrada = i === 0
    ? `tl.to("#p0", { opacity: 1, duration: 0.3, ease: "power2.out" }, ${cut});`
    : `tl.to("#p${i - 1}", { opacity: 0, duration: 0.12, ease: "none" }, ${cut});
      tl.to("#p${i}", { opacity: 1, duration: 0.12, ease: "none" }, ${cut});`;
  const zoomIn = i % 2 === 0;
  return `      ${entrada}
      tl.fromTo("#p${i}-img", { scale: ${zoomIn ? 1.0 : 1.12} }, { scale: ${zoomIn ? 1.12 : 1.0}, duration: ${(dur + 0.4).toFixed(2)}, ease: "none" }, ${t0});`;
}).join("\n");

const ultimaFoto = fotos.length - 1;

// --------------------------------------------------------------------- el HTML
const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap.min.js"><\/script>
    <style>
      @font-face { font-family:"BigShoulders"; src:url("assets/fonts/BigShoulders-Bold.ttf") format("truetype"); font-weight:700; font-display:block; }
      @font-face { font-family:"BigShoulders"; src:url("assets/fonts/BigShoulders-Regular.ttf") format("truetype"); font-weight:400; font-display:block; }
      @font-face { font-family:"Outfit"; src:url("assets/fonts/Outfit-Bold.ttf") format("truetype"); font-weight:700; font-display:block; }
      @font-face { font-family:"Outfit"; src:url("assets/fonts/Outfit-Regular.ttf") format("truetype"); font-weight:400; font-display:block; }

      * { margin:0; padding:0; box-sizing:border-box; }
      html, body {
        width:1080px; height:1920px; overflow:hidden;
        background:#0a0f1e; color:#fff;
        font-family:"BigShoulders", sans-serif;
      }
      .tex { position:absolute; inset:0; background:url("assets/textura.webp") center/cover no-repeat; }
      .scene { position:absolute; top:0; left:0; width:1080px; height:1920px; overflow:hidden; background:#0a0f1e; }
      .full-img { position:absolute; top:0; left:0; width:1080px; height:1920px; object-fit:cover; object-position:center; }
      .grad-bottom { position:absolute; inset:0; background:linear-gradient(to top, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.28) 38%, rgba(10,15,30,0) 62%); }
      .grad-top { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.30) 22%, rgba(10,15,30,0) 42%); }
      .chip {
        display:inline-block; font-family:Outfit, sans-serif; font-size:26px; font-weight:700;
        letter-spacing:0.24em; text-transform:uppercase; padding:14px 30px;
        border:2px solid rgba(234,88,12,0.55); border-radius:999px; color:#EA580C;
      }
      .meta { font-family:Outfit, sans-serif; font-size:28px; font-weight:400; letter-spacing:0.16em; color:rgba(255,255,255,0.62); text-transform:uppercase; }
    </style>
  </head>
  <body>
    <div id="root"
         data-composition-id="wilddogs-match"
         data-start="0" data-duration="${T.end}"
         data-width="1080" data-height="1920">
${audioHtml}

      <!-- ============ S1 · Apertura ${T.open}–${T.score}s ============ -->
      <div id="s1" class="scene" style="z-index:1;">
        <div class="tex" style="opacity:0.09;"></div>
        <div id="s1-glow" style="
          position:absolute; width:1040px; height:1040px; border-radius:50%;
          background:radial-gradient(circle, rgba(234,88,12,0.34) 0%, rgba(234,88,12,0) 68%);
          top:50%; left:50%; transform:translate(-50%,-50%);
        "></div>
        <div style="
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; z-index:2;
        ">
          <img id="s1-logo" src="assets/logo-wilddogs.png" alt="Wild Dogs" style="width:360px; height:auto;" />
          <div id="s1-kicker" style="
            font-size:96px; font-weight:700; text-transform:uppercase;
            letter-spacing:0.06em; margin-top:34px; line-height:1;
          ">Resultado</div>
          <div id="s1-line" style="width:260px; height:5px; background:#EA580C; margin-top:26px; transform-origin:center;"></div>
          <div id="s1-div" class="meta" style="margin-top:30px;">${esc(m.division)} · ${esc(fechaLarga(m.date))}</div>
          <div id="s1-vs" style="
            margin-top:44px; display:flex; align-items:center; gap:22px;
            font-size:54px; font-weight:700; text-transform:uppercase; letter-spacing:0.03em;
          ">
            <span style="color:rgba(255,255,255,0.45); font-size:34px; letter-spacing:0.2em;">VS</span>
            ${escudo(rival, 96, "s1-rival")}
            <span>${esc(rival.name)}</span>
          </div>
        </div>
      </div>

      <!-- ============ S2 · Marcador ${T.score}–${T.photos}s ============ -->
      <div id="s2" class="scene" style="z-index:10; opacity:0;">
        <div class="tex" style="opacity:0.07;"></div>
        <div style="
          position:absolute; inset:0; padding:150px 70px;
          display:flex; flex-direction:column; justify-content:center; z-index:2;
        ">
          <div style="text-align:center;">
            <div id="s2-chip" class="chip">${esc(m.tournament)}</div>
            <div id="s2-cat" style="
              font-size:112px; font-weight:700; text-transform:uppercase;
              letter-spacing:0.03em; margin-top:34px; line-height:1;
            ">${esc(m.division)}</div>
            <div id="s2-meta" class="meta" style="margin-top:22px;">${esc(fechaLarga(m.date))} · ${esc(m.venue)}</div>
          </div>

          <div id="s2-card" style="
            margin-top:86px; border-radius:40px; overflow:hidden;
            background:rgba(255,255,255,0.045); border:2px solid rgba(255,255,255,0.10);
          ">
${fila(home, 0)}
            <div style="height:2px; background:rgba(255,255,255,0.10);"></div>
${fila(away, 1)}
          </div>

          <div style="text-align:center; margin-top:82px;">
            <div id="s2-result" style="
              font-size:142px; font-weight:700; text-transform:uppercase;
              letter-spacing:0.09em; line-height:1; color:${RESULTADO.color};
            ">${RESULTADO.texto}</div>
            <div id="s2-status" class="meta" style="margin-top:26px; letter-spacing:0.34em;">${esc(m.status)}</div>
          </div>
        </div>
      </div>

      <!-- ============ S3 · Fotos ${T.photos}–${T.outro}s ============ -->
${escenasFoto}

      <!-- Barra de marcador compacta sobre las fotos -->
      <div id="bar" style="
        position:absolute; top:96px; left:60px; right:60px; z-index:60; opacity:0;
        display:flex; align-items:center; gap:26px;
        padding:26px 34px; border-radius:28px;
        background:rgba(10,15,30,0.74); border:2px solid rgba(255,255,255,0.12);
        backdrop-filter:blur(8px);
      ">
        ${escudo(home, 78, "bar-h")}
        <div style="flex:1; font-size:46px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; line-height:1;">${esc(home.abbr)}</div>
        <div style="font-size:74px; font-weight:700; line-height:0.85; color:#EA580C; font-variant-numeric:tabular-nums;">${home.score}<span style="color:rgba(255,255,255,0.55); margin:0 14px;">–</span>${away.score}</div>
        <div style="flex:1; text-align:right; font-size:46px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; line-height:1;">${esc(away.abbr)}</div>
        ${escudo(away, 78, "bar-a")}
      </div>

      <!-- ============ S4 · Cierre ${T.outro}–${T.end}s ============ -->
      <div id="s4" class="scene" style="z-index:80; opacity:0;">
        <div class="tex" style="opacity:0.08;"></div>
        <div id="s4-glow" style="
          position:absolute; width:980px; height:980px; border-radius:50%;
          background:radial-gradient(circle, rgba(234,88,12,0.30) 0%, rgba(234,88,12,0) 68%);
          top:50%; left:50%; transform:translate(-50%,-50%);
        "></div>
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:2;">
          <div id="s4-logo" role="img" aria-label="Wild Dogs" style="width:300px; height:300px; background:url('assets/logo-wilddogs.png') center/contain no-repeat;"></div>
          <div id="s4-name" style="
            font-size:92px; font-weight:700; text-transform:uppercase;
            letter-spacing:0.07em; margin-top:30px; line-height:1; text-align:center;
          ">Wild Dogs<br/>Hockey Club</div>
          <div id="s4-bar" style="width:0; height:5px; background:#EA580C; margin-top:30px;"></div>
          <div id="s4-handle" class="meta" style="margin-top:30px; font-size:34px; color:rgba(255,255,255,0.72);">${esc(m.handle)} · ${esc(m.site)}</div>
        </div>
        <div id="s4-fade" style="position:absolute; inset:0; background:#0a0f1e; opacity:0; z-index:10;"></div>
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      // ---- S1 Apertura
      // Todo visible desde el frame 0 (miniatura de WhatsApp); solo hay movimiento sutil después.
      tl.fromTo("#s1-glow", { scale: 0.9, opacity: 0.6 }, { scale: 1.08, opacity: 1, duration: 1.6, ease: "sine.inOut" }, 0.2);
      tl.to("#s1-logo",     { scale: 1.06, duration: 0.45, ease: "power2.out" }, 0.4);
      tl.to("#s1-logo",     { scale: 1.0,  duration: 0.55, ease: "power2.inOut" }, 0.85);
      tl.fromTo("#s1-line", { scaleX: 0.3 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, 0.5);
      tl.from("#s1-vs",     { y: 26, opacity: 0.5, duration: 0.6, ease: "power2.out" }, 0.7);

      // ---- S1 -> S2
      tl.to("#s1", { opacity: 0, filter: "blur(12px)", duration: 0.26, ease: "power2.in" }, ${(T.score - 0.28).toFixed(2)});
      tl.fromTo("#s2", { opacity: 0, filter: "blur(12px)" },
                       { opacity: 1, filter: "blur(0px)", duration: 0.36, ease: "power3.out" }, ${(T.score - 0.18).toFixed(2)});

      // ---- S2 Marcador
      tl.from("#s2-chip",   { y: -30, opacity: 0, duration: 0.42, ease: "power3.out" }, ${(T.score + 0.12).toFixed(2)});
      tl.from("#s2-cat",    { y: 56, opacity: 0, duration: 0.52, ease: "expo.out" }, ${(T.score + 0.3).toFixed(2)});
      tl.from("#s2-meta",   { opacity: 0, duration: 0.45, ease: "power2.out" }, ${(T.score + 0.55).toFixed(2)});
      tl.from("#s2-card",   { y: 70, opacity: 0, duration: 0.6, ease: "power3.out" }, ${(T.score + 0.6).toFixed(2)});
      tl.from("#row0",      { x: -70, opacity: 0, duration: 0.48, ease: "expo.out" }, ${(T.score + 0.82).toFixed(2)});
      tl.from("#row1",      { x: -70, opacity: 0, duration: 0.48, ease: "expo.out" }, ${(T.score + 0.98).toFixed(2)});

      // Contadores del marcador (deterministas: el valor depende solo del progreso del timeline)
      ["score0", "score1"].forEach(function (id, i) {
        var el = document.getElementById(id);
        var target = Number(el.dataset.target);
        var proxy = { v: 0 };
        tl.to(proxy, {
          v: target, duration: 0.7, ease: "power1.out",
          onUpdate: function () { el.textContent = String(Math.round(proxy.v)); }
        }, ${(T.score + 1.15).toFixed(2)} + i * 0.16);
      });

      tl.from("#s2-result", { scale: 0.7, opacity: 0, duration: 0.55, ease: "back.out(1.9)" }, ${(T.score + 1.95).toFixed(2)});
      tl.from("#s2-status", { opacity: 0, scaleX: 1.25, duration: 0.55, ease: "power2.out" }, ${(T.score + 2.3).toFixed(2)});

      // ---- S2 -> fotos
      tl.to("#s2",  { opacity: 0, duration: 0.2, ease: "power2.in" }, ${(T.photos - 0.24).toFixed(2)});
      tl.fromTo("#bar", { opacity: 0, y: -60 },
                        { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" }, ${(T.photos + 0.1).toFixed(2)});

${tweensFoto}

      // ---- fotos -> S4
      tl.to("#bar", { opacity: 0, y: -50, duration: 0.3, ease: "power2.in" }, ${(T.outro - 0.36).toFixed(2)});
      tl.to("#p${ultimaFoto}", { opacity: 0, duration: 0.3, ease: "power2.in" }, ${(T.outro - 0.3).toFixed(2)});
      tl.fromTo("#s4", { opacity: 0, scale: 0.94 },
                       { opacity: 1, scale: 1, duration: 0.46, ease: "power3.out" }, ${(T.outro - 0.24).toFixed(2)});

      // ---- S4 Cierre
      tl.from("#s4-logo",   { scale: 0.7, opacity: 0, duration: 0.6, ease: "back.out(1.7)" }, ${(T.outro + 0.15).toFixed(2)});
      tl.from("#s4-name",   { y: 46, opacity: 0, duration: 0.55, ease: "power3.out" }, ${(T.outro + 0.5).toFixed(2)});
      tl.to("#s4-bar",      { width: 340, duration: 0.55, ease: "power3.out" }, ${(T.outro + 0.85).toFixed(2)});
      tl.from("#s4-handle", { opacity: 0, scaleX: 1.15, duration: 0.5, ease: "power2.out" }, ${(T.outro + 1.05).toFixed(2)});
      tl.to("#s4-fade",     { opacity: 1, duration: 0.6, ease: "power2.in" }, ${(T.end - 0.6).toFixed(2)});

      window.__timelines["wilddogs-match"] = tl;
    <\/script>
  </body>
</html>
`;

writeFileSync(join(ROOT, "index.html"), html);
console.log(
  `index.html generado · ${wd.name} ${wd.score}-${rival.score} ${rival.name} · ` +
  `${RESULTADO.texto} · ${fotos.length} foto(s) · ${T.end}s · música: ${pista ?? "ninguna"}`
);
