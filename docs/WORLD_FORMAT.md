# World format: adding a world without touching the engine

A world has two parts:

1. **A manifest**: `worlds/<id>.json`, validated by `worlds/schema.json`. It holds everything people see, plus configuration: name, categories, time, place, purposes, learning objectives, launch links, status, lighting/atmosphere, cabin-screen text, facts, stops, hotspots, audio, portals and supported formats.
2. **For skyship worlds, a module**: an ES module exporting `build(ctx)`. It holds only geometry, motion and named points. The world-specific rendering code stays here.

Worlds that run elsewhere (the film studio, the original kits) need only a manifest with `launch` links, so the portal can list them.

## Manifest fields

| Field | Purpose |
|---|---|
| `id`, `name`, `kind` | Identity. `kind`: `world` (shared engine), `experience` (standalone app), `film`, `film-world` |
| `summary`, `description` | Portal card and long description |
| `categories` | `sustainability` (green), `technology` (red), `space` (purple); one or more |
| `time` | `era` (past / present / future / past-to-future), `label`, optional `year` |
| `place` | `type` (city / campus / laboratory / orbit / spacecraft / planet / virtual), `name`, `fictional`, optional `geo` |
| `purposes` | explore / learn / simulate / design / experience a story |
| `learningObjectives` | Shown in Learn mode |
| `status.stage` | planned / draft / pilot / complete / film-only. **Do not mark unbuilt work as complete.** |
| `disclaimer` | Shown in the engine whenever this world is on screen |
| `launch[]` | `{label, href, mode?}`; `href` is relative to the repository root |
| `preview` | `portal/img/<id>.jpg`; generate with `python tools/qa/make_previews.py` |
| `engine` | `module`, `build`, `space`, `earth`, `cabinLight`, `entry` (entry camera), `display` (screen text), `atmosphere` (lighting and atmosphere) |
| `navigation` | Modes and controls offered |
| `stops[]` | `{t, name, hotspots[]}`, where `t` is **world-local** time; where the ship hovers in Explore/Learn |
| `hotspots[]` | `{id, anchor, label, category, kicker, title, text, facts[{text,source}], archive, size, range?, question?{q,options,answer,why}}` |
| `facts[]` | `{text, source}`, cycled on the cabin's Story File screen |
| `assets` | Models, textures, shared code and data sets the world uses |
| `audio.score` | Settings for the composed score (chords as MIDI notes, bells, pulse, ambience, drone, brightness) |
| `portals[]` | `{to, via, label}`: connections to other worlds, through a journey |
| `formats` | desktop / mobile / webxr / video360 / video16x9 |
| `gis` | `ready`, `source`, `notes`: whether the world is built on real map data (see ARCHITECTURE.md, *Worlds on real geography*) |

## The module contract

```js
import * as THREE from 'three';
import { V3, FlightPath, Builder, boxGeo, People, Movers /* … */ } from '../../sci-fi-360/js/lib.js';

export function buildMyWorld(ctx) {          // ctx: { mat(color, opts), makeBlocks(list), envMats, shipPos, fog }
  const group = new THREE.Group();
  // … build geometry into group (use Builder to merge by material) …
  const path = new FlightPath([[t, x, y, z], …]);   // world-local seconds, metres; forward is the direction of travel
  function update(t, ctx) { /* animate; return { flash } to light up the sky (optional) */ }
  const anchors = { landmark: new V3(…), … };        // named points for ARCHIVE's gaze, hotspots, telescope
  const telescope = [{ t0, t1, name, fact, at: anchors.landmark, size }];
  const colliders = [[minX, minY, minZ, maxX, maxY, maxZ, 'label'], …]; // optional: path-clearance test
  return { group, path, update, anchors, telescope, colliders };
}
```

Rules of thumb:

* Units are metres, x east, y up, z south (forward on a path is the direction of travel).
* Keep the ship's path at least 15 m from any collider. The test `check_worlds.py journey` measures this.
* Use `SpriteField` for anything camera-facing (it stays seamless in 360 captures).
* Use `ctx.mat()` for standard materials so lighting changes (and lightning flashes) reach them.
* Keep animation a pure function of `t`, so 360 renders are repeatable frame by frame.

## Adding a world, step by step

1. Write `skyship-engine/worlds/<name>.js` with `build(ctx)`.
2. Write `worlds/<id>.json`; copy `columbus-2050.json` as a starting point. Add the world to `worlds/index.json`.
3. Write a journey `journeys/<id>.json` (a single world is fine) and add it to `journeys/index.json`.
4. Open `skyship-engine/journey.html?journey=<id>` and try all three modes.
5. Run `python tools/qa/check_worlds.py data journey` (add `shots` to the journey to get screenshots), then `python tools/qa/make_previews.py engine` for the portal image (add your world to `ENGINE` in that script).
6. Optionally pre-render the soundtrack MP3 (see `skyship-engine/README.md`).

## Journeys

`journeys/<id>.json` (schema: `journeys/schema.json`) strings worlds together:

```json
{ "id": "columbus-to-orbit", "duration": 90, "transition": 4,
  "worlds": [ { "world": "columbus-2050",   "t0": 0,  "t1": 42, "timeOffset": 0 },
              { "world": "orbital-habitat", "t0": 42, "t1": 90, "timeOffset": 78 } ],
  "cues": [ { "t": 0, "mood": "curious", "look": "ahead", "slot": "L", "line": "…" }, … ],
  "final": { "t0": 84, "line1": "…", "line2": "…", "foot": "…" },
  "audio": { "file": "../journeys/audio/columbus-to-orbit.mp3" },
  "lesson": { "title": "…", "objectives": [ { "text": "…", "hotspots": ["river"] } ] } }
```

Here, `timeOffset` maps journey time to world-local time. The orbital habitat's path runs 116–172 s in its own clock, so at journey second 42 it is at second 120.
