# ARCHIVE: Worlds Within Worlds — Production Plan

Future Life Experiences · 90-minute code-generated animated feature · 1920×1080 · 30 fps · 162,000 frames

This document is the checkpoint for the whole production. If a chat is lost, this file, `archive_manifest.json`, and the source in `src/` are enough to resume exactly where we left off.

---

## 1. How a 90-minute film gets made in pieces without feeling like pieces

The film is one continuous timeline from 0:00 to 90:00. Nothing in the engine knows about "chunks". Every frame is computed from a single number, the film time `t`, so frame 81,000 looks identical whether it is rendered on its own, as part of chapter 5, or in the middle of a full-film run.

That one rule is what lets the work be split up safely:

| Layer | How it is split | Why it stays seamless |
|---|---|---|
| Story and animation | 10 chapters × ~9 min, each chapter split into scenes (`CH01_SC01` …) | Scenes are editorial units only; camera, character and music data live on one shared timeline, so motion and cues cross scene boundaries freely. |
| Video rendering | 5-minute segments (9,000 frames), 18 segments for the film | Each segment starts on a keyframe with identical encoder settings; FFmpeg joins them with a stream copy, so there is no re-encode and no visible join. |
| Audio | Rendered in one continuous pass for whatever range is being assembled | The synthesizer is a pure function of time. Rendering 50–60 s and 60–70 s separately matches the single 0–120 s render to within 1.5×10⁻⁸ (measured), so even chunked audio has no clicks. |
| Production work | One chapter per milestone | Each milestone adds scene data and, when needed, a new world module; it never rebuilds ARCHIVE, the camera, or the audio engine. |

Segment length is five minutes because it is long enough that the 18 joins are cheap to verify, and short enough that a crash costs at most five minutes of rendering. `render.mjs` resumes automatically: finished segments are verified with `ffprobe` (frame count, width, height) and skipped.

## 2. Story treatment

**Logline.** A tiny caretaker robot wakes in a forgotten library of living worlds and discovers that the network connecting every civilisation is failing, and that the missing piece is ARCHIVE itself.

**The world.** The Archive is a vast circular hall at the edge of the network, its shelves lined with glowing spheres. Each sphere is a real world, held at a scale small enough to cradle. Threads of light (the Loom) connect them all, powered by the Heartstar, a star wrapped in a Dyson swarm at the Cosmic Core. The worlds were built to keep each other in rhythm: each sends a pulse into the Loom and receives one back.

**The hidden truth.** ARCHIVE was the Archive's conductor, the node that kept every world's pulse in time. Long ago, during an energy crisis, ARCHIVE was put to sleep to save power. Without its rhythm the worlds drifted out of phase. They began pulling energy without returning it, threads went one-way, and one by one connections are fraying. The network has been calling ARCHIVE ever since, with three pulses, the same three notes as ARCHIVE's boot chime.

**The arc.** Curious explorer (it wants to see everything) → responsible problem solver (exploring changes things, and fixing one place can break another) → unlikely hero (it chooses to become the conductor, and learns it does not have to carry the network alone).

**Central theme:** every world is connected. **Secondary theme:** discovery creates possibility.

### Supporting cast

ALICIA (ELYSIA) is the Loom's own holographic AI, the living mind of the network (platinum hair, white-and-gold clothing, blue gem, golden geometric halo). ARCHIVE was built as the network's conductor and Alicia as its mind; they were meant to work together. During the old energy crisis it was Alicia who powered ARCHIVE down to save the network, and she has been holding everything alone ever since. As threads fail she weakens, so she can only appear in flickering glimpses at first, growing stronger as ARCHIVE repairs connections. Her appearances: a glimpse in Ch 3, a glitch in a Ferrum panel in Ch 4, a guide in Ch 6, the reveal in Ch 8, and a farewell, fully solid at last, in Ch 10. She never solves anything for ARCHIVE. Her key line in Ch 8 is a confession: she tried to hold the network alone, and it "was never meant to be held by one." When ARCHIVE gets the worlds to share the load in Ch 9, it saves her too.

TOCK is a tiny clockwork courier drone from Verdance (a sphere with one eye and a propeller), cheap to rig and animate. Tock joins in Ch 2, provides comedy and contrast (Tock follows rules; ARCHIVE improvises), is separated from ARCHIVE in Ch 7, and returns in Ch 9.

Crowds (Verdance citizens, Ferrum workers, Thalassa wildlife) are instanced, low-detail, and animated procedurally.

## 3. The mystery, clue by clue

The mystery is built so that each chapter adds one clue, and the climax uses all of them.

| Chapter | Clue | What ARCHIVE concludes |
|---|---|---|
| 1 | Spinning the little world sends a pulse into the hall (1:40). Three faint notes answer. | "Something out there heard that." |
| 2 | Verdance's lights flicker in a pattern of three. | The failures are not random. |
| 3 | In the Orrery, threads disconnect from the outer worlds inward. | Something is spreading toward the centre. |
| 4 | Fixing Ferrum's grid makes a neighbouring district fail. | Energy is leaving the worlds and not coming back. |
| 5 | Thalassa's reef only recovers when its creatures trade light in rhythm. | Systems survive by giving back, not by being fixed. |
| 6 | Most Loom threads now flow one way, all toward a silent centre. | The network is listening for something it no longer hears. |
| 7 | Isolated worlds fragment within minutes of losing their last thread. | Time is short; not every world can be saved first. |
| 8 | Alicia's memory shows ARCHIVE being powered down. The three pulses are ARCHIVE's own chime. | ARCHIVE is the missing conductor. |
| 9 | Alone, ARCHIVE cannot hold the rhythm. The worlds it helped can. | Cooperation is the solution technology alone couldn't be. |

The solution is literal in the score: ARCHIVE's main theme is the synchronisation signal. In Ch 9 each world picks up a phrase of the melody (Verdance's chimes, Ferrum's machine rhythm, Thalassa's whale song, the Orrery's music-box sparkle) until the full theme plays and the Loom locks into time.

## 4. Chapter outline (90:00)

