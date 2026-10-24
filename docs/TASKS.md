# Tasks

Priorities: **P1** = needed for the next milestone or the FLE event, **P2** = high value, **P3** = later. Keep this list in step with the code; move items to Done only when they work and are tested.

## Done (Phase 2, branch `phase-2`)

- [x] Audit all four projects; baseline render tests (17/17 pass), documented in PROJECT_STATUS.md
- [x] Shared world manifest format (`worlds/schema.json`) and journey format (`journeys/schema.json`); 17 world manifests, 4 journeys
- [x] Portal (`index.html`): gallery, Sustainability/Technology/Space filters, Time · Place · Purpose filters, time axis, journeys list; responsive
- [x] Shared Skyship Engine (`skyship-engine/journey.html`): data-driven, any number of worlds; original Sci-Fi page untouched
- [x] Proved modularity: the four Sci-Fi 360 worlds run unchanged on the shared engine (`scifi-classics`)
- [x] Explore and Learn modes: stops, hotspot markers, info cards with sources, ARCHIVE focus, lesson panel, questions
- [x] Journey menu inside the ship (the skyship as common transport between worlds)
- [x] Columbus 2050 world (artistic scenario) with 11 hotspots and 8 stops
- [x] Orbital habitat expanded with the Life Support Commons (food, water, energy, air) and a new flight path; original preserved
- [x] 90-second guided Columbus 2050 → orbit journey with a cloud-climb transition
- [x] Procedural journey score + pre-rendered MP3s
- [x] `render_journey.py`: 360 (with spherical metadata) and 16:9 output, resumable parts, `--bake-audio`
- [x] Film studio deep links (`?chapter=N`) so the portal opens each film world
- [x] Automated QA (`tools/qa/check_worlds.py`) and preview generator (`tools/qa/make_previews.py`)

## Active / next (P1)

- [ ] **Watch it on real hardware**: desktop GPU, a phone (iOS Safari and Android Chrome), and a WebXR headset. Note frame rate and any layout issues. *(Not possible in the build environment; it has no GPU.)*
- [ ] **Review Columbus 2050 content** with someone who knows downtown: landmark positions, which concepts to show, wording of the disclaimers
- [ ] **Full-length renders** of `columbus-to-orbit` on a GPU machine: 4K 360 and 1080p 16:9 (`render_journey.py`)
- [ ] **Decide hosting**: GitHub Pages needs the repo public or a paid plan; or deploy the static folder elsewhere (see DEPLOYMENT in PROJECT_STATUS.md). Needs Travis's approval.
- [ ] Merge `phase-2` into `main` after review

## Soon (P2)

- [ ] Columbus 2050 from real data: street grid, river centreline and building footprints/heights from OpenStreetMap / Franklin County GIS (the seam is `STREETS`, `riverX` and `buildLots()` in `columbus2050.js`)
- [ ] Hotspot markers inside VR (3D buttons, gaze or controller select); today markers are DOM overlays and hide in VR
- [ ] Spoken narration: record ARCHIVE lines (the film already has a VO pipeline) and add an optional `vo` field to cues
- [ ] Port the Skyship 360 city tour (Columbus, DC, NYC, Paris, London) into world modules so it gains Explore/Learn modes
- [ ] Add the World Tour short's source project (only the draft video and player are in the repo)
- [ ] Add the Windows GPU flags (already in `render_journey.py`) to `sci-fi-360/render_360.py` and `skyship-360/render_360.py`
- [ ] Performance budget on phones: lower tree/people counts or texture sizes when `devicePixelRatio`/GPU tier is low

## Later (P3)

- [ ] Interactive adaptations of film worlds (start with Verdance or Thalassa; see RECOMMENDATIONS.md)
- [ ] New worlds from the roadmap (AI & Robotics Lab, Mars Colony, Dyson Swarm, OSU Virtual Campus, Pollinator Ecosystems, …)
- [ ] HoloWatch / Holo-Screen content feeds from the world manifests
- [ ] Course integration: one journey per lesson of *Virtual Environments for a Better Future*
