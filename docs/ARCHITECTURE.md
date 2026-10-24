# Architecture

FLE Virtual Worlds is a static website: plain HTML, ES modules and JSON, with no build step for the web pages. Python and Node scripts are used only for offline rendering and testing.

## Repository layout

```
index.html                 Portal (gallery, Time · Place · Purpose filters, time axis)
portal/                    Portal CSS/JS and preview images (portal/img/<world-id>.jpg)
worlds/                    One manifest per world (+ schema.json, index.json)  ← the shared world format
journeys/                  Skyship journeys: timed flights through worlds (+ schema.json, index.json, audio/)
skyship-engine/            Shared engine: journey.html, js/score.js, worlds/*.js (new worlds), render_journey.py
sci-fi-360/                Original Sci-Fi 360 kit (unchanged); its lib.js, world modules and vendored three.js are shared
skyship-360/               Original Skyship 360 kit (unchanged)
worlds-within-worlds/      The 90-minute film engine and studio (separate GLSL raymarcher)
world-tour/                Player for the World Tour short (video only)
tools/qa/                  check_worlds.py (automated tests), make_previews.py
docs/                      This documentation
```

## Three rendering engines, kept separate

| Engine | Where | Technique | Used by |
|---|---|---|---|
| Skyship (three.js) | `sci-fi-360/skyship.html`, `skyship-engine/journey.html` | three.js r160 scene graph, procedural geometry, canvas textures | Sci-Fi 360, the shared engine, all new worlds |
| Skyship 360 city tour (three.js) | `skyship-360/skyship.html` | three.js; one scrolling city "strip" re-dressed per city | Original World Tour kit |
| Film raymarcher (WebGL2 GLSL) | `worlds-within-worlds/` | one fragment shader per world (`src/worlds/*.glsl`), offline frame renderer | ARCHIVE: Worlds Within Worlds |

The film raymarcher is deliberately **not** merged into three.js. Its worlds are signed-distance-field shaders, and porting them would mean re-modelling them, not re-hosting them. The portal links into the film studio at each world's chapter (`ARCHIVE_Studio.html?chapter=N`). See `RECOMMENDATIONS.md` for how to adapt them into interactive worlds.

## The shared skyship engine

`skyship-engine/journey.html` started as a copy of `sci-fi-360/skyship.html`; that original stays untouched so its render kit keeps working. Everything that was hard-wired to the four sci-fi worlds now comes from data:

```
journey.html?journey=<id>&mode=cinematic|explore|learn
   │
   ├─ journeys/<id>.json      worlds + time windows, ARCHIVE cues, final message, lesson, audio, QA shots
   └─ worlds/<world>.json     module + build function, atmosphere (lighting/fog/sky), cabin-screen text,
                              facts, stops, hotspots, score settings, disclaimer
         └─ <module>.js       build(ctx) → { group, path, update(t), anchors, telescope, colliders?, blockRoof? }
```

**What the engine owns** (shared by every world): the skyship and cabin, ARCHIVE (moods, gaze, pointing, gestures), the six cabin screens (HUD, timeline, story file, telescope, belly camera, status), sky dome, clouds, the Earth/Moon, cloud-whiteout transitions between worlds, the 360 equirectangular capture, WebXR, controls, Explore and Learn modes (stops, hotspot markers, info cards, lesson panel), the journey menu, sound, and the render API used by the video renderer and the tests.

**What a world owns**: its geometry, its flight path (`FlightPath` keys in the world's own time), animation (`update(t)`), named `anchors` (points ARCHIVE and the hotspots refer to), and `telescope` targets. Optional `colliders` (axis-aligned boxes) let the tests measure how close the flight path comes to structures.

### Time

* **Journey time** `t` drives the flight, ARCHIVE's cues and the screens.
* **World-local time** = `t + timeOffset` (from the journey file), so a world's path can start at any time. The original orbit world's path starts at 116 s and is reused untouched.
* **Live time** keeps running while the ship hovers at a stop in Explore/Learn, so vehicles, water and people keep moving. In Cinematic mode, live time equals journey time, so 360 renders are frame-exact and repeatable.

### Shared building blocks (`sci-fi-360/js/lib.js`)

Math helpers, `FlightPath` (Hermite path with smoothed heading), `Builder` (merges geometry per material to keep draw calls low), `boxGeo`/`cylGeo` (metre-scaled UVs), canvas facade textures, `SpriteField` (camera-facing sprites that stay seamless across the six 360 cube faces), `People` (instanced walkers animated in the vertex shader), `Movers` (instanced vehicles on lanes). New worlds import these from the same file, so there is one copy.

### Connecting worlds

Worlds connect through **journeys**. A journey lists world segments; the engine crossfades atmospheres and runs a cloud whiteout `transition` seconds either side of each boundary, and ARCHIVE's cues carry the story across. Columbus 2050's path climbs from 84 m to about 650 m through its cloud band (380–600 m) at the end, then the whiteout opens on the habitat with Earth below. Each world is also reachable on its own (single-world journeys `columbus-2050`, `orbital-habitat`). World manifests declare `portals` (`to`, `via` journey) for the portal and future navigation.

### Experience modes

| Mode | What happens | Implementation |
|---|---|---|
| Cinematic | Guided flight with ARCHIVE's lines, title holograms, music, fades | Original behaviour; used for all video renders |
| Explore | "Stops" row; the ship flies to a stop and hovers; glowing markers mark hotspots; tapping one opens an info card and ARCHIVE turns to it (the telescope zooms in too) | `STOPS`, `HOTSPOTS`, `flyToStop`, `openHotspot`, DOM markers projected from 3D anchors each frame |
| Learn | Explore + a lesson panel (objectives tick off as hotspots are investigated) + multiple-choice questions on the cards | `J.lesson`, hotspot `question`; progress kept in `localStorage` per journey (optional, wrapped in try/catch) |

### Video output

* `skyship-engine/render_journey.py` renders any journey as a 360 MP4 (equirectangular, with spherical metadata from Google's Spatial Media tool, vendored in `sci-fi-360/spatialmedia`) or a 16:9 MP4 (`--flat`). Its resumable 10-second parts and page API are the same as `sci-fi-360/render_360.py`.
* The originals keep their own renderers: `sci-fi-360/render_360.py`, `skyship-360/render_360.py`, `worlds-within-worlds/render/render.mjs`.

### Sound

A journey's `audio.file` (pre-rendered MP3) is used when present. Otherwise the page composes a score with `skyship-engine/js/score.js` from each world's `audio.score` settings (chords, bells, pulse, ambience), in an OfflineAudioContext so the live page and the video share one mix. `scifi-classics` reuses the original Sci-Fi soundtrack and composer.

## Dependencies

* three.js r160 (vendored in `sci-fi-360/vendor/` and, identically, `skyship-360/vendor/`; MIT); the shared engine loads the sci-fi-360 copy through an import map.
* Google Fonts (optional; pages fall back to system fonts offline).
* Rendering and tests: Python 3.10+, `playwright`, `pillow`, `imageio-ffmpeg` (or FFmpeg on PATH), `jsonschema` for data checks. The film renderer needs Node 18+.

## Path conventions

All links are relative, so the site works from any sub-path, for example `https://<user>.github.io/VirtualWorlds/`. Manifest paths (`launch`, `preview`, `engine.module`) are relative to the repository root; journey `audio.file` is relative to `skyship-engine/journey.html`.