**Ch 1 · The Awakening (0:00–9:00).** Two points of light in darkness become ARCHIVE's eyes. It powers up, stretches, and the Archive lights up ring by ring. It discovers a hologram that mirrors its face, and a sphere holding a living world, which it spins far too fast. The pulse from the sphere opens the "worlds within worlds" view: the hall itself curls into a tiny planet. 2:00–9:00 is now animated (M2): the orb pulses three times and something beyond the window answers; the orb projects a memory of the Loom (14 worlds linked by threads); ARCHIVE touches one world and a ripple runs through them all; a thread flickers red and snaps, ARCHIVE fails to hold it, and a second one breaks; the whole Loom streams into the window. After a quiet, funny beat at the orb, one shelf-orb wakes and a trail of them leads ARCHIVE around the hall (it stalls, and ARCHIVE pokes it back to life). At the window, sparks trace a ring that opens into a portal with a glimpse of Verdance. ARCHIVE hesitates, goes back to the orb, which answers with its three chimes as every shelf-orb glows, says goodbye to its mirror-panel reflection, takes a breath, and flies in. A transit tunnel, a barrel roll and a "Wheeee!", then a whiteout into Chapter 2.

**Ch 2 · The First World (9:00–18:00).** Verdance: canals, green transit, terraced parks, friendly service robots. ARCHIVE meets Tock and tries every interactive thing in sight. A tiny-planet reveal shows the whole city. A three-pulse flicker stops the trams for a moment; ARCHIVE alone notices the pattern. A second portal opens at the edge of the city.

**Ch 3 · Worlds Within Worlds (18:00–27:00).** The Orrery, a space filled with miniature worlds (forest, ocean, desert, floating islands, alien landscape, a space habitat). ARCHIVE learns to expand a sphere into a full environment, fly through it, and shrink it back. The infinite-zoom sequence nests worlds three levels deep. A glimpse of Alicia. One thread disappears.

**Ch 4 · The Broken City (27:00–36:00).** Ferrum, dense red-and-blue architecture, elevated trains, robotic infrastructure. Districts lose power. ARCHIVE builds an absurdly complicated holographic machine, which fails, then finds the simple fix: sharing load between districts. The city steadies, but a neighbour dims. Clue: energy is leaving and not returning.

**Ch 5 · The Living World (36:00–45:00).** Thalassa: forests, rivers, reefs, vertical farms, renewable settlements. An isolated bioluminescent creature, Lumen, is fading. ARCHIVE's tools make things worse; it learns to watch and wait. It restores the reef by restarting the light-exchange cycle. The emotional centre of the film. The failures are spreading.

**Ch 6 · The Great Network (45:00–54:00).** The Loom: a cosmic web of thousands of threads. Scale shifts: a thread widens into a civilisation; a galaxy shrinks into a hologram. Alicia guides ARCHIVE to a map of the Core. Threads flow one way.

**Ch 7 · The Lost Worlds (54:00–63:00).** Fragmenting worlds, dissolving geometry, energy storms. ARCHIVE can hold only one of two failing threads and has to choose. Tock is swept away. ARCHIVE's determination hardens. It reaches the entrance to the Core.

**Ch 8 · The Cosmic Core (63:00–72:00).** The Heartstar inside its Dyson swarm, orbital infrastructure, a black hole's lensing at the edge. Alicia's memory reveals why ARCHIVE was put to sleep. The fix: ARCHIVE must link its own core to the Heartstar and conduct the network, possibly forever. It commits.

**Ch 9 · The Restoration (72:00–81:00).** ARCHIVE alone cannot hold the rhythm; the threads slip. Tock returns, carrying Verdance's signal. One by one the worlds ARCHIVE helped take a share of the melody. The full theme plays, portals reopen, lost worlds reassemble. Because the load is shared, ARCHIVE is free.

**Ch 10 · A New Beginning (81:00–90:00).** ARCHIVE revisits Verdance, Ferrum and Thalassa, now rebuilding and connected. Alicia's farewell. The camera pulls back: worlds become glowing spheres, spheres become a network, the network becomes a cosmos. A new, unexplored portal opens. ARCHIVE looks at the viewer, smiles, and flies in. Final title.

## 5. What was built in this milestone

**Engine (`src/engine.js`).** A deterministic keyframe timeline (eased tracks, Catmull-Rom splines, hard cuts), the ARCHIVE behaviour library (fly, path, turn, face toward, look at, scan, express, wave, point, reach, arms up, spin, power, thrust) plus procedural hovering, banking into turns, leaning into flight, blinking and nervous jitter. A camera director with spline paths, cuts, field of view, roll, shake and projection blending. A scene registry covering all 90 minutes.

**ARCHIVE model (`src/shader.glsl`).** One reusable raymarched model: rounded head shell, black glossy faceplate, ear pods with light rings, compact torso with chest light, articulated two-segment arms with hands, and a thruster with an animated flame. The face is drawn procedurally on the visor: eyes with openness, gaze, size, happy arcs, determined and sad brows, wink, anime sparkle, and a mouth that smiles, frowns, or opens. Sixteen expression presets.

**Projection system.** Every pixel's ray direction blends between perspective and a true stereographic (tiny-planet) mapping around the camera's forward axis. Looking straight down and blending to stereographic curls any environment into a little planet; blending back unrolls it. This is real projection maths, not image stretching, and works for every future world.

**The Archive.** Circular hall with dome, columns, shelves of world-spheres, floor light rings that switch on in sequence, a window onto space (stars, nebula, planet), holographic panels with flicker and glitch states, a mirror mode, the central pedestal, and the living-world sphere with continents, clouds, city lights, an orbital ring, and a glow that lights ARCHIVE.

**Sound (`src/audio.js`).** Original score for 0:00–2:00 synthesized in code (piano, pads, strings, brass, bells, celesta, pizzicato, timpani, bass) built on the ARCHIVE theme; about 30 synced sound effects; a continuous hover hum that follows thrust; and a chirp-voice placeholder for ARCHIVE's lines. Stems: music, effects, dialogue, plus mix.

**Dialogue system.** Each line records character, text, start, end, emotion, scene and an empty audio slot for a future recording. The studio can show captions and speak lines with the browser's voice as a preview.

**Studio (`ARCHIVE_Studio.html`).** Live 3D viewport, 90-minute timeline with chapters and scene ticks, scrub, play/pause, speed, chapter jump, expression and move previews, orbit camera, projection override, quality and resolution, stem mutes, voice preview, real-time 1080p recording with sound, audio export, manifest export, and a scene list showing what is animated and what is planned.

**Render pipeline (`render/render.mjs`).** Frame-exact rendering through headless Chromium, JPEG frames piped to FFmpeg (H.264, CRF 16), 5-minute resumable segments with verification, one continuous audio pass written as WAV stems, and final assembly with AAC audio and a last verification of frame count, size and duration.

## 6. Running it on your computer

You need Node.js 18 or newer, FFmpeg on your PATH, and Playwright's Chromium.

