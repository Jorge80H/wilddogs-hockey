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
// 30s por defecto: la carátula (frame 0) debe verse completa porque WhatsApp la usa
// como miniatura. `duration` en match.json lo acorta cuando hay pocas fotos — solo se
// recorta el montaje, la apertura, el marcador y el cierre conservan su ritmo.
const DURACION = Number(m.duration ?? 30);
const T = { open: 0, score: 3.0, photos: 8.0, outro: +(DURACION - 2.1).toFixed(2), end: DURACION };
if (T.outro - T.photos < 4) throw new Error(`match.json: 'duration' ${DURACION}s deja menos de 4s de fotos; usa 16s o más.`);
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

// Logo del patrocinador (Óptima): va al pie de la apertura, del montaje y del cierre.
function logoOptima(id, alto, opacidad) {
  return `<img id="${id}" src="assets/logo-optima.webp" alt="Óptima"
               style="height:${alto}px; width:auto; opacity:${opacidad};" />`;
}

// ---------------------------------------------------------------- datos derivados
const { home, away } = m;
const wd = home.isWildDogs ? home : away;
const rival = home.isWildDogs ? away : home;
const RESULTADO =
  wd.score > rival.score ? { texto: "VICTORIA", color: "#EA580C" }
  : wd.score < rival.score ? { texto: "CABEZA ARRIBA", color: "#EA580C" }
  : { texto: "EMPATE", color: "#38bdf8" };

const fotos = m.photos ?? [];
if (fotos.length === 0) throw new Error("match.json: se necesita al menos una foto en 'photos'.");
const dur = PHOTO_WINDOW / fotos.length;

// Fondos fotográficos de apertura, marcador y cierre. `cover` en match.json elige la foto
// de la carátula (la que WhatsApp usa de miniatura); si no, la primera del montaje.
const PORTADA = m.cover ?? fotos[0];
const FONDO_MARCADOR = fotos[Math.min(1, fotos.length - 1)];
const FONDO_CIERRE = fotos[fotos.length - 1];
function fondoFoto(id, src, filtro, velo) {
  return `
        <img id="${id}" class="full-img" data-layout-allow-overflow src="${esc(src)}" alt="" style="filter:${filtro};" />
        <div class="velo" style="background:${velo};"></div>`;
}

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

// ------------------------------------------------------------ cara a cara (marcador)
// Cada equipo es una columna de ~300px: escudo, nombre (hasta 2 líneas) y localía.
function tamanoNombre(nombre) {
  const n = nombre.length;
  if (n <= 10) return 46;
  if (n <= 18) return 40;
  return 34;
}

function lado(team, idx) {
  const destacado = team.isWildDogs;
  return `
          <div id="row${idx}" style="width:300px; display:flex; flex-direction:column; align-items:center; text-align:center;">
            <div style="
              width:230px; height:230px; border-radius:50%; display:flex; align-items:center; justify-content:center;
              background:radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 70%);
            ">${escudo(team, 200, `shield${idx}`)}</div>
            <div style="
              margin-top:18px; font-size:${tamanoNombre(team.name)}px; font-weight:700; line-height:1.05;
              text-transform:uppercase; color:${destacado ? "#fff" : "rgba(255,255,255,0.9)"};
            ">${esc(team.name)}</div>
            <div style="
              margin-top:12px; font-family:Outfit,sans-serif; font-size:22px; font-weight:700;
              letter-spacing:0.24em; color:${destacado ? "#EA580C" : "rgba(255,255,255,0.5)"};
            ">${team === home ? "LOCAL" : "VISITANTE"}</div>
          </div>`;
}

function marcador(team, idx) {
  return `<div id="score${idx}" data-target="${team.score}" style="
              font-size:250px; font-weight:700; line-height:0.8; min-width:130px; text-align:center;
              color:${team.isWildDogs ? "#EA580C" : "#fff"}; font-variant-numeric:tabular-nums;
              text-shadow:0 10px 40px rgba(0,0,0,0.6);
            ">0</div>`;
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
  const deriva = i % 2 === 0 ? 26 : -26;
  return `      ${entrada}
      tl.fromTo("#p${i}-img", { scale: ${zoomIn ? 1.04 : 1.16}, x: ${-deriva} }, { scale: ${zoomIn ? 1.16 : 1.04}, x: ${deriva}, duration: ${(dur + 0.4).toFixed(2)}, ease: "none" }, ${t0});`;
}).join("\n");

