# Changelog

## Phase 3: Columbus and Ohio State on real geography (branch `phase-3-columbus-osu`, October 2026)

### Added
- **OpenStreetMap pipeline**: `tools/gis/osm_world.py` (download from Overpass with mirrors, build compact layers), `tools/gis/verify_osm.py` (building count, size, real-download and landmark checks), and the `OpenStreetMap data` GitHub Actions workflow, which runs it on GitHub's servers, uploads the files as an artifact and commits only `data/gis/columbus-downtown.json` and `data/gis/osu-campus.json`.
- **Map data**: downtown Columbus (≈7,100 buildings) and the Ohio State campus (≈5,600 buildings). © OpenStreetMap contributors, ODbL 1.0.
- **City builder** `skyship-engine/js/gis.js`: extruded buildings with facades, roads and bridges, water, parks, trees; `Route`, `PathMovers`, `Walkers` for movement on real lines.
- **Ohio State campus world** (`osu_campus.js`, `worlds/osu-campus.json`) and the **Ohio State Campus** journey (66 s).
- **Today, 2050, Orbit** journey (2½ min): campus → Columbus 2050 → orbital habitat.
- Engine test hook `SKYSHIP.aim(t, anchor)`; QA `gis` group; "campus" place type.

### Changed
- **Columbus 2050** now runs on real geography (`columbus2050_gis.js`); the grid-based pilot module `columbus2050.js` is kept unchanged.
- Portal features the new journey with three panels; test shots in the Columbus and campus journeys are aimed at their landmarks.
- `osm_world.py`: river centerlines and named places become landmarks; Overpass error remarks are rejected.

### Building quality pass
- New facade system (`facades.js`): nine facade types at realistic window spacing, floors aligned to each building's storey height, pitched roofs on houses, parapets and rooftop units, storefront ground floors, per-building tints, gentler use of mapped colours.
- **Hand-modelled landmarks** (`landmarks.js`) on their real footprints: LeVeque Tower, Rhodes State Office Tower, Huntington Center, Ohio Statehouse, Nationwide Arena, Thompson Library, Ohio Union, Orton Hall, University Hall. References and approximations in `docs/LANDMARKS.md`. Replaces the simpler in-world LeVeque, Statehouse and Orton tower.
- **Second landmark batch**: One Nationwide Plaza, COSI, Ohio Theatre, Wexner Center, Lincoln and Morrill Towers, Hayes Hall; the Statehouse's stone made near-white after review.
- Building viewer for close-up QC (`tools/qa/gis_viewer.html?region=osu-campus|columbus-downtown&at=<landmark>`).

### Fixed
- Columbus river leg followed a far-away stretch of the Scioto (the river's map line runs outside the area); it now follows the real course through downtown.
- NaN geometry from zero-length bridge segments.

## Phase 2: Connected worlds (branch `phase-2`, October 2026)

### Added
- **Portal** (`index.html`, `portal/`): gallery of 17 worlds with real rendered previews; Sustainability (green), Technology (red) and Space (purple) themes; Time · Place · Purpose filters; a time axis from 1818 to tomorrow; journey list; light and dark themes; phone layout.
- **World manifests** (`worlds/*.json` + `schema.json`) and **journeys** (`journeys/*.json` + `schema.json`).
- **Skyship Engine** (`skyship-engine/`): a data-driven version of the Sci-Fi 360 page. Any set of worlds, Cinematic / Explore / Learn modes, stops, hotspots with sourced facts and questions, lesson panel, journey menu, disclaimers, test controls (`SKYSHIP.freeze/goto/step/state/clearance`).
- **Columbus 2050** (`skyship-engine/worlds/columbus2050.js`): Scioto River and urban forest, Scioto Mile, LeVeque Tower, Ohio Statehouse, Rhodes Tower, Huntington Center, COSI, green bridge, rapid transit on Broad and High, protected bike lanes with cyclists, autonomous pods, kayaks, rooftop vertiport with air taxis, mass-timber towers, green and solar roofs, wind turbines, solar canopy park, microgrid, people on the promenade, fountain. Marked as an artistic scenario.
- **Orbital habitat expansion** (`skyship-engine/worlds/orbital_habitat.js`): Life Support Commons with a vertical farm, water recycling loop, energy station (solar, flywheel, batteries) and algae photobioreactors, floating labels, and a new flight path. Wraps the original `world_orbit.js` unchanged.
- **Journeys**: `columbus-to-orbit` (90 s), `columbus-2050` (40 s), `orbital-habitat` (54 s), `scifi-classics` (3:00, the original four worlds).
- **Score composer** (`skyship-engine/js/score.js`) and pre-rendered soundtracks (`journeys/audio/`).
- **Renderer** (`skyship-engine/render_journey.py`): 360 and 16:9, resumable, Windows GPU flags, `--bake-audio`.
- **QA tools** (`tools/qa/check_worlds.py`, `tools/qa/make_previews.py`).
- **Docs**: PROJECT_STATUS, TASKS, ARCHITECTURE, WORLD_FORMAT, RECOMMENDATIONS, this changelog.

### Changed
- `worlds-within-worlds/src/app.js` (and the rebuilt `ARCHIVE_Studio.html`): `?chapter=N` and `?t=seconds` deep links. No other change; rebuilding with `build.py` reproduces the previous file byte for byte apart from these lines.
- Root `README.md` and `.gitignore`.

### Fixed (final pass, 24 October)
- Added the missing `docs/PROJECT_STATUS.md` (the portal and README linked to it) with full test results.
- Committed the four film-world preview images the manifests already referenced (Loom, Thalassa, Lost Worlds, Cosmic Core).
- Sci-Fi classics timeline screen: short year labels (`yearShort`) and custom spacing (`timelineX`) so "TOMORROW" no longer crowds its neighbours.
- Portal hero: captions now sit on a dark pill so "Orbital habitat" stays readable over the white habitat tower.

### Unchanged (verified)
- `sci-fi-360/`, `skyship-360/`, `world-tour/`, and the film engine's rendering code. Baseline tests pass before and after.

## Phase 1 (October 2026)
- Repository created with `skyship-360/`, `sci-fi-360/`, `worlds-within-worlds/`, `world-tour/`.