```
cd ARCHIVE_Worlds_Within_Worlds
npm install playwright
npx playwright install chromium

node render/render.mjs --from 0 --to 120 --headed      # the opening, 1080p30, frame-exact
node render/render.mjs --chapter 1 --headed            # all of chapter 1
node render/render.mjs --film --headed                 # the whole film, 18 resumable segments
```

`--headed` opens a real Chromium window so rendering uses your graphics card. Leave it visible while it works. Re-running the same command resumes from the last finished segment. Output lands in `render/out/`; progress, speed and ETA are in `render/out/progress.json`.

For a quick look without installing anything, open `ARCHIVE_Studio.html` in Chrome or Edge, choose a range under "Render and export", and press "Record video". That records in real time with sound and is fine for previews; `render.mjs` is the frame-exact path for finals.

## 7. Rendering performance

Measured here (CPU-only software graphics, one core): about 0.9 frames per second at 480×270 draft quality, and roughly 20–60 seconds per frame at 1920×1080 final quality. That is why the preview delivered with this milestone is a low-resolution animatic: the full 1080p opening would take about a day on this machine.

Expected on a desktop graphics card: the shader is about 150 raymarch steps per pixel with shadows and one floor reflection, which a mid-range GPU should draw in tens of milliseconds at 1080p. Including frame transfer and H.264 encoding, a reasonable estimate is 5–15 frames per second, so the opening takes 4–12 minutes and the full film 3–9 hours. This is an estimate until we time it on your machine; the first `render.mjs` run will report the real number.

## 8. Known limitations

ARCHIVE is built from smooth primitives, so the hands are simple mittens and the panel lines are painted light rather than modelled seams. Depth of field and motion blur are not implemented yet. Alicia and Tock do not exist yet. The score is code-synthesized and sounds like a good mock-up rather than an orchestra; every stem can be replaced with recorded audio without touching the animation. Scenes after 2:00 play an idle loop under a "planned scene" slate so the timeline stays navigable. The in-studio recorder runs in real time, so on a slow device frames may stutter (it warns you).

## 9. Milestone plan

| Milestone | Film time | Main work |
|---|---|---|
| M1 (done) | 0:00–2:00 | Engine, ARCHIVE, camera, projections, the Archive, score and SFX systems, studio, render pipeline |
| M2 (done) | 2:00–9:00 | Finished Ch 1: Loom memory projection, shelf-orb trail, portal formation in the window with a Verdance glimpse, transit tunnel, score and effects for the whole stretch. Still to do: split the shader into a shared ARCHIVE core plus swappable world modules (before Ch 2) |
| M3 (done) | 9:00–18:00 | Verdance world module, trams and service robots, Tock rig, all of Chapter 2 |
| M4 (done) | 18:00–27:00 | Orrery and forest-world modules, expand/shrink, the worlds-within-worlds loop, Alicia glimpse, the thread that goes out |
| M5 (done) | 27:00–36:00 | Ferrum world module, district power system, the overcomplicated machine, the load-sharing fix, the leak, Alicia's panel glitch |
| M6 (done) | 36:00–45:00 | Thalassa world module: lagoon water, bioluminescent reef, islands, vertical farms, turbines, Lumen, the light exchange, dusk to night |
| M7 (done) | 45:00–54:00 | The Loom world module: thread lattice with one-way pulses and fraying, galaxy at any scale, node windows, Alicia as the Loom's holographic AI |
| M8 (done) | 54:00–63:00 | Fragmentation, dissolving geometry, energy storms |
| M9 | 63:00–72:00 | Heartstar, Dyson swarm, gravitational lensing, Alicia reveal |
| M10 | 72:00–81:00 | Climax: motif returns from every world, network illumination |
| M11 | 81:00–90:00 | Resolution, final pull-back, end title |
| M12 | 0:00–90:00 | Full-film render, depth of field and motion blur pass, voice recording swap-in, final verification |

Each milestone ends with the same report: completed work, what runs, what rendered, files, limitations, render speed, and next steps.

## 10. Next milestone (M2) task list

