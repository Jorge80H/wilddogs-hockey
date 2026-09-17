# wilddogs-match-video

Video vertical (1080×1920, 15s) con el resultado de un partido, listo para
Reels / TikTok / Shorts. Composición [HyperFrames](https://hyperframes.heygen.com)
renderizada a MP4.

La ruta pensada para usarlo es la skill **`/video-partido`**: le dices el marcador,
le pasas las fotos y ella hace el resto. Este README documenta el proyecto por debajo.

## Uso

```bash
npm install --ignore-scripts        # ver "Entorno" antes de omitir el flag (en Windows añade --force)
# 1. editar match.json con los datos del partido
# 2. dejar las fotos en assets/photos/
npm run check                       # build + lint + validate + inspect
npm run render                      # MP4 en renders/
```

## Cómo está armado

`index.html` **se genera** — la fuente es `build.mjs`, que lee `match.json` y
escribe la composición. Edita `build.mjs`; cualquier cambio directo al HTML se
pierde en el siguiente build.

```
match.json   →   build.mjs   →   index.html   →   hyperframes render   →   renders/*.mp4
```

| Archivo | Qué es |
|---|---|
| `match.json` | Lo único que cambia entre partidos: marcador, equipos, categoría, fotos |
| `build.mjs` | Genera el HTML. Contiene los tiempos (`T`), el layout y las tweens de GSAP |
| `assets/teams/` | Escudos reales, nombrados por slug del equipo |
| `assets/photos/` | Fotos del partido |
| `assets/music/` | Pistas del club + `tracks.json` con el segundo de entrada de cada una |
| `assets/fonts/` | Big Shoulders y Outfit (OFL), servidas localmente |
| `assets/vendor/` | GSAP vendorizado |

### Escudos

`build.mjs` busca `assets/teams/<slug>.{png,webp,svg,jpg}` — `"Optima Wild Dogs"`
→ `optima-wild-dogs.png`. Si no lo encuentra, dibuja un escudo monograma con las
iniciales del equipo y un color derivado del nombre por hash, así que **un rival
nuevo nunca rompe el render** y siempre sale del mismo color. Para reemplazarlo por
el logo real basta con dejar el archivo con el slug correcto; no hay que tocar código.

### Determinismo

HyperFrames renderiza muestreando el timeline fotograma a fotograma, así que la
composición no puede depender de `Date.now()`, `Math.random()` ni de la red. Por eso
GSAP y las tipografías se sirven desde `assets/` en lugar de un CDN. Cualquier
librería nueva hay que vendorizarla igual.

## Entorno

En contenedores sin ffmpeg ni Chrome del sistema (como los de Claude Code on the web):

- **Chrome**: `export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
  Sin esto HyperFrames intenta descargar chrome-headless-shell y la política de red lo bloquea.
- **ffmpeg / ffprobe**: vienen como dependencias npm y `build.mjs` los enlaza en
  `node_modules/.bin` en cada build. El ffmpeg que trae Playwright solo soporta VP8, no sirve.
- **`--ignore-scripts` no es opcional**: el postinstall de `onnxruntime-node` (dependencia
  transitiva de HyperFrames, para transcripción y quitado de fondos) intenta descargar
  desde `api.nuget.org` y tumba la instalación completa si ese host está bloqueado.

## Licencias

Big Shoulders y Outfit son SIL Open Font License — ver `assets/fonts/*-OFL.txt`.
