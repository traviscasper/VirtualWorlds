# Recommendations

What would add the most value next, roughly in order. Effort: S (a day or less), M (a few days), L (a week or more).

## 1. Highest value for the next milestone

1. **Test on real devices before the event (S).** The build environment has no GPU, so every test here used software WebGL. Check a mid-range phone, a laptop with integrated graphics and a Quest browser. If phones struggle, the cheapest wins are fewer street trees and walkers in Columbus 2050 (both are single instanced meshes), a lower pixel-ratio cap (`renderer.setPixelRatio`), and skipping the telescope/belly render targets on every other frame.
2. **Hotspots in VR (M).** Today hotspot markers are page overlays, which WebXR hides. Add 3D marker sprites (`SpriteField` already exists) and select them with gaze dwell or a controller ray, so Explore and Learn work in a headset.
3. **Columbus 2050 on real geography (M → L).** Replace the simplified grid with OpenStreetMap streets and building footprints, LiDAR heights for downtown, and the real Scioto centreline. The module keeps that data behind `STREETS`, `riverX` and the lot generator, so the engine, manifests and hotspots stay as they are. Then "2050 overlays" (transit lanes, green roofs) can be layered on the real city, which is the step toward a Columbus digital twin.
4. **Narration (S → M).** Add an optional `vo` audio file per cue. The film already has a recording script and VO folder conventions you can reuse.
5. **One journey per course lesson (M).** The Learn mode already supports objectives and questions. *Virtual Environments for a Better Future* could map each of its ten lessons to a journey (or a set of stops), with progress saved per learner.

## 2. Existing projects

- **Skyship 360 (world tour).** Its cities share one scrolling "strip" that is re-dressed per city, so they can't be lifted out as-is. Port them as world modules on the shared engine (start with Columbus, which can reuse Columbus 2050's landmarks), then retire the separate page once the 360 renders match.
- **Sci-Fi 360.** Now fully modular on the shared engine. Once the shared engine's 360 output has been compared side by side on a GPU, the kit's `skyship.html` could become a thin redirect, keeping one engine to maintain. Until then, keep both.
- **Worlds Within Worlds.** The film's worlds are signed-distance-field shaders. Two practical routes to interactivity:
  - *Shader-in-a-sphere (S → M):* run one world's GLSL as a full-screen pass with a free camera and the 360 ray mode the film already has. This gives look-around and fly-through without re-modelling; it works best for Thalassa, the Orrery and the Cosmic Core.
  - *Re-model in three.js (L):* use the experimental raster engine (`experimental/raster_engine/`) or three.js meshes for worlds that need walking and collisions (Verdance, Ferrum).
- **World Tour short.** Add its source project to the repo so it can be re-rendered at full quality.

## 3. Platform

- **Manifest-driven everything.** The portal, engine and tests all read the same manifests. Generate the HoloWatch / Holo-Screen "Time · Place · Purpose" cards from them too, so one edit updates every surface.
- **Accessibility.** Add captions for ARCHIVE's lines in Cinematic mode (they're already in the HUD; mirror them in a DOM caption for screen readers), a reduced-motion option that slows flight speeds, and keyboard navigation between hotspots.
- **Analytics for learning (optional, privacy-respecting).** Count which hotspots get opened and which questions are missed, to improve the lessons.
- **Hosting.** GitHub Pages on a private repo needs a paid plan, so consider Cloudflare Pages or Netlify, which deploy from a private repo for free. All paths are relative and there is no build step.

## 4. Roadmap worlds (after the pilot)

| World | Category | Builds on | Notes |
|---|---|---|---|
| AI & Robotics Laboratory | Technology | R.U.R. factory pieces, `People`, `Movers` | Stations for perception, planning and ethics; good fit for Learn mode |
| Mars Colony | Space, Sustainability | Orbital habitat systems (farm, water, air) | Same life-support story on the ground; ISRU and dust storms |
| Dyson Swarm & Space Infrastructure | Space | Orbit world, solar arrays | Scale journey: Earth orbit → Sun; good 360 piece |
| Columbus Digital Twin | Sustainability, Technology | Columbus 2050 + GIS | Real data first, then scenario overlays; link the LinkUS traffic study |
| Sustainable Transportation Simulator | Technology | Columbus transit, pods, bikes | Sliders change mode share; show travel time and emissions |
| Ohio State Virtual Campus | Place | World Tour OSU data (OSM extract) | Pair with the Haunted Campus AR app |
| Immersive Pollinator Ecosystems | Sustainability | Biosphere dome, `SpriteField` | Bee's-eye scale change; seasonal cycle |
| Historical & Future Civilizations | Time | Sci-Fi journey structure | A "Time" journey through eras of the same place |
| HoloWatch / Holo-Screen content | Technology | Manifests, previews | Small looping scenes and cards for the lenticular devices |