Restructure the shader into `archive_core.glsl` (ARCHIVE, face, glows, post) plus `world_archive.glsl`, so new worlds are separate programs sharing one ARCHIVE. Add a portal-transit effect (the portal disc samples a second world rendered to a texture, then the camera passes through with a spherical warp). Animate 2:00–9:00 from the beats above. Extend the score with the mystery leitmotif (three notes, E–B–E, the network's call) and the departure cue. Time a `render.mjs --headed` run on Travis's computer to replace the estimates in section 7 with measured numbers.


## 10. Milestone 2 notes (Chapter 1, 2:00–9:00)

Scene data lives in `src/scenes/ch01_part2.js`, separate from the engine. `build.py` loads every file in `src/scenes/` ahead of the engine, so each future chapter gets its own file. The file registers three things: the animation (actor, camera and world keyframes), its part of the score, and its sound-effect cues.

| Scene | Time | Beats |
|---|---|---|
| CH01_SC07 The orb remembers | 2:00–4:00 | Three pulses and an answer from the window · the Loom unfolds · flight among the worlds · touch and ripple · a thread breaks, ARCHIVE fails to save it, a second one breaks · the Loom streams to the window · quiet beat, tapping the orb · one shelf-orb wakes |
| CH01_SC08 The door that wasn't there | 4:00–6:00 | The shelf-orb trail · it stalls and ARCHIVE pokes it on · every orb flares · stars at the window · sparks trace a ring · the door opens partway |
| CH01_SC09 Into the portal | 6:00–9:00 | Fully open, Verdance glimpsed · ARCHIVE approaches and stops · goes back to the orb · the Archive answers with three chimes · goodbye to the mirror · a breath, "Let's go see" · the plunge · tunnel · whiteout |

New engine and shader features: the Loom (node and thread glows with pulse ripples and breaking threads), shelf-orb trail lighting, portal ring formation with a fixed window orientation, a procedural Verdance view inside the portal, and a screen-space transit tunnel that keeps ARCHIVE rendered in front of it.

Engine fixes:
- A camera roll left over from the tiny-planet sequence no longer persists after 2:00.
- Spline position tracks now hold still during pauses; before, ARCHIVE and the camera drifted slightly during holds, including in the first two minutes.

New dialogue placeholders: "Whoa…", "They're all… connected.", "No—", "Where are you going?", "Ha!", "Huh?", "…A door?", "If I go…", "Okay. I'll come back.", "Bye!", "Okay. Let's go see.", "Wheeee!".


## 11. Character design 1.0 (official from engine 0.3.0)

The updated reference sheet replaces the earlier ARCHIVE design for the rest of the film. It was applied to the one shared ARCHIVE model, so every chapter, past and future, uses it automatically. No animation, camera or scene timing changed.

| Feature | Implementation |
|---|---|
| Head and faceplate | Slightly larger, rounder shell; wider faceplate; gold seam on the crown |
| Ear pods | Larger headphone discs with a gold rim and two cyan rings |
| Eyes | New concentric-ring eyes (`ring` channel): a rotating C-ring for curiosity, a full analysis pattern for thinking and scanning; a question-mark eye for confusion (`qmark` channel); new `playful` and `analyze` presets. The mirror panel uses the same face, so it updates too |
| Arms and hands | White segments with dark mechanical elbows and dark hands (mitten and thumb); the same rig and poses as before |
| Chest emblem | Worlds Within Worlds: three nested rings (blue, gold, blue) with rotating segments and ticks. Its brightness and spin follow a new `emblem` activity track, driven by `scan()`, the new `activate()` behaviour, thrust, and cues at discoveries, scans, portals and energy moments |
| Propulsion | Rotating segmented hover ring under the body with a soft disc glow; the old flame is now a short downward glow. Ring speed and brightness follow thrust |
| Colours | White body, black face, blue eyes, cyan light, gold accents |

Ring and emblem rotation is integrated over time, so it is still deterministic and never jumps when speed changes.

Design cues for Chapter 1 live in `src/scenes/zz_design_v1_cues.js`, which loads after the chapter files.

**Footage.** No final-quality footage had been rendered before this update. The only render was a 4-second draft clip, which was retired. Nothing needs to be re-rendered; all renders from now on use design 1.0.

**Fixes after review.**
- The mouth now sits lower and wider, so a slightly open mouth no longer reads as a nose; it only opens for big reactions.
- Studio: Character → View has Full body, Face, Side, Back and Film camera, plus a Zoom slider. Pinch to zoom and drag to orbit on touch screens; the mouse wheel also zooms.
- `__renderFrame(t, q, w, h, view)` accepts an optional test view (`{expr, yaw, pitch, dist, fov, ty}`) for turnaround and expression sheets.


## 12. Milestone 3 — Chapter 2, The First World (9:00–18:00)

**World modules.** The shader is now split: the shared ARCHIVE core stays in `src/shader.glsl`, and each world lives in `src/worlds/` (`10_verdance.glsl`), inserted at build time. A `uWorld` value picks the world per frame (0 = the Archive hall, 1 = Verdance).

**Verdance.** A canal city at dawn, with:
- canal water, promenades, trees and parks
- terraced towers with gardens, lit windows and gold trim
- elevated tram guideways with moving trams
- service robots, a fountain plaza with jets, and a lookout at the city's edge
- a sunrise sky with a distant skyline over the sea

Trams and robots move as integrals of their speed, so they stop and start smoothly and deterministically.

**Tock.** A brass-and-teal courier drone with one big amber eye (it can squint, look around and smile happily) and a spinning propeller. Tock has its own voice-placeholder chirps.

| Scene | Time | Beats |
|---|---|---|
| CH02_SC01 Arrival in Verdance | 9:00–12:00 | ARCHIVE pops out of the portal, explores everything, waves at a tram, meets Tock ("Unregistered unit! State your purpose."), Courier rule seven: escort all visitors, tiny-planet view of the city, "It's… a whole world." |
| CH02_SC02 Tock's tour | 12:00–15:00 | Fountain Plaza ("Do not touch the fountain."), ARCHIVE touches it and it plays music, the tram ride, "Everything gives back.", the symbol on the old gate |
| CH02_SC03 The flicker | 15:00–18:00 | Three pulses: the city goes dark and trams and robots stop ("Three pulses. Just like home."), a shimmer at the edge, the flight to the lookout, the second portal, "Come with me?", Tock decides to come, through the portal; stinger: Verdance flickers three times again |

**Review fixes.**
- Verdance now has real sunlight (warm sun, sky-blue fill and sun shadows) instead of the hall's lighting.
- There's less haze and a little more colour.
- The chapter ends on a clean aerial over the canal, in which the city flickers three times again, instead of a long, empty held shot.

Chapter 2 was drafted in a session that was interrupted before delivery, then verified, fixed and finished here. The whole timeline (0:00–18:00) passes the frame-state check.


## 13. Milestone 4 — Chapter 3, Worlds Within Worlds (18:00–27:00)

**New world modules.**
- `src/worlds/20_orrery.glsl` (world 2): a brass orrery adrift in a violet nebula. It has:
  - a lantern-star that lights everything
  - three turning gimbal rings
  - the arrival dais
  - six miniature worlds on tilted orbits: forest, ocean, desert, floating islands, alien and habitat, each with its own surface
- `src/worlds/30_forest.glsl` (world 3): the inside of the forest world. It has:
  - rolling wooded hills and a river valley
  - a flowered clearing with a stump
  - a tiny glowing orrery on the stump
  - a glowing butterfly sprite

**Alicia.** Her first appearance is drawn as a light-figure (platinum hair, white-and-gold dress, blue gem, golden geometric halo) that can raise a hand and dissolve. It's deliberately an apparition. Her full 3D character can come when she has a bigger role (Ch 6 and Ch 8).

**Engine.**
- Scene files can now supply world-module uniforms (`w.U`), and the engine resets them every frame so nothing leaks between worlds.
- Orbits use the same integral-of-speed method as Verdance's trams.
- The Loom thread system is reused: the six worlds and eight outer worlds are its nodes, with spokes from the star.

| Scene | Time | Beats |
|---|---|---|
| CH03_SC01 The Orrery | 18:00–21:00 | Arrival ("This is not on any map."), a tour of five worlds with a reaction each, the threads ("Like at home"), the forest world floats over, ARCHIVE makes it grow ("Watch this.") |
| CH03_SC02 Inside a world | 21:00–24:00 | Expand gesture and dive, a flight down the river valley, the butterfly chase ("It likes me!"), the stump with a tiny orrery, zoom in, out the other side back in the Orrery seen from far above ("Worlds… inside worlds… inside worlds!"), shrink it back, "Best day ever." |
| CH03_SC03 The glimpse | 24:00–27:00 | Alicia appears, points at the outer threads and dissolves ("Wait—who are you?"), an outer thread flickers and goes out, they follow it to a dark world, a red door opens onto Ferrum, "Courier rule one?" / "Deliver the visitor safely.", through; closing shot: the Orrery turning, one world dark |

**Rendering cost.** The Orrery and forest are the heaviest worlds so far, about 3× the Archive hall per pixel on the CPU test renderer. That's still fine for a GPU.


## 14. Milestone 5 — Chapter 4, The Broken City (27:00–36:00)

**World module `src/worlds/40_ferrum.glsl` (world 4).** A dense red-and-blue city at night. It has:
- dark towers with lit windows and neon bands
- an avenue with lane markings and an elevated rail with a moving train (east side, so flight paths stay clear)
- a substation plaza with two district power cores (East, red; West, blue) wrapped in glowing coils
- street-lamp and core lighting

Each district's lights follow its own power level, with flicker. Extras: ARCHIVE's holographic machine (seven parts that appear one by one, spin, wobble, overheat and collapse), the glowing load-sharing cable ARCHIVE carries, and the violet leak beam rising out of the far district. The portal can now show Thalassa (Ch 5).

| Scene | Time | Beats |
|---|---|---|
| CH04_SC01 Ferrum | 27:00–30:00 | Arrival ("Too bright. Too loud."), the train overhead, "Cities eat small drones." / "Not this one!", the West district browns out and the train stops ("Load exceeded."), the substation, diagnostics ("Too much here… nothing there."), "I know!" / "Oh no." |
| CH04_SC02 The machine | 30:00–33:00 | The holographic machine is built part by part ("What does it do?" / "It… helps!"), it runs, wobbles, overheats and collapses, the East district sags too, Courier rule twelve: "the simplest route is usually the right one," "Share it!", ARCHIVE carries the cable between the cores, power returns and the train restarts ("Efficient." / "Simplest route.") |
| CH04_SC03 The leak | 33:00–36:00 | The far district fades and its energy streams up into the sky ("It's going… up. And it's not coming back."), Alicia flickers in the big panel ("…hold… on…" / "It's her!"), they follow the leak to the rooftops, a teal door opens ("Next stop: unscheduled." / "My favourite kind."), through; closing shot: Ferrum lit and linked, the far district dim, the leak still rising |

**Review fixes.**
- Two neon and floor-ring patterns were inverted and made whole facades glow, which washed the city out. Ferrum is now properly dark.
- The rail moved off the flight line.
- Cameras were moved out of buildings and cores.
- ARCHIVE now stays outside the cores while handling the cable.


## 15. Milestone 6 — Chapter 5, The Living World (36:00–45:00)

**World module `src/worlds/50_thalassa.glsl` (world 5).** A lagoon that turns from golden dusk to starry night. It has:
- clear shallow water, with underwater colour absorption, rippling surface reflections and a sun glint
- a bioluminescent coral reef whose glow follows its health, with a restoration wave that spreads outward and a dark patch
- forested islands, three vertical-farm towers with garden terraces, and turning wind turbines
- a rock at the lagoon's edge
- drifting fish-lights, and the light-exchange threads between the reef and Lumen

**Lumen.** A small jellyfish-like creature with a glowing bell and swaying tentacles. Its glow, size and pulse are all animated.

**Reuse.** The Loom thread system draws the network across the night sky at the end.

| Scene | Time | Beats |
|---|---|---|
| CH05_SC01 Thalassa | 36:00–39:00 | Arrival at dusk ("Finally. Somewhere quiet."), "Gardens… in towers!", the glide across the water, the glowing reef, dark patches ("Parts of it are going dark."), Lumen alone at the edge, fading ("Hey… are you okay?" / "It is too far from the others.") |
| CH05_SC02 Making it worse | 39:00–42:00 | "Here. Take some light!", Lumen is startled and flees; pushing energy darkens part of the reef ("No, no, no—"); "Courier rule… I do not have a rule for this."; ARCHIVE sits on the rock as night falls and watches; "They're… talking. In threes." / "And it's too far away to hear them." / "We wait. And we listen." |
| CH05_SC03 The light exchange | 42:00–45:00 | ARCHIVE dims its lights and becomes the bridge: three soft pulses, silence, three more; Lumen answers; the exchange restarts and light spreads across the whole reef; Lumen comes home and touches ARCHIVE's hand ("You waited." / "It didn't need fixing. It needed someone to answer."); the lagoon alive under the stars; the network appears in the sky and flickers in threes ("It's everywhere… it's all one network." / "And it is failing everywhere." / "Then we go up."); up through a portal into the network |

**Review fixes.** Three cameras were moved in front of ARCHIVE for its key lines, Lumen was moved so it no longer passes through ARCHIVE, and the sky network was brought lower and brighter so it reads.


## 16. Milestone 7 — Chapter 6, The Great Network (45:00–54:00)

**World module `src/worlds/60_loom.glsl` (world 6).** There's no solid geometry; the Loom is drawn as accumulated glow:
- an endless jittered lattice of threads and nodes, every node a world
- gold pulses that always travel toward the Cosmic Core
- threads that fray (flicker, then go dark) as the failure spreads
- a lattice scale that can shrink the whole network into a cosmic web and back
- a spiral galaxy that can be drawn at any size, from filling the sky to a hologram between Alicia's hands, with a marker for the Core
- the Core itself, a distant gold star

Node "windows" reuse the portal system to show Verdance, Thalassa and Ferrum.

**Alicia, the holographic AI.** Her figure now has hologram treatment: a cyan tint, moving scanlines, bright outlines, a see-through body, flicker and dissolve. This applies to her Ch 3 and Ch 4 glimpses too. She speaks with her own voice-placeholder chime.

| Scene | Time | Beats |
|---|---|---|
| CH06_SC01 The Loom | 45:00–48:00 | "We're inside the network…" / "My map has no edges."; flying the threads ("They're all going the same way."); a node opens onto Verdance ("Verdance! Hi!" / "Hello, home."), another onto Thalassa ("Lumen's okay."); fraying ("Threads are snapping.") |
| CH06_SC02 Alicia | 48:00–51:00 | Alicia appears ("You came. I hoped you would." / "I am the Loom's keeper. Its mind, if you like." / "Is she… on the schedule?"), "The worlds take, and nothing comes back"; a vast galaxy shrinks into a hologram between her hands, marking the Cosmic Core; "Then that's where we go." / "I can't hold this form for long." / "Then hold on. We're coming."; she fades and her map leads them on; a node shows Ferrum ("They kept it shared!") |
| CH06_SC03 The map | 51:00–54:00 | Scale shift: the whole lattice shrinks into a cosmic web ("It's… bigger than all the stars."); fraying faster, the map flickering; the edge ("This is the end of my map." / "Then we draw a new one." / "Courier rule one."); into the dark |

**Review fixes.** The thread lattice was nearly invisible at first and then washed out the frame. It's now tuned to read clearly. The Core's glare was reduced so it no longer dominates every shot.

**Known limitation.** Alicia is a stylized 2D light-figure (silhouette, hair, halo, gem). That works for a hologram at a distance, but it's simple in close-ups. A proper 3D model with face and hair detail would be worth doing before Ch 8, where she has her biggest scene.

## 17. Alicia 3D model (done)

`src/characters/alicia.glsl` replaces the 2D light-figure with a full 3D raymarched character, rendered in its own pass and blended over the scene. It has:
- an anime head with large blue eyes, lashes, brows, mouth and blink
- long platinum hair (shell, back hair, side locks) that sways
- a white dress with puff sleeves, a flared skirt with a moving hem, and gold trims
- a blue gemstone at the chest
- a golden halo with eight orbiting diamonds
- an IK arm rig (rest, raised arm, hold pose) solved in `engine.js`

A solidity control runs from hologram (cyan tint, scanlines, rim glow, translucent) to fully solid for the finale. She faces the camera unless a scene sets her direction. She is used automatically in Ch 3, 4 and 6; in Ch 6 she now holds the galaxy map in both hands.

Tuning pass:
- The hair is slimmer, with fringe strands and a warm platinum sheen.
- The head and eyes are larger, with iris gradients, pupils, highlights, lashes, brows, a small smile and blush.
- Skin and dress colours are warmer, and the hologram tint is lighter, so she reads as a person made of light rather than a white glow.
- Arms and hands are fuller.

`__renderFrame` now accepts `{camPos, camTgt, fov}`, for character close-ups and turnaround sheets.


## 18. Milestone 8 — Chapter 7, The Lost Worlds (54:00–63:00)

**World module `src/worlds/70_lost.glsl` (world 7).** Fragments of broken worlds (rocky slabs with grass or ruined-city tops and violet veins) drift and turn slowly in a dark violet energy storm. It has:
- storm clouds that light up with each strike, and lightning bolts drawn as jagged glowing lines, with thunder timed to distance
- two failing worlds: A, green with village lights and spreading cracks; B, a blue ocean world that can break into seven drifting chunks
- the two threads holding them, flickering as they weaken
- the vast golden gate of the Cosmic Core, which opens at the end

The two threads are anchored to ARCHIVE's hands, and to Tock once he takes the second one.

| Scene | Time | Beats |
|---|---|---|
| CH07_SC01 Shattered | 54:00–57:00 | Out of the dark into the debris ("Where… are we?" / "Off every map." / "These were worlds. Pieces of worlds."), through the storm, a near-miss strike ("Too close!"), two worlds coming loose, their threads snapping, "Hold on. I've got you." |
| CH07_SC02 The choice | 57:00–60:00 | ARCHIVE grabs world A's thread; B is breaking and too far ("You can't hold both!" / "I have to—!"); Tock takes the other thread ("I'll take that one!" / "Courier rule one: deliver the visitor safely!"); the storm surges and sweeps Tock away ("ARCHIVE—!" / "TOCK!"); silence; B breaks apart ("I couldn't hold them both."); A steadies and reconnects |
| CH07_SC03 Alone | 60:00–63:00 | "You said rule one…"; determination hardens ("I'll find you. After I fix this."); the storm parts on the gate of the Core; Alicia, faintly ("the Core… it's close…"); the long flight alone toward the gate |

Tock returns in Ch 9 (per the plan), carrying Verdance's signal.

**Review fixes.**
- The storm was too bright and pink. It's now darker and more ominous.
- There's less debris, so the frame isn't cluttered.
- The gate was a white blob; it's now a gold ring with a swirling portal.
- World A's thread now lets go once A reconnects, so it no longer stretches across the sky.


## 19. Milestone 9 — Chapter 8, The Cosmic Core (63:00–72:00)

**World module `src/worlds/80_core.glsl` (world 8).** It has:
- the Heartstar, with granulated, churning gold plasma, limb darkening and a corona
- a failing Dyson swarm: four tilted rings of collector panels that go dark as the failure rises
- two orbital infrastructure rings with lit spokes
- the Loom's threads converging into the star
- a black hole at the edge of the sky, with gravitational lensing that bends the starfield, a black event horizon, a bright photon ring and a rotating accretion glow
- the Conductor's Seat: a platform, a gold arch, and a socket bearing ARCHIVE's own emblem, which wakes as ARCHIVE approaches

The star lights the scene as a point light.

**Memory grade.** A new `uMem` post effect gives a warm sepia memory look with a vignette. It's used for Alicia's flashback, which revisits the Archive hall (world 0) long ago.

**Alicia.** She is strongest here, with a solidity of 0.45 (0.75 in the memory). Her direction is now driven by the scene, so she faces ARCHIVE in two-shots.

| Scene | Time | Beats |
|---|---|---|
| CH08_SC01 The Heartstar | 63:00–66:00 | The reveal; ARCHIVE turns to where Tock should be ("Tock would have a rule for this."); along the swarm as panels fail ("Everything flows in… and the panels are failing."); the black hole ("Even the light bends here."); the Seat ("That's… my emblem."); Alicia appears ("You made it. Alone?" / "The storm took Tock." / "I know what it is to lose someone to the dark.") |
| CH08_SC02 The memory | 66:00–69:00 | "Let me show you who you were."; the Archive long ago: ARCHIVE conducting the Loom ("You kept every world in time."); the energy crisis; Alicia powers ARCHIVE down into its dock ("I thought I could hold it alone."); years alone, fading ("Every year, a little less of me."); back at the Core, the confession ("It was never meant to be held by one. Not by you. Not by me." / "And I'm almost out of time.") |
| CH08_SC03 The Seat | 69:00–72:00 | "If you take it… you may never leave it."; the worlds remembered in windows (Verdance, Thalassa, Ferrum); "Tock would say: deliver the visitor safely. All of them are my visitors."; "Then I'll hold it. As long as it takes."; ARCHIVE takes the Seat ("I'm ready."); every thread rushes in, the star flares, whiteout, black, a single heartbeat |

**Review fix.** The Heartstar first rendered as a flat, blown-out disc. It now has surface detail and a softer corona.


## 20. Milestone 10 — Chapter 9, The Restoration (72:00–81:00)

No new world module. The chapter reuses the Core and runs a restoration montage across five earlier worlds; the scene file drives those worlds' uniforms directly. In the Lost Worlds, world B reassembles and the storm is gone. In the Loom, every thread is alive.

| Scene | Time | Beats |
|---|---|---|
| CH09_SC01 Alone at the Seat | 72:00–75:00 | ARCHIVE linked to the Heartstar, pulsing the three-beat rhythm ("Hold… hold…"); the swarm briefly brightens, then slips; Alicia flickers ("It's too much for one—"); "I won't let go." / "I can't… hold it… alone…"; a small light out of the dark: Tock, carrying Verdance's signal as a tiny glowing world ("Courier rule one: deliver… the signal!" / "TOCK!" / "You came back." / "You are my visitor. I deliver."); the signal goes into the Seat ("Verdance… is holding with me!"); "The worlds can carry a share." / "Then let's ask them all." |
| CH09_SC02 Every world answers | 75:00–78:00 | Windows open around the Core one by one: Verdance (chimes), Ferrum (machine rhythm), Thalassa (a long song), the Orrery (music box), each joining the melody; the swarm relights; "We're holding it… together!"; montage: the broken ocean world reassembles, the Loom's threads all alight, Thalassa's reef, Ferrum lit, Verdance's trams; the full theme; "Every world… in time." / "Nominal."; "The Seat doesn't need you anymore. Not alone."; the Seat opens ("I'm free!") |
| CH09_SC03 Free | 78:00–81:00 | Alicia becomes solid for the first time ("I'm… not fading." / "Because you're not holding it alone."); she reaches out and ARCHIVE reaches back ("You did it. You all did." / "We did." / "Visitor… delivered."); the three watch the Heartstar; "There are still worlds that went dark." / "I know a good courier." / "The best courier."; a vast pull-back over the whole restored Core |

**Score.** Each world brings its own instrument into the main theme (bells for Verdance, a pluck-and-timpani rhythm for Ferrum, long strings for Thalassa, celesta for the Orrery), building to the full orchestral statement during the montage.

**Review fix.** The reunion and solid-Alicia shots were reframed so both characters stay in frame.


## 21. Milestone 11 — Chapter 10, A New Beginning (81:00–90:00) · THE FILM IS FULLY ANIMATED

| Scene | Time | Beats |
|---|---|---|
| CH10_SC01 Homecomings | 81:00–84:00 | Ferrum lit and linked, ARCHIVE waves at the train ("Hi, train!" / "Still shared. Efficient."); Thalassa's reef alive, Lumen and ARCHIVE trade three pulses ("Hi, Lumen." / "Show-offs."); Verdance's trams running and the fountain still playing music ("Home. On schedule, for once." / "It never stopped. Not since you touched it."); at the canal ("the visitor saved every world." / "With a little help." / "A lot of help.") |
| CH10_SC02 Farewell | 84:00–87:00 | Alicia, solid, visits the lookout ("I wanted to see one of them. With my own eyes."); she belongs in the Loom now, but not alone; "Will I see you again?" / "Every time you open a door, I'll be on the other side of it."; her gift lights ARCHIVE's emblem; Tock: "Courier rule one applies to you too."; she rises back into the network as light ("Bye, Alicia."); sunset ("So. Where next?" / "Somewhere… nobody's been yet."); ARCHIVE rises and the pull-back begins: the worlds become the Orrery's glowing spheres, then the network, then a cosmos with a galaxy |
| CH10_SC03 A new beginning | 87:00–90:00 | Back among the threads, a new door opens ("That one's not on any map." / "Then let's go see."); ARCHIVE turns to the viewer, smiles, winks; flies in with Tock; whiteout; final title over black: ARCHIVE · Worlds Within Worlds · Future Life Experiences |

The finale reuses five world modules (Ferrum, Thalassa, Verdance, the Orrery, the Loom) with their healthy end states supplied by the chapter's scene file.

## 22. Where the production stands

All ten chapters (0:00–90:00, 162,000 frames at 30 fps) are animated, scored and cued. Every scene in the manifest is marked animated.

Remaining steps to a finished film:
1. **Final render:** on a computer with a graphics card, run `node render/render.mjs --film`. It renders 18 five-minute segments with resume and verification, then the continuous soundtrack, then the assembled MP4.
2. **Voice recording (optional):** every line is in the dialogue timeline with character, timing and emotion, so recordings can replace the chirp placeholders in the dialogue stem.
3. **Polish (optional):** each chapter was checked from sample frames, not every second. Watch a draft render and note any shots, timings or framings to tighten; each fix is local to that chapter's scene file.


## 23. Entertainment pass (in progress)

**Diagnosis.** Measured from the timeline before this pass:
- After Ch 1, shots averaged 8–10 s, against 3–5 s in a typical animated family film.
- ARCHIVE moved fast in only 6–23% of each chapter.
- Every chapter had 1.5–3.5 min stretches where ARCHIVE barely moves, and 1–2 min with no movement and no dialogue. About 35 minutes of the film qualifies as slow and silent.
- Every chapter followed the same shape (arrive, look, failure, talk, fix, portal), and there was no visible threat.

**Tools built**

1. **The edit (engine 0.5).** Scenes stay authored in story time; an edit list maps the 90-minute output timeline onto it.
   - Slow, silent stretches (ARCHIVE nearly still, nobody speaking, not protected) keep their first 3 s and last 2 s and play faster in the middle.
   - New scenes, authored at story times beyond 90:00, are spliced in. The time they need comes out of the tightened stretches, so the film stays exactly 5,400 s.
   - Music, sound effects and dialogue follow the same mapping, so sync holds.
   - Intentional quiet moments are protected: the awakening, the Thalassa wait, the silence after Tock is swept away, Alicia's memory, Alicia becoming solid, and the ending.
   - Each new insert automatically increases the tightening elsewhere.
2. **Coverage.** Any authored shot of ARCHIVE longer than 9 s is now intercut every ~4.5 s with generated reaction close-ups and three-quarter angles. This is skipped during special effects (tiny planet, tunnel, flashes, fades and the memory grade). This alone roughly halves the average shot length in the long-shot chapters.
3. **The Wardens** (`src/characters/warden.glsl`). The network's old maintenance drones: an armoured sphere, a visor slit, a spinning rotor ring and two claw arms. Starved of energy, they turned into hoarders that grab anything carrying power, and their visors glow red. Restored, the visors turn blue. Up to three can be on screen.

**Story change: the Wardens give the problem a face**
- Ch 1: a dormant Warden wakes and chases ARCHIVE around the Archive; it's starving, not evil.
- Ch 4: Wardens are behind Ferrum's drain, and one tries to grab the cable.
- Ch 6: a pack hunts the threads.
- Ch 7: Wardens are in the storm, and Tock is swept away while saving ARCHIVE from one.
- Ch 8: the Core is guarded by Wardens.
- Ch 9: when the worlds share the load, energy flows back, the Wardens' visors turn blue, and they help rebuild. That's the payoff for ARCHIVE's promise in Ch 1: "I'll come back for you too."

**Action inserts** (one per chapter; ✓ = done)

| # | Chapter | Insert |
|---|---|---|
| ✓ | Ch 1 | **The Warden** (52 s, story 5400–5452, spliced at 7:50): the Warden wakes, "INTRUDER.", a chase around the pillars with a spin and a barrel roll, ARCHIVE stops dead so the Warden hits a pillar ("Sorry!"), "It's not angry… it's out of power.", "I'll come back for you too." |
| ✓ | Ch 2 | **Runaway tram** (42 s, story 5460–5502, spliced at story 836): another roof ride ("Rule nine: do not ride on the roof." / "Just once!"); the tram speeds up and brakes hard, flinging ARCHIVE in a somersault into the fountain; jets burst ("…Ow." / "Rule nine." / "Worth it.") |
| ✓ | Ch 3 | **River race** (40 s, story 5510–5550, spliced at story 1344): "Race you." / "You're on!"; a low, banking skim down the river bends; Tock cuts over the trees and wins ("That's cheating!" / "Courier rule three: know the shortcuts."). (The shrinking-world escape is deferred; it needs a new closing-sky effect in the forest module.) |
| | Ch 4 | Runaway train in the blackout; Wardens go for the cable |
| | Ch 5 | (stays calm on purpose; the edit trims it) |
| | Ch 6 | Surfing the pulses; a Warden pack; whipping threads |
| | Ch 7 | Storm escape through falling fragments; Tock saves ARCHIVE from a Warden and is swept away |
| | Ch 8 | Black-hole slingshot; slipping past the Core's guards |
| | Ch 9 | Tock's return as a dive through the storm; the Wardens turn blue |

Also planned: more comedy beats (escalating Tock rules, ARCHIVE mishaps) and more driving music under the action.


With three inserts in (134 s), the edit now tightens the film's slow, silent stretches by about 7% (134 s saved), and the film still runs exactly 90:00.


## 24. Story v2: the Keystone, Magnus, the storyteller

**The story in one line.** ARCHIVE must find the four shards of the Keystone to restart the Loom's heart, while Magnus, the Warden Prime, hoards the network's light because he is afraid of going dark. In the end ARCHIVE wins him over instead of beating him.

**Built**
- **Narrator:** the storyteller (`zz_story_v2.js`) has 13 lines framing every chapter.
- **Readable holograms:** network integrity, the Keystone map, district loads, reef health, thread strength, the Seat, and a persistent "KEYSTONE ◆◆◇◇" counter.
- **Recording pipeline:**
  - Line IDs, with `vo/<ID>.wav` recordings placed automatically.
  - Your own music via `music/cues.json`.
  - Studio preview buttons for both.
  - `docs/RECORDING_SCRIPT.md`, generated by `node tools/make_script.js`.
- **Keystone shards** (`characters/keystone.glsl`, `zz_keystone_magnus_deep.js`):
  - Shard 1 rises from Verdance's fountain.
  - Shard 2 ejects from Ferrum's core once the grid is shared.
  - Shard 3 lies on the altar of Thalassa's sunken temple.
  - Shard 4 rises from the green world ARCHIVE held onto in Ch 7.
  - All four lock into the Seat as the Keystone in Ch 8.
- **Magnus** (Warden Prime: crown, double armour band, shoulder plates):
  - Seen towering over Ferrum's far district, drinking the leak.
  - CH09_INS1 is the battle; he becomes a friend and stays, blue-eyed, for the rest of Ch 9.
- **CH05_INS1 "The deep temple":**
  - A leviathan, a blue-hole dive and a sunken temple, with Wardens chased off by the leviathan's tail.
  - New underwater rendering: absorption, scattering, caustics, and the surface seen from below.
  - Fix: the farm island had been refilling the blue hole, so the hole is now carved last.
- **CH09_INS1 "Magnus":**
  - Magnus comes for the Keystone, Alicia stands in his way, and ARCHIVE alone is swatted aside.
  - The worlds' light converges, and MEGA-ARCHIVE (a giant hard-light ARCHIVE that mirrors ARCHIVE's own pose) forms.
  - They clash; then ARCHIVE pours light into Magnus instead of striking. His visor turns blue: "…I was afraid… of the dark." / "You don't have to hold it alone." / "…Together."