// Barrido naranja en diagonal que tapa cada corte entre fotos (alterna el sentido).
const barridosHtml = fotos.slice(1).map((_, k) => `
      <div id="sw${k}" data-layout-allow-overflow style="
        position:absolute; top:-200px; left:0; width:520px; height:2320px; z-index:${45};
        background:linear-gradient(90deg, rgba(234,88,12,0) 0%, #EA580C 30%, #F97316 70%, rgba(249,115,22,0) 100%);
        transform:translateX(-900px) skewX(-16deg); opacity:0.92;
      "></div>`).join("");
const barridosTweens = fotos.slice(1).map((_, k) => {
  const corte = T.photos + (k + 1) * dur - 0.1;
  const [desde, hasta] = k % 2 === 0 ? [-900, 1500] : [1500, -900];
  return `      tl.fromTo("#sw${k}", { x: ${desde} }, { x: ${hasta}, duration: 0.34, ease: "power1.inOut", immediateRender: false }, ${(corte - 0.17).toFixed(2)});`;
}).join("\n");

const ultimaFoto = fotos.length - 1;

// -------------------------------------------------------------------- frases
// match.json `quotes`: frases del entrenador/club que aparecen sobre el montaje.
// Sin frases, el video sale igual que siempre. Se reparten en la ventana de fotos
// y cada una vive ~85% de su tramo, así nunca hay dos en pantalla a la vez.
const frases = (m.quotes ?? []).filter((q) => q && q.text);
const FRASE_MARGEN = 1.0;          // no arrancar pegado al primer corte
const fraseVentana = frases.length
  ? (PHOTO_WINDOW - FRASE_MARGEN * 2) / frases.length
  : 0;

function cuerpoFrase(texto) {
  const n = texto.length;
  if (n <= 42) return 74;
  if (n <= 70) return 62;
  if (n <= 100) return 52;
  return 44;
}

const frasesHtml = frases.map((q, i) => `
      <div id="q${i}" style="
        position:absolute; left:72px; right:72px; bottom:210px; z-index:70; opacity:0;
        text-align:left;
      ">
        <div style="width:96px; height:5px; background:#EA580C; margin-bottom:26px;"></div>
        <div style="
          font-size:${cuerpoFrase(q.text)}px; font-weight:700; line-height:1.14; color:#fff;
          text-transform:uppercase; letter-spacing:0.005em;
          text-shadow:0 4px 28px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.9);
        ">${esc(q.text)}</div>
        ${q.author ? `<div class="meta" style="margin-top:22px; font-size:26px; color:rgba(255,255,255,0.82); text-shadow:0 2px 12px rgba(0,0,0,0.9);">${esc(q.author)}${q.role ? ` · ${esc(q.role)}` : ""}</div>` : ""}
      </div>`).join("");

const frasesTweens = frases.map((_, i) => {
  const t0 = +(T.photos + FRASE_MARGEN + i * fraseVentana).toFixed(2);
  const visible = +(fraseVentana * 0.85).toFixed(2);
  return `      tl.fromTo("#q${i}", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, ${t0});
      tl.to("#q${i}", { opacity: 0, y: -26, duration: 0.45, ease: "power2.in" }, ${(t0 + visible).toFixed(2)});`;
}).join("\n");


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
      .grad-bottom { position:absolute; inset:0; background:linear-gradient(to top, rgba(10,15,30,${frases.length ? "0.97" : "0.95"}) 0%, rgba(10,15,30,${frases.length ? "0.55" : "0.28"}) ${frases.length ? "34" : "38"}%, rgba(10,15,30,0) ${frases.length ? "70" : "62"}%); }
      .grad-top { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.30) 22%, rgba(10,15,30,0) 42%); }
      .velo { position:absolute; inset:0; }
      .franja { position:absolute; left:-200px; width:1480px; transform:rotate(-12deg); }
      .banda {
        display:inline-block; padding:22px 56px 14px; background:${RESULTADO.color};
        transform:skewX(-12deg); box-shadow:0 18px 60px rgba(0,0,0,0.5);
      }
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
      <!-- Carátula tipo póster: foto del partido de fondo y cara a cara de escudos.
           Todo visible desde el frame 0 (miniatura de WhatsApp). -->
      <div id="s1" class="scene" style="z-index:1;">
