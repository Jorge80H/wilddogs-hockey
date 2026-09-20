---
name: video-partido
description: Genera el video vertical (1080x1920, Reels/TikTok/Shorts) con el resultado de un partido de Wild Dogs Hockey Club, a partir del marcador y de las fotos tomadas en la cancha. Úsalo cuando el usuario reporte cómo quedó un partido ("ganamos 4-2 al Condors", "quedamos empatados en Sub 14", "haz el video del partido de hoy"), pida el video/reel/resumen de un partido, o señale una carpeta de Drive con fotos de un partido.
---

# Video de resultado de partido

Convierte **marcador + fotos** en un MP4 vertical de 30s listo para publicar.
El proyecto vive en `wilddogs-match-video/` y ya está construido: tu trabajo es
llenar `match.json`, poner las fotos y renderizar. **No rediseñes la composición**
salvo que el usuario lo pida.

## Flujo

### 1. Reúne los datos del partido

El usuario suele dar el partido en lenguaje natural ("le ganamos 4-2 al Condors en
Sub 14", "el video del Sub 14 de hoy"). Con eso ubica el partido en InstantDB, que es
la misma fuente que alimenta la sección Torneos del sitio, y **de ahí saca lo demás**:
fecha y hora, rival, categoría, sede (`location`), localía (`isHome`), liga y, si ya
está jugado, el marcador (`homeScore`/`awayScore`). No asumas nada que la base pueda
confirmar.

```bash
# Admin API de InstantDB (App-Id y token están en los workflows n8n eOoRNMJ9gVBMpkom / vgxiCfTncfkIhtrQ)
curl -s https://api.instantdb.com/admin/query \
  -H "Content-Type: application/json" -H "App-Id: 27acc1e8-fce9-4800-a9cd-c769cea6844f" \
  -H "Authorization: Bearer <token>" \
  -d '{"query":{"matches":{"$":{"where":{"league":"fedehockey"}}}}}'
```

- `date` es epoch ms en UTC; filtra en el cliente por día (hora Bogotá) y por
  `opponent`/`notes` (la categoría va en `notes`, ej. `"SUB14"` o `"Copa ... - Sub-14"`).
  Los comparadores `$gte`/`$lte` fallan en `date` (no está indexado): trae por `league` y filtra.
- Busca en las dos ligas si el usuario no dice cuál. Un mismo día puede haber varios
  partidos de la misma categoría (torneos a doble jornada): si hay ambigüedad, muestra
  las opciones y que el usuario elija.
- **Contrasta** lo que dijo el usuario con lo que hay en la base. Si el marcador o la
  localía no coinciden, pregunta antes de renderizar — la base puede estar sin sincronizar
  (el cron corre a medianoche) o el usuario puede recordar mal; ninguno de los dos manda solo.
- Si el partido aún no aparece en la base (se jugó hoy y el sync no ha corrido), usa los
  datos del usuario, asume local si no lo dice, y dilo al entregar.
- Si el clasificador de permisos bloquea la lectura directa, pídele al usuario que la
  autorice — es una lectura, no escribe nada.

El nombre oficial del club es **"Optima Wild Dogs"** — escríbelo así en `match.json`
para que el escudo real se resuelva (ver §3).

### 2. Consigue las fotos

Por orden de preferencia:

1. **Adjuntas en el chat** o ya en disco → cópialas a `wilddogs-match-video/assets/photos/`.
2. **Google Drive** → `mcp__Google_Drive__search_files` para ubicar las fotos (por carpeta,
   o por `modifiedTime` del día y `owner = 'me'` si están sueltas — las de WhatsApp se llaman
   `IMG-AAAAMMDD-WA00NN.jpg`). En el PC del usuario Drive está sincronizado en `H:\Mi unidad`:
   copia desde ahí en vez de bajar base64 con `download_file_content` (solo como último recurso).
   Si el usuario no dice cuál es la carpeta, busca por fecha o por el nombre del rival.
   El repositorio de fotos del club es la carpeta compartida **"Redes Sociales"**
   (id `1Xi9xbpL8r1eM6xfVo8WTwVX2_RsSbURZ`, dueño `tgohockeyacademy@gmail.com`): tiene
   subcarpetas por categoría (Sub 8/10/12/16), por evento ("Competencia", "finales 1° 2026",
   "CAMP", "Noche de Gala"…) y por jugador. Empieza por la carpeta del partido si existe;
   si no, mira "Competencia" y la carpeta de la categoría, y prioriza fotos con
   `createdTime` del día del partido.
3. Si no hay fotos, **detente y pídelas**: el video no funciona sin ellas.

De 8 a 12 fotos es el rango bueno (los padres quieren ver a sus hijos: usa todas las que sirvan). Con más, elige las mejores: acción, celebración,
caras visibles, horizonte recto. Descarta borrosas y repetidas. Las fotos se
recortan a vertical desde el centro (`object-fit:cover`), así que evita aquellas
cuyo sujeto quede en un extremo del encuadre. Si vienen muy altas (9:20 de celular) o
con los jugadores lejos, **recorta a 9:16 alrededor del sujeto** con PIL antes de guardarlas
(1080x1920) — un plano cerrado vale más que la foto entera. Después de renderizar, siempre
también hay que **publicar el video como noticia** en el inicio (ver §6).

### 3. Escudos de los equipos

`build.mjs` busca `assets/teams/<slug-del-nombre>.{png,webp,svg,jpg}`.
Si existe, lo usa; si no, **genera un escudo monograma** con las iniciales y un
color estable derivado del nombre (el mismo rival siempre sale del mismo color).

- Wild Dogs ya tiene su escudo real en `assets/teams/optima-wild-dogs.png`.
- Ya están los escudos reales de los rivales de Fedehockey (Aces, Águilas, Andino's Roar,
  Avalancha, Condors, H2S Lions, Katíos, Lightning, Rabbits, Rinos Napalm, Velociraptors,
  V-Raptors), con fondo transparente y alias para las variantes de nombre que usan las
  ligas (`condors-negro`, `condors-azul`, `rinos-napalm`, `v-raptors`).
- Un rival que no esté ahí cae en monograma. Es el comportamiento esperado, no un error:
  **no bloquees el render por esto ni inventes un logo**.
- Para conseguir el escudo de un rival nuevo: la API de DigitalShift (Fedehockey) los
  publica en `https://digitalshift-stats.us-lax-1.linodeobjects.com/.../team-logo_url-<id>-<slug>-<ts>.png`
  (la URL sin sufijo es la original de 400px; `-small` es un thumbnail). Las URLs aparecen
  en la salida del nodo "Get Standings" de la última ejecución del workflow n8n
  `vgxiCfTncfkIhtrQ`. Descarga con User-Agent de navegador (Python `urllib` sin UA da 403),
  quita el fondo uniforme con flood-fill desde los bordes y guárdalo con el slug correcto.
  Fedepatín (Supabase) trae `teams.logo_url = null`, no sirve como fuente.
- Si el usuario aporta el logo de un rival, guárdalo con el slug correcto
  (`Club Los Cóndores` → `club-los-condores.png`) y se usará solo.

### 4. Escribe `match.json`

```json
{
  "tournament": "Liga de Bogotá · Fedehockey",
  "division": "Sub 14",
  "date": "2026-09-17",
  "venue": "Coliseo El Salitre · Bogotá",
  "status": "FINAL",
  "home": { "name": "Optima Wild Dogs", "abbr": "WD",  "score": 4, "isWildDogs": true },
  "away": { "name": "Condors",          "abbr": "CON", "score": 2, "isWildDogs": false },
  "photos": ["assets/photos/1.webp", "assets/photos/2.webp"],
  "music": "auto",
  "quotes": [
    { "text": "Hoy demostraron que son unos guerreros", "author": "Andy", "role": "Entrenador" }
  ],
  "handle": "@optimawilddogs",
  "site": "optimawilddogs.com"
}
```

- `quotes` (opcional): frases que aparecen sobre el montaje de fotos, repartidas en la
  ventana y una a la vez. Sin `quotes` el video sale igual que siempre. **De aquí salen:**
  el mensaje que el entrenador manda al grupo de WhatsApp después del partido — pídeselo al
  usuario o usa el que pegue en el chat. Saca 2-3 frases **cortas** (máx ~45 caracteres se
  ven grandes; hasta ~100 aún caben), recortadas del mensaje real sin inventar nada ni
  cambiarle el sentido, y acredítalas a quien las dijo (`author` + `role`).

- `music`: `"auto"` elige una pista de `assets/music/` de forma estable para ese partido
  (misma fecha+categoría+rival → misma pista), un nombre de archivo (`"furia-sobre-el-hielo.mp3"`)
  la fuerza, `"none"` deja el video mudo. Cada pista entra en su tramo más enérgico
  (`assets/music/tracks.json`, campo `start`, ventana de 30s) con fade-in de 0.8s y fade-out de 2.2s.
  Para agregar una canción: copiarla a `assets/music/` y añadir su entrada en `tracks.json`.

- `home` / `away` deben reflejar la localía real; `isWildDogs: true` va en el bloque
  del club, sea cual sea. De ahí sale el destacado naranja y el cálculo de
  VICTORIA / EMPATE / DERROTA.
- `abbr`: 2-4 letras, es lo que aparece en la barra sobre las fotos.
- `photos`: rutas relativas a la raíz del proyecto, en el orden en que se verán.
  El tiempo de montaje se reparte entre ellas automáticamente.

### 5. Renderiza y **mira** el resultado

```bash
cd wilddogs-match-video
npm run check    # build + lint + validate + inspect
npm run render   # deja el MP4 en renders/
```

`npm run check` debe terminar con **0 errores de lint y 0 problemas de layout**.
Los avisos `text_occluded` en `t=2.5s` (textos de S1 tapados por S2) y el warning
`duplicate_media_discovery_risk` son falsos positivos conocidos: son la transición entre
escenas y el mismo logo usado dos veces. Ignóralos. Cualquier otro aviso sí revísalo.
No animes `letterSpacing` con GSAP: el lint de hyperframes ≥ 0.8 lo rechaza; usa `scaleX`.

Después de renderizar, **extrae fotogramas y míralos** antes de entregar — es la
única forma de detectar un nombre desbordado, una foto mal recortada o un escudo
que no cargó:

```bash
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
V=$(ls -t renders/*.mp4 | head -1)
for t in 0 5.8 12 20 29; do $FF -v error -ss $t -i "$V" -frames:v 1 -vf scale=432:-1 /tmp/f_$t.png -y; done
```

Entrega el MP4 con `SendUserFile` y di el marcador, la duración y cuántas fotos entraron.

### 6. Publica en el inicio (sección "Noticias Recientes")

```bash
# comprimir para web (~2-4 MB) + póster
ffmpeg -y -i renders/<render>.mp4 -c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p   -movflags +faststart -c:a aac -b:a 128k ../public/videos/resultado-<fecha>-<cat>-<rival>.mp4
ffmpeg -y -i ../public/videos/<mismo>.mp4 -frames:v 1 -vf scale=540:-1 ../public/videos/<mismo>.jpg
```

Luego crea el `newsPosts` en InstantDB (`POST admin/transact`, step `["update","newsPosts",<uuid>,{...}]`)
con `title`, `excerpt`, `content` (3 párrafos cortos, tono de club), `imageUrl` (el .jpg),
`videoUrl` (el .mp4), `status:"published"`, `publishedAt/createdAt/updatedAt`. La tarjeta
del Landing reproduce el video en bucle silencioso y el modal con controles. Commit + push
a `main` despliega en Netlify. Si se re-renderiza un partido, sobrescribe el mismo archivo
para no tocar la noticia.

## Estructura del video (30s)

| Tramo | Contenido |
|---|---|
| 0–3s | Carátula: logo, "RESULTADO", categoría, fecha y "VS rival". **Visible completa desde el fotograma 0** — WhatsApp usa ese frame como miniatura; si sale oscuro nadie da play |
| 3–8s | Placa de marcador: torneo, categoría, sede, escudos, marcador que cuenta, VICTORIA/EMPATE/DERROTA |
| 8–27.9s | Montaje de fotos (~2s por foto) con Ken Burns y barra compacta de marcador arriba |
| 27.9–30s | Logo, "Wild Dogs Hockey Club", handle y sitio (la música sale con fade) |

Los tiempos están en la constante `T` de `build.mjs`. Cambiar `T.end` exige ajustar
también `data-duration` (lo hace solo) y revisar que las tweens sigan dentro del rango.

## Reglas de la composición

`index.html` es **generado** — edita `build.mjs`, nunca el HTML, o el próximo
`npm run build` borrará tus cambios.

HyperFrames exige determinismo: sin `Date.now()`, sin `Math.random()`, sin peticiones
de red en tiempo de render. Por eso GSAP y las tipografías están servidos desde
`assets/` en vez de un CDN. Si añades una librería, vendorízala igual.

## Entorno

Este contenedor no tiene ffmpeg ni Chrome del sistema, y la política de egress
bloquea las descargas que HyperFrames intenta por su cuenta. Ya está resuelto así:

- **Chrome**: exporta `HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
  antes de `check` o `render`. Sin esto intenta bajar chrome-headless-shell y recibe 403.
- **ffmpeg / ffprobe**: llegan como dependencias npm; `build.mjs` los enlaza en
  `node_modules/.bin` en cada build. El ffmpeg de Playwright **no sirve** (solo VP8).
- **`npm install`**: usa siempre `--ignore-scripts`. El postinstall de `onnxruntime-node`
  intenta alcanzar `api.nuget.org`, que está bloqueado, y tumba la instalación entera.

Bloqueados por egress en este entorno: `cdn.jsdelivr.net`, `storage.googleapis.com`,
`api.nuget.org`, y las fuentes de las federaciones (`*.supabase.co`, `fedehockey.com`,
`digitalshift.ca`). `registry.npmjs.org` sí está permitido. No intentes rodearlos.

## Publicación

El render no se publica solo. Entrega el archivo y deja que el usuario decida.
Si pide publicarlo, confirma la cuenta y el texto antes de enviar nada.