**Added since:** CH04_INS1 "Wardens in Ferrum" (36 s, spliced at story 1929): two Wardens drop out of the dark, hungry for the cable's power; a chase across the plaza and down the avenue; ARCHIVE times a dive across the rail so the surging train knocks them aside ("Tock—when I say now…" / "NOW!" / "Sorry! You'll get your share. I promise." / "You planned that?" / "…Mostly.").

**Added since:**
- CH06_INS1 "Pulse surfing" (44 s, spliced at story 3020): a pack of three Wardens; ARCHIVE and Tock ride a gold pulse along the threads, dive and pull up hard, and the pack overshoots into the dark ("Pulses only go one way!").
- CH07_INS1 "Storm run" (44 s, spliced at story 3312): weaving through debris and lightning; a Warden ambush catches ARCHIVE ("Let go! Let GO!"); Tock rams the Warden ("Courier rule one!"); lightning takes the other; "Thanks, partner." / "Rule one. Always."

**Still planned:** the black-hole slingshot (Ch 8), and Tock's storm dive (Ch 9). Magnus could also appear in Ch 10 as a friend.


## 25. 360° mode
- The shader has an equirectangular ray mode (`uEquirect`) centred on the film camera's forward direction, with the horizon kept level.
- The overlay is laid out for 360: titles, captions and HUD readouts in a 16:9 window straight ahead; world-anchored hologram labels are projected onto the sphere.
- The studio offers **Look around** (drag; front is the film camera) and **360 frame**.
- `render.mjs --360` renders 3840×1920 by default.
- Metadata injection for YouTube and headsets is documented in the README.

- **VR 3D 360:** omni-directional stereo, with each eye's rays offset along the tangent of a 6.4 cm viewing circle. The frame is top/bottom, left eye on top, 3840×3840 via `render.mjs --vr` or 2560×2560 from the studio recorder. The overlay is drawn once and copied into both eyes, so the text sits at a comfortable depth.
- **Fix:** the 360 overlay layout from the previous pass hadn't actually been applied (a code-anchor mismatch). It is now, so titles, captions and readouts sit straight ahead in 360 and VR.