${fondoFoto("s1-bg", PORTADA, "saturate(1.15) brightness(0.7)",
  "linear-gradient(to bottom, rgba(10,15,30,0.78) 0%, rgba(10,15,30,0.18) 24%, rgba(10,15,30,0.30) 46%, rgba(10,15,30,0.92) 68%, rgba(10,15,30,0.98) 100%)")}
        <div id="s1-glow" data-layout-allow-overflow style="
          position:absolute; width:1100px; height:1100px; border-radius:50%;
          background:radial-gradient(circle, rgba(234,88,12,0.30) 0%, rgba(234,88,12,0) 66%);
          top:1330px; left:50%; transform:translate(-50%,-50%);
        "></div>
        <div class="franja" data-layout-allow-overflow style="top:1010px; height:14px; background:#EA580C; opacity:0.95;"></div>
        <div class="franja" data-layout-allow-overflow style="top:1046px; height:4px; background:rgba(255,255,255,0.55);"></div>

        <div style="position:absolute; top:110px; left:0; right:0; text-align:center; z-index:2;">
          <div class="chip" style="background:rgba(10,15,30,0.72); border-color:#EA580C;">${esc(m.tournament)}</div>
        </div>

        <div style="
          position:absolute; left:0; right:0; top:1110px; z-index:2;
          display:flex; flex-direction:column; align-items:center;
        ">
          <div id="s1-kicker" style="
            font-size:176px; font-weight:700; text-transform:uppercase;
            letter-spacing:0.04em; line-height:0.9; text-shadow:0 8px 40px rgba(0,0,0,0.6);
          ">Resultado</div>
          <div id="s1-line" style="width:300px; height:6px; background:#EA580C; margin-top:22px; transform-origin:center;"></div>
          <div id="s1-div" class="meta" style="margin-top:24px; font-size:32px; color:rgba(255,255,255,0.85);">${esc(m.division)} · ${esc(fechaLarga(m.date))}</div>
          <div id="s1-vs" style="margin-top:46px; display:flex; align-items:center; gap:44px;">
            <div id="s1-logo" style="width:170px; height:170px; display:flex; align-items:center; justify-content:center;">${escudo(wd, 170, "s1-wd")}</div>
            <div style="font-size:64px; font-weight:700; color:#EA580C; letter-spacing:0.06em;">VS</div>
            <div style="width:170px; height:170px; display:flex; align-items:center; justify-content:center;">${escudo(rival, 150, "s1-rival")}</div>
          </div>
        </div>

        <div id="s1-optima" style="
          position:absolute; left:0; right:0; bottom:84px; z-index:3;
          display:flex; flex-direction:column; align-items:center; gap:14px;
        ">
          <div style="width:64px; height:3px; background:rgba(255,255,255,0.2);"></div>
          ${logoOptima("s1-optima-img", 104, 0.95)}
        </div>
      </div>

      <!-- ============ S2 · Marcador ${T.score}–${T.photos}s ============ -->
      <div id="s2" class="scene" style="z-index:10; opacity:0;">
${fondoFoto("s2-bg", FONDO_MARCADOR, "blur(16px) brightness(0.42) saturate(0.85)",
  "linear-gradient(to bottom, rgba(10,15,30,0.72) 0%, rgba(10,15,30,0.45) 45%, rgba(10,15,30,0.9) 100%)")}
        <div class="franja" data-layout-allow-overflow style="top:1330px; height:230px; background:rgba(234,88,12,0.10);"></div>
        <div style="
          position:absolute; inset:0; padding:140px 60px;
          display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:2;
        ">
          <div id="s2-chip" class="chip" style="background:rgba(10,15,30,0.6);">${esc(m.tournament)}</div>
          <div id="s2-cat" style="
            font-size:120px; font-weight:700; text-transform:uppercase;
            letter-spacing:0.03em; margin-top:30px; line-height:1;
          ">${esc(m.division)}</div>
          <div id="s2-meta" class="meta" style="margin-top:18px;">${esc(fechaLarga(m.date))} · ${esc(m.venue)}</div>

          <div id="s2-card" style="
            margin-top:70px; width:960px; padding:54px 30px 50px; border-radius:44px;
            background:rgba(10,15,30,0.55); border:2px solid rgba(255,255,255,0.12);
            box-shadow:0 30px 80px rgba(0,0,0,0.45);
            display:flex; flex-direction:column; align-items:center;
          ">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; width:100%;">
${lado(home, 0)}
              <div style="padding-top:88px; font-size:44px; font-weight:700; color:rgba(255,255,255,0.4); letter-spacing:0.1em;">VS</div>
${lado(away, 1)}
            </div>
            <div style="display:flex; align-items:center; justify-content:center; gap:40px; margin-top:40px;">
              ${marcador(home, 0)}
              <div style="width:60px; height:12px; background:rgba(255,255,255,0.45);"></div>
              ${marcador(away, 1)}
            </div>
          </div>

          <div style="text-align:center; margin-top:70px;">
            <div id="s2-result" class="banda" data-layout-allow-overflow>
              <div style="
                transform:skewX(12deg); font-size:112px; font-weight:700; text-transform:uppercase;
                letter-spacing:0.06em; line-height:1; color:#fff;
              ">${RESULTADO.texto}</div>
            </div>
            <div id="s2-status" class="meta" style="margin-top:30px; letter-spacing:0.34em;">${esc(m.status)}</div>
          </div>
        </div>
      </div>
      <!-- ============ S3 · Fotos ${T.photos}–${T.outro}s ============ -->
${escenasFoto}

      <!-- Barra de marcador compacta sobre las fotos -->
      <div id="bar" style="
        position:absolute; top:96px; left:60px; right:60px; z-index:60; opacity:0;
        display:flex; align-items:center; gap:26px;
        padding:26px 34px 32px; border-radius:28px;
        background:rgba(10,15,30,0.74); border:2px solid rgba(255,255,255,0.12);
        backdrop-filter:blur(8px);
      ">
        ${escudo(home, 78, "bar-h")}
        <div style="flex:1; font-size:46px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; line-height:1;">${esc(home.abbr)}</div>
        <div style="font-size:74px; font-weight:700; line-height:0.85; font-variant-numeric:tabular-nums;"><span style="color:${home.isWildDogs ? "#EA580C" : "#fff"};">${home.score}</span><span style="color:rgba(255,255,255,0.45); margin:0 14px;">–</span><span style="color:${away.isWildDogs ? "#EA580C" : "#fff"};">${away.score}</span></div>
        <div style="flex:1; text-align:right; font-size:46px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; line-height:1;">${esc(away.abbr)}</div>
        ${escudo(away, 78, "bar-a")}
        <div style="position:absolute; left:34px; right:34px; bottom:10px; height:5px; border-radius:3px; background:rgba(255,255,255,0.12); overflow:hidden;">
          <div id="bar-prog" style="width:100%; height:100%; background:#EA580C; transform:scaleX(0); transform-origin:left;"></div>
        </div>
      </div>

      <!-- Barridos naranjas entre fotos -->
${barridosHtml}

      <!-- Logo del patrocinador sobre las fotos -->
      <div id="opt-fotos" style="
        position:absolute; left:0; right:0; bottom:58px; z-index:65; opacity:0;
        display:flex; justify-content:center;
      ">
        ${logoOptima("opt-fotos-img", 74, 0.95)}
      </div>

      <!-- Frases del entrenador sobre las fotos -->
${frasesHtml}

      <!-- ============ S4 · Cierre ${T.outro}–${T.end}s ============ -->
      <div id="s4" class="scene" style="z-index:80; opacity:0;">
${fondoFoto("s4-bg", FONDO_CIERRE, "blur(18px) brightness(0.35) saturate(0.8)",
  "radial-gradient(circle at 50% 45%, rgba(10,15,30,0.35) 0%, rgba(10,15,30,0.92) 75%)")}
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
          <div id="s4-handle" class="meta" style="margin-top:30px; font-size:34px; line-height:1.5; text-align:center; color:rgba(255,255,255,0.78);">${esc(m.handle)}<br/>${esc(m.site)}</div>
        </div>
        <div id="s4-optima" style="
          position:absolute; left:0; right:0; bottom:118px; z-index:3;
          display:flex; flex-direction:column; align-items:center; gap:14px;
        ">
          <div style="width:64px; height:3px; background:rgba(255,255,255,0.16);"></div>
          ${logoOptima("s4-optima-img", 132, 0.95)}
        </div>
        <div id="s4-fade" style="position:absolute; inset:0; background:#0a0f1e; opacity:0; z-index:10;"></div>
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      // ---- S1 Apertura
      // Todo visible desde el frame 0 (miniatura de WhatsApp); solo hay movimiento sutil después.
      tl.fromTo("#s1-bg",   { scale: 1.0 }, { scale: 1.07, duration: ${T.score}, ease: "none" }, 0);
      tl.fromTo("#s2-bg",   { scale: 1.12 }, { scale: 1.2, duration: ${(T.photos - T.score + 0.2).toFixed(2)}, ease: "none" }, ${(T.score - 0.2).toFixed(2)});
      tl.fromTo("#s4-bg",   { scale: 1.12 }, { scale: 1.2, duration: ${(T.end - T.outro + 0.3).toFixed(2)}, ease: "none" }, ${(T.outro - 0.3).toFixed(2)});
      tl.fromTo("#s1-glow", { scale: 0.9, opacity: 0.6 }, { scale: 1.08, opacity: 1, duration: 1.6, ease: "sine.inOut" }, 0.2);
      tl.to("#s1-logo",     { scale: 1.06, duration: 0.45, ease: "power2.out" }, 0.4);
      tl.to("#s1-logo",     { scale: 1.0,  duration: 0.55, ease: "power2.inOut" }, 0.86);
      tl.fromTo("#s1-line", { scaleX: 0.3 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, 0.5);
      tl.from("#s1-vs",     { y: 26, opacity: 0.5, duration: 0.6, ease: "power2.out" }, 0.7);
      tl.from("#s1-optima", { y: 18, opacity: 0.35, duration: 0.7, ease: "power2.out" }, 1.0);

      // ---- S1 -> S2
      tl.to("#s1", { opacity: 0, filter: "blur(12px)", duration: 0.26, ease: "power2.in" }, ${(T.score - 0.28).toFixed(2)});
      tl.fromTo("#s2", { opacity: 0, filter: "blur(12px)" },
                       { opacity: 1, filter: "blur(0px)", duration: 0.36, ease: "power3.out" }, ${(T.score - 0.18).toFixed(2)});

      // ---- S2 Marcador
      tl.from("#s2-chip",   { y: -30, opacity: 0, duration: 0.42, ease: "power3.out" }, ${(T.score + 0.12).toFixed(2)});
      tl.from("#s2-cat",    { y: 56, opacity: 0, duration: 0.52, ease: "expo.out" }, ${(T.score + 0.3).toFixed(2)});
      tl.from("#s2-meta",   { opacity: 0, duration: 0.45, ease: "power2.out" }, ${(T.score + 0.55).toFixed(2)});
      tl.from("#s2-card",   { y: 70, opacity: 0, duration: 0.6, ease: "power3.out" }, ${(T.score + 0.6).toFixed(2)});
      tl.from("#row0",      { x: -120, opacity: 0, duration: 0.48, ease: "expo.out" }, ${(T.score + 0.82).toFixed(2)});
      tl.from("#row1",      { x: 120, opacity: 0, duration: 0.48, ease: "expo.out" }, ${(T.score + 0.98).toFixed(2)});

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

      tl.from("#s2-result", { x: -700, opacity: 0, duration: 0.5, ease: "expo.out" }, ${(T.score + 1.95).toFixed(2)});
      tl.from("#s2-status", { opacity: 0, scaleX: 1.25, duration: 0.55, ease: "power2.out" }, ${(T.score + 2.3).toFixed(2)});

      // ---- S2 -> fotos
      tl.to("#s2",  { opacity: 0, duration: 0.2, ease: "power2.in" }, ${(T.photos - 0.24).toFixed(2)});
      tl.fromTo("#bar", { opacity: 0, y: -60 },
                        { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" }, ${(T.photos + 0.1).toFixed(2)});
      tl.fromTo("#opt-fotos", { opacity: 0, y: 24 },
                              { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${(T.photos + 0.25).toFixed(2)});

${tweensFoto}
${barridosTweens}
${frasesTweens}
      tl.fromTo("#bar-prog", { scaleX: 0 }, { scaleX: 1, duration: ${PHOTO_WINDOW.toFixed(2)}, ease: "none" }, ${T.photos});

      // ---- fotos -> S4
      tl.to("#bar", { opacity: 0, y: -50, duration: 0.3, ease: "power2.in" }, ${(T.outro - 0.36).toFixed(2)});
      tl.to("#opt-fotos", { opacity: 0, duration: 0.3, ease: "power2.in" }, ${(T.outro - 0.36).toFixed(2)});
      tl.to("#p${ultimaFoto}", { opacity: 0, duration: 0.3, ease: "power2.in" }, ${(T.outro - 0.3).toFixed(2)});
      tl.fromTo("#s4", { opacity: 0, scale: 0.94 },
                       { opacity: 1, scale: 1, duration: 0.46, ease: "power3.out" }, ${(T.outro - 0.24).toFixed(2)});

      // ---- S4 Cierre
      tl.from("#s4-logo",   { scale: 0.7, opacity: 0, duration: 0.6, ease: "back.out(1.7)" }, ${(T.outro + 0.15).toFixed(2)});
      tl.from("#s4-name",   { y: 46, opacity: 0, duration: 0.55, ease: "power3.out" }, ${(T.outro + 0.5).toFixed(2)});
      tl.to("#s4-bar",      { width: 340, duration: 0.55, ease: "power3.out" }, ${(T.outro + 0.85).toFixed(2)});
      tl.from("#s4-optima", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, ${(T.outro + 0.95).toFixed(2)});
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
  `${RESULTADO.texto} · ${fotos.length} foto(s) · ${frases.length} frase(s) · ${T.end}s · música: ${pista ?? "ninguna"}`
);
